<script setup>
import { ref, onMounted } from 'vue'

const canvas = ref(null)

onMounted(() => {
  const el = canvas.value
  if (!el) return

  // Ensure the canvas matches the displayed size and devicePixelRatio
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
  const resize = () => {
    const rect = el.getBoundingClientRect()
    el.width = Math.floor(rect.width * dpr)
    el.height = Math.floor(rect.height * dpr)
  }
  resize()

  const gl = el.getContext('webgl')
  if (!gl) {
    console.warn('WebGL not supported')
    return
  }

  // Basic shaders
  const vsSource = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `

  const fsSource = `
    precision mediump float;
    uniform vec4 u_color;
    void main() {
      gl_FragColor = u_color;
    }
  `

  const compileShader = (type, source) => {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }
    return shader
  }

  const vs = compileShader(gl.VERTEX_SHADER, vsSource)
  const fs = compileShader(gl.FRAGMENT_SHADER, fsSource)
  if (!vs || !fs) return

  const program = gl.createProgram()
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return
  }
  gl.useProgram(program)

  // Triangle positions (clip space)
  const positions = new Float32Array([
    0.0, 0.6,
    -0.6, -0.6,
    0.6, -0.6,
  ])

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

  const aPositionLoc = gl.getAttribLocation(program, 'a_position')
  gl.enableVertexAttribArray(aPositionLoc)
  gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0)

  const uColorLoc = gl.getUniformLocation(program, 'u_color')

  // Clear and draw
  gl.viewport(0, 0, el.width, el.height)
  gl.clearColor(0.07, 0.07, 0.07, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  gl.uniform4f(uColorLoc, 1.0, 0.4, 0.2, 1.0)
  gl.drawArrays(gl.TRIANGLES, 0, 3)

  // Handle window resizes
  const onResize = () => {
    resize()
    gl.viewport(0, 0, el.width, el.height)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
  window.addEventListener('resize', onResize)
})
</script>

<template>
  <div style="width:100%;height:100vh;background:#111;">
    <canvas ref="canvas" style="display:block;width:100%;height:100%;"></canvas>
  </div>
  
</template>
