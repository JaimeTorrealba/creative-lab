import { HITTABLE_LIST_BYTE_SIZE } from './rtweekend/hittable_list'

const WORKGROUP_SIZE = 8
const PREVIEW_INTERVAL_MS = 1000

// Stands in for `std::cout`: each invocation writes its pixel instead of a PPM text line.
// pixel_sums/render_pass let one image be rendered over several dispatches (see camera_render).
export const output = /* wgsl */ `
struct render_pass_info {
  sample_start: u32,
  sample_count: u32,
  seed_offset: u32, // 0 here; the real-time demo changes it every frame
}

@group(0) @binding(0) var<storage, read_write> pixels: array<u32>;
@group(0) @binding(1) var<storage, read_write> pixel_sums: array<vec4f>;
@group(0) @binding(2) var<uniform> render_pass: render_pass_info;
var<private> pixel_index: u32;

fn write_pixel(ir: i32, ig: i32, ib: i32) {
  pixels[pixel_index] = u32(ir) | (u32(ig) << 8u) | (u32(ib) << 16u) | (255u << 24u);
}

// Adds this dispatch's samples to the pixel's running sum and returns the sum so far.
fn accumulate_pixel_color(pixel_color: vec3f) -> vec3f {
  let pixel_sum = pixel_sums[pixel_index].xyz + pixel_color;
  pixel_sums[pixel_index] = vec4f(pixel_sum, 0.0);
  return pixel_sum;
}
`

// The book's formula: int(image_width / aspect_ratio), at least 1.
export const computeImageHeight = (imageWidth, aspectRatio) =>
  Math.max(1, Math.trunc(imageWidth / aspectRatio))

export const requestRTDevice = async () => {
  if (!('gpu' in navigator)) return null
  const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' })
  if (!adapter) return null
  return adapter.requestDevice()
}

export const logShaderErrors = async (shaderModule) => {
  const { messages } = await shaderModule.getCompilationInfo()
  messages
    .filter(({ type }) => type === 'error')
    .forEach(({ lineNum, linePos, message }) =>
      console.error(`WGSL ${lineNum}:${linePos} ${message}`)
    )
}

const BINDING_TYPES = ['storage', 'storage', 'uniform', 'storage']

// Explicit (not 'auto') so every shader shares one layout, whichever bindings it uses.
const createRTPipelineLayout = (device) => {
  const bindGroupLayout = device.createBindGroupLayout({
    entries: BINDING_TYPES.map((type, binding) => ({
      binding,
      visibility: GPUShaderStage.COMPUTE,
      buffer: { type }
    }))
  })
  return {
    bindGroupLayout,
    pipelineLayout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] })
  }
}

const createBufferBySize = (device, size, usage) => device.createBuffer({ size, usage })

const createRenderBuffers = (device, width, height) => {
  const { STORAGE, COPY_SRC, COPY_DST, MAP_READ, UNIFORM } = GPUBufferUsage
  return {
    pixels: createBufferBySize(device, width * height * 4, STORAGE | COPY_SRC),
    readback: createBufferBySize(device, width * height * 4, MAP_READ | COPY_DST),
    pixelSums: createBufferBySize(device, width * height * 16, STORAGE),
    renderPass: createBufferBySize(device, 16, UNIFORM | COPY_DST),
    world: createBufferBySize(device, HITTABLE_LIST_BYTE_SIZE, STORAGE)
  }
}

const createRenderBindGroup = (device, bindGroupLayout, buffers) =>
  device.createBindGroup({
    layout: bindGroupLayout,
    entries: [buffers.pixels, buffers.pixelSums, buffers.renderPass, buffers.world].map(
      (buffer, binding) => ({ binding, resource: { buffer } })
    )
  })

const createPipelineByEntryPoint = (device, { shaderModule, pipelineLayout }, entryPoint) =>
  device.createComputePipelineAsync({
    layout: pipelineLayout,
    compute: { module: shaderModule, entryPoint }
  })

const dispatchCompute = (device, { pipeline, bindGroup, workgroupsX, workgroupsY }) => {
  const encoder = device.createCommandEncoder()
  const pass = encoder.beginComputePass()
  pass.setPipeline(pipeline)
  pass.setBindGroup(0, bindGroup)
  pass.dispatchWorkgroups(workgroupsX, workgroupsY)
  pass.end()
  device.queue.submit([encoder.finish()])
  return device.queue.onSubmittedWorkDone()
}

// Runs the scene's `build_world` entry point (the book's world setup in main()) on one thread.
const buildWorld = async (device, shader, bindGroup) => {
  if (!shader.code.includes('fn build_world(')) return
  const pipeline = await createPipelineByEntryPoint(device, shader, 'build_world')
  await dispatchCompute(device, { pipeline, bindGroup, workgroupsX: 1, workgroupsY: 1 })
}

const readPixelBytes = async (device, buffers) => {
  const encoder = device.createCommandEncoder()
  encoder.copyBufferToBuffer(buffers.pixels, 0, buffers.readback, 0, buffers.pixels.size)
  device.queue.submit([encoder.finish()])
  await buffers.readback.mapAsync(GPUMapMode.READ)
  const bytes = new Uint8ClampedArray(buffers.readback.getMappedRange().slice(0))
  buffers.readback.unmap()
  return bytes
}

const bytesToObjectURL = async (bytes, width, height) => {
  const canvas = new OffscreenCanvas(width, height)
  canvas.getContext('2d').putImageData(new ImageData(bytes, width, height), 0, 0)
  const blob = await canvas.convertToBlob({ type: 'image/png' })
  return URL.createObjectURL(blob)
}

const readImageURL = async (device, buffers, width, height) =>
  bytesToObjectURL(await readPixelBytes(device, buffers), width, height)

// Each pass is its own submit so no single command buffer runs long enough to trip the
// GPU watchdog; the shader adds `sample_count` samples per pixel to pixel_sums.
const renderSamplePasses = async (device, { image, pipeline, bindGroup, buffers }, callbacks) => {
  const { image_width, image_height, samples_per_pixel = 1 } = image
  const { samples_per_pass = samples_per_pixel } = image
  const workgroupsX = Math.ceil(image_width / WORKGROUP_SIZE)
  const workgroupsY = Math.ceil(image_height / WORKGROUP_SIZE)
  let lastPreviewTime = performance.now()

  for (let sampleStart = 0; sampleStart < samples_per_pixel; sampleStart += samples_per_pass) {
    if (callbacks.shouldStop?.()) return false
    const sampleCount = Math.min(samples_per_pass, samples_per_pixel - sampleStart)
    device.queue.writeBuffer(buffers.renderPass, 0, new Uint32Array([sampleStart, sampleCount]))
    await dispatchCompute(device, { pipeline, bindGroup, workgroupsX, workgroupsY })

    const samplesDone = sampleStart + sampleCount
    const isPreviewDue = performance.now() - lastPreviewTime > PREVIEW_INTERVAL_MS
    if (callbacks.onPreview && isPreviewDue && samplesDone < samples_per_pixel) {
      const url = await readImageURL(device, buffers, image_width, image_height)
      callbacks.onPreview({ url, samplesDone })
      lastPreviewTime = performance.now()
    }
  }
  return true
}

const destroyBuffers = (buffers) => Object.values(buffers).forEach((buffer) => buffer.destroy())

// Runs a WGSL compute shader (one invocation per pixel, writing packed RGBA to
// @group(0) @binding(0)) and returns the result as a PNG object URL, or null if stopped.
// `image` is { code, image_width, image_height, samples_per_pixel?, samples_per_pass? }.
export const renderComputeToImage = async ({ device, image, onPreview, shouldStop }) => {
  const shaderModule = device.createShaderModule({ code: image.code })
  await logShaderErrors(shaderModule)
  const { bindGroupLayout, pipelineLayout } = createRTPipelineLayout(device)
  const shader = { code: image.code, shaderModule, pipelineLayout }
  const pipeline = await createPipelineByEntryPoint(device, shader, 'main')
  const buffers = createRenderBuffers(device, image.image_width, image.image_height)
  const bindGroup = createRenderBindGroup(device, bindGroupLayout, buffers)

  try {
    await buildWorld(device, shader, bindGroup)
    const render = { image, pipeline, bindGroup, buffers }
    const isComplete = await renderSamplePasses(device, render, { onPreview, shouldStop })
    if (!isComplete) return null
    return await readImageURL(device, buffers, image.image_width, image.image_height)
  } finally {
    destroyBuffers(buffers)
  }
}
