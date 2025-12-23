<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)

onMounted(async () => {
  const el = canvas.value
  if (!el) return

  if (!('gpu' in navigator)) {
    console.warn('WebGPU not supported in this browser')
    return
  }

  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
  const resize = () => {
    const rect = el.getBoundingClientRect()
    el.width = Math.floor(rect.width * dpr)
    el.height = Math.floor(rect.height * dpr)
  }
  resize()

  const context = el.getContext('webgpu')
  if (!context) {
    console.warn('Failed to get WebGPU context')
    return
  }

  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) {
    console.warn('Failed to acquire GPU adapter')
    return
  }
  const device = await adapter.requestDevice()
  const format = navigator.gpu.getPreferredCanvasFormat()

  const configure = () => {
    context.configure({ device, format, alphaMode: 'opaque' })
  }
  configure()

  const vertexWGSL = `
    struct VSOut {
      @builtin(position) pos : vec4<f32>,
    };
    @vertex
    fn main(@builtin(vertex_index) vertexIndex : u32) -> VSOut {
      var positions = array<vec2<f32>, 3>(
        vec2<f32>(0.0, 0.6),
        vec2<f32>(-0.6, -0.6),
        vec2<f32>(0.6, -0.6)
      );
      var out : VSOut;
      out.pos = vec4<f32>(positions[vertexIndex], 0.0, 1.0);
      return out;
    }
  `

  const fragmentWGSL = `
    @fragment
    fn main() -> @location(0) vec4<f32> {
      return vec4<f32>(1.0, 0.4, 0.2, 1.0);
    }
  `

  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module: device.createShaderModule({ code: vertexWGSL }), entryPoint: 'main' },
    fragment: {
      module: device.createShaderModule({ code: fragmentWGSL }),
      entryPoint: 'main',
      targets: [{ format }],
    },
    primitive: { topology: 'triangle-list' },
  })

  const draw = () => {
    const encoder = device.createCommandEncoder()
    const view = context.getCurrentTexture().createView()
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view,
        clearValue: { r: 0.07, g: 0.07, b: 0.07, a: 1.0 },
        loadOp: 'clear',
        storeOp: 'store',
      }],
    })
    pass.setPipeline(pipeline)
    pass.draw(3, 1, 0, 0)
    pass.end()
    device.queue.submit([encoder.finish()])
  }

  draw()

  const onResize = () => {
    resize()
    configure()
    draw()
  }
  window.addEventListener('resize', onResize)

  onUnmounted(() => {
    window.removeEventListener('resize', onResize)
  })
})
</script>

<template>
  <div style="width:100%;height:100vh;background:#111;">
    <canvas ref="canvas" style="display:block;width:100%;height:100%;"></canvas>
  </div>
  
</template>
