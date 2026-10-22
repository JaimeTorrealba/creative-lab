import { logShaderErrors } from '@/utils/renderComputeToImage'
import { HITTABLE_LIST_BYTE_SIZE } from '@/utils/rtweekend/hittable_list'
import { RENDER_SHADER, BLIT_SHADER } from './shaders'

const WORKGROUP_SIZE = 8
const CAMERA_SETTINGS_BYTES = 64
const RENDER_PASS_BYTES = 16

// Mirrors `struct camera_settings` in shaders.js.
const packCameraSettings = ({ view, params, width, height }) => {
  const buffer = new ArrayBuffer(CAMERA_SETTINGS_BYTES)
  const floats = new Float32Array(buffer)
  const ints = new Int32Array(buffer)
  floats.set([...view.lookfrom, params.vfov, ...view.lookat, params.defocus_angle], 0)
  floats.set([...view.vup, params.focus_dist], 8)
  ints.set([width, height, params.samples_per_pixel, params.max_depth], 12)
  return buffer
}

const createShaderModuleByCode = (device, code) => {
  const shaderModule = device.createShaderModule({ code })
  logShaderErrors(shaderModule)
  return shaderModule
}

const createPipelines = async (device, format) => {
  const renderModule = createShaderModuleByCode(device, RENDER_SHADER)
  const blitModule = createShaderModuleByCode(device, BLIT_SHADER)
  const [render, blit] = await Promise.all([
    device.createComputePipelineAsync({
      layout: 'auto',
      compute: { module: renderModule, entryPoint: 'main' }
    }),
    device.createRenderPipelineAsync({
      layout: 'auto',
      vertex: { module: blitModule, entryPoint: 'vertex_main' },
      fragment: { module: blitModule, entryPoint: 'fragment_main', targets: [{ format }] },
      primitive: { topology: 'triangle-list' }
    })
  ])
  return { render, blit }
}

const createBufferWithData = (device, size, usage, data) => {
  const buffer = device.createBuffer({ size, usage: usage | GPUBufferUsage.COPY_DST })
  device.queue.writeBuffer(buffer, 0, data)
  return buffer
}

// World and BVH never change; the two uniforms are rewritten every frame.
const createSceneBuffers = (device, { hittableList, bvhNodes }) => {
  const { STORAGE, UNIFORM, COPY_DST } = GPUBufferUsage
  return {
    world: createBufferWithData(device, HITTABLE_LIST_BYTE_SIZE, STORAGE, hittableList),
    bvhNodes: createBufferWithData(device, bvhNodes.byteLength, STORAGE, bvhNodes),
    renderPass: device.createBuffer({ size: RENDER_PASS_BYTES, usage: UNIFORM | COPY_DST }),
    cameraSettings: device.createBuffer({ size: CAMERA_SETTINGS_BYTES, usage: UNIFORM | COPY_DST })
  }
}

const createImageBuffers = (device, width, height) => {
  const { STORAGE, COPY_DST } = GPUBufferUsage
  return {
    pixels: device.createBuffer({ size: width * height * 4, usage: STORAGE }),
    pixelSums: device.createBuffer({ size: width * height * 16, usage: STORAGE | COPY_DST })
  }
}

const createBindGroupByBuffers = (device, pipeline, buffers) =>
  device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: buffers.map(([binding, buffer]) => ({ binding, resource: { buffer } }))
  })

const createBindGroups = (device, pipelines, scene, image) => ({
  render: createBindGroupByBuffers(device, pipelines.render, [
    [0, image.pixels],
    [1, image.pixelSums],
    [2, scene.renderPass],
    [3, scene.world],
    [4, scene.bvhNodes],
    [5, scene.cameraSettings]
  ]),
  blit: createBindGroupByBuffers(device, pipelines.blit, [
    [0, image.pixels],
    [1, scene.cameraSettings]
  ])
})

const encodeRenderPass = (encoder, { pipeline, bindGroup, width, height }) => {
  const pass = encoder.beginComputePass()
  pass.setPipeline(pipeline)
  pass.setBindGroup(0, bindGroup)
  pass.dispatchWorkgroups(Math.ceil(width / WORKGROUP_SIZE), Math.ceil(height / WORKGROUP_SIZE))
  pass.end()
}

const encodeBlitPass = (encoder, { pipeline, bindGroup, view }) => {
  const pass = encoder.beginRenderPass({
    colorAttachments: [{ view, loadOp: 'clear', storeOp: 'store', clearValue: [0, 0, 0, 1] }]
  })
  pass.setPipeline(pipeline)
  pass.setBindGroup(0, bindGroup)
  pass.draw(3)
  pass.end()
}

// Path traces the final scene into `canvas`, a few samples per frame, accumulating while the
// camera holds still. `world` is { hittableList, bvhNodes } from world/index.js.
export const createRealtimeRenderer = async ({ device, canvas, world }) => {
  const context = canvas.getContext('webgpu')
  const format = navigator.gpu.getPreferredCanvasFormat()
  context.configure({ device, format, alphaMode: 'opaque' })

  const pipelines = await createPipelines(device, format)
  const scene = createSceneBuffers(device, world)
  let image = null
  let bindGroups = null
  let size = { width: 0, height: 0 }

  const resize = (width, height) => {
    image?.pixels.destroy()
    image?.pixelSums.destroy()
    canvas.width = width
    canvas.height = height
    size = { width, height }
    image = createImageBuffers(device, width, height)
    bindGroups = createBindGroups(device, pipelines, scene, image)
  }

  // Adds `sampleCount` samples per pixel; sampleStart 0 starts a new accumulation.
  const renderFrame = ({ view, params, sampleStart, sampleCount, seedOffset }) => {
    const { width, height } = size
    const renderPass = new Uint32Array([sampleStart, sampleCount, seedOffset])
    device.queue.writeBuffer(scene.renderPass, 0, renderPass)
    const settings = packCameraSettings({ view, params, width, height })
    device.queue.writeBuffer(scene.cameraSettings, 0, settings)

    const encoder = device.createCommandEncoder()
    if (sampleStart === 0) encoder.clearBuffer(image.pixelSums, 0, image.pixelSums.size)
    const render = { pipeline: pipelines.render, bindGroup: bindGroups.render, width, height }
    encodeRenderPass(encoder, render)
    const blit = { pipeline: pipelines.blit, bindGroup: bindGroups.blit }
    encodeBlitPass(encoder, { ...blit, view: context.getCurrentTexture().createView() })
    device.queue.submit([encoder.finish()])
    return device.queue.onSubmittedWorkDone()
  }

  const destroy = () => {
    Object.values(scene).forEach((buffer) => buffer.destroy())
    image?.pixels.destroy()
    image?.pixelSums.destroy()
    context.unconfigure()
  }

  return { resize, renderFrame, destroy, getSize: () => size }
}
