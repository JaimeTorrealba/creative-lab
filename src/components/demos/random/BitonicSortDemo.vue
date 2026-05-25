<script setup>
import { ref, watch, onMounted } from 'vue'

const SIZE_OPTIONS = [
  { label: '1 K  (1,024)', value: 1024 },
  { label: '8 K  (8,192)', value: 8192 },
  { label: '128 K  (131,072)', value: 131072 },
  { label: '1 M  (1,048,576)', value: 1048576 },
  { label: '4 M  (4,194,304)', value: 4194304 },
]

const selectedSize = ref(1024)
const originalArray = ref(null)
const cpuTime = ref(null)
const gpuTime = ref(null)
const cpuResult = ref(null)
const gpuResult = ref(null)
const gpuError = ref(null)
const isSorting = ref(false)
const canvasRef = ref(null)

function generateArray(n) {
  const arr = new Float32Array(n)
  for (let i = 0; i < n; i++) arr[i] = Math.random() * 10000
  return arr
}

// Sample data down to at most maxBars columns for the canvas
const MAX_BARS = 2048

function drawBars(data, color) {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height
  ctx.clearRect(0, 0, W, H)
  const step = Math.max(1, Math.floor(data.length / MAX_BARS))
  const bars = Math.ceil(data.length / step)
  let max = 0
  for (let i = 0; i < data.length; i += step) if (data[i] > max) max = data[i]
  const barW = W / bars
  ctx.fillStyle = color
  for (let b = 0; b < bars; b++) {
    const v = data[b * step]
    const h = (v / max) * H
    ctx.fillRect(b * barW, H - h, Math.max(barW - 0.3, 0.5), h)
  }
}

function reset() {
  cpuTime.value = null
  gpuTime.value = null
  cpuResult.value = null
  gpuResult.value = null
  gpuError.value = null
  const arr = generateArray(selectedSize.value)
  originalArray.value = arr
  drawBars(arr, '#444')
}

watch(selectedSize, reset)
onMounted(reset)

async function sortCPU() {
  isSorting.value = true
  gpuError.value = null
  const arr = Array.from(originalArray.value)
  const t0 = performance.now()
  arr.sort((a, b) => a - b)
  cpuTime.value = (performance.now() - t0).toFixed(3)
  cpuResult.value = arr
  drawBars(arr, '#4fc3f7')
  isSorting.value = false
}

async function sortGPU() {
  isSorting.value = true
  gpuError.value = null

  if (!navigator.gpu) {
    gpuError.value = 'WebGPU is not supported in this browser (try Chrome 113+).'
    isSorting.value = false
    return
  }

  try {
    const adapter = await navigator.gpu.requestAdapter()
    if (!adapter) throw new Error('No GPU adapter found.')
    const device = await adapter.requestDevice()

    const n = selectedSize.value
    const bytes = n * 4

    const dataBuffer = device.createBuffer({
      size: bytes,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    })
    device.queue.writeBuffer(dataBuffer, 0, originalArray.value)

    const readBuffer = device.createBuffer({
      size: bytes,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    })

    const shaderModule = device.createShaderModule({
      code: `
        struct Params { k: u32, j: u32 }
        @group(0) @binding(0) var<storage, read_write> data: array<f32>;
        @group(0) @binding(1) var<uniform> params: Params;

        @compute @workgroup_size(256)
        fn main(@builtin(global_invocation_id) id: vec3<u32>) {
          let i = id.x;
          let l = i ^ params.j;
          if (l > i && l < ${n}u) {
            let ascending = (i & params.k) == 0u;
            if ((data[i] > data[l]) == ascending) {
              let tmp = data[i];
              data[i] = data[l];
              data[l] = tmp;
            }
          }
        }
      `,
    })

    const bindGroupLayout = device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
      ],
    })

    const pipeline = device.createComputePipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
      compute: { module: shaderModule, entryPoint: 'main' },
    })

    // Pre-create one bind group per (k, j) step — all uniform buffers written before submit
    const bindGroups = []
    for (let k = 2; k <= n; k <<= 1) {
      for (let j = k >> 1; j >= 1; j >>= 1) {
        const paramsBuf = device.createBuffer({
          size: 8,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })
        device.queue.writeBuffer(paramsBuf, 0, new Uint32Array([k, j]))
        bindGroups.push(
          device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
              { binding: 0, resource: { buffer: dataBuffer } },
              { binding: 1, resource: { buffer: paramsBuf } },
            ],
          })
        )
      }
    }

    // All passes in a single command encoder → one submit
    const t0 = performance.now()
    const encoder = device.createCommandEncoder()
    for (const bg of bindGroups) {
      const pass = encoder.beginComputePass()
      pass.setPipeline(pipeline)
      pass.setBindGroup(0, bg)
      pass.dispatchWorkgroups(Math.ceil(n / 256))
      pass.end()
    }
    device.queue.submit([encoder.finish()])
    await device.queue.onSubmittedWorkDone()
    gpuTime.value = (performance.now() - t0).toFixed(3)

    const readEncoder = device.createCommandEncoder()
    readEncoder.copyBufferToBuffer(dataBuffer, 0, readBuffer, 0, bytes)
    device.queue.submit([readEncoder.finish()])
    await readBuffer.mapAsync(GPUMapMode.READ)
    const result = Array.from(new Float32Array(readBuffer.getMappedRange()))
    readBuffer.unmap()

    gpuResult.value = result
    drawBars(result, '#a5d6a7')
  } catch (e) {
    gpuError.value = e.message
  }

  isSorting.value = false
}

function fmt(arr, n) {
  return arr.slice(0, n).map(v => v.toFixed(1)).join(', ')
}
</script>

<template>
  <div class="root">
    <div class="card">
      <h1>Bitonic Sort</h1>
      <p class="sub">CPU (JS Array.sort) vs GPU (WebGPU compute shader)</p>

      <div class="size-row">
        <label for="size-select">Array size</label>
        <select id="size-select" v-model.number="selectedSize" :disabled="isSorting">
          <option v-for="opt in SIZE_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <span class="note">must be power of 2 for bitonic sort</span>
      </div>

      <div class="btns">
        <button class="btn cpu" :disabled="isSorting" @click="sortCPU">
          A &nbsp; Sort on CPU
        </button>
        <button class="btn gpu" :disabled="isSorting" @click="sortGPU">
          B &nbsp; Sort on GPU
        </button>
      </div>

      <div v-if="gpuError" class="error">{{ gpuError }}</div>

      <div class="stats">
        <div class="stat" :class="{ lit: cpuTime !== null }">
          <span class="stat-label">CPU time</span>
          <span class="stat-val">{{ cpuTime !== null ? cpuTime + ' ms' : '—' }}</span>
        </div>
        <div class="stat" :class="{ lit: gpuTime !== null }">
          <span class="stat-label">GPU time</span>
          <span class="stat-val">{{ gpuTime !== null ? gpuTime + ' ms' : '—' }}</span>
        </div>
        <div v-if="cpuTime && gpuTime" class="stat winner">
          <span class="stat-label">Winner</span>
          <span class="stat-val">
            {{ +cpuTime < +gpuTime ? '⚡ CPU' : '⚡ GPU' }}
            <small>({{ Math.abs(+cpuTime - +gpuTime).toFixed(2) }} ms faster)</small>
          </span>
        </div>
      </div>

      <canvas ref="canvasRef" width="2048" height="180" class="viz" />

      <div v-if="cpuResult || gpuResult" class="preview">
        <div v-if="cpuResult" class="preview-row">
          <span class="tag cpu-tag">CPU</span>
          <span>{{ fmt(cpuResult, 6) }} … {{ fmt(cpuResult.slice(-6), 6) }}</span>
        </div>
        <div v-if="gpuResult" class="preview-row">
          <span class="tag gpu-tag">GPU</span>
          <span>{{ fmt(gpuResult, 6) }} … {{ fmt(gpuResult.slice(-6), 6) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.root {
  min-height: 100vh;
  background: #0d0d0d;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: 'Courier New', monospace;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.4rem;
  max-width: 900px;
  width: 100%;
}

h1 {
  font-size: 2rem;
  color: #eee;
  margin: 0;
  letter-spacing: 0.04em;
}

.sub {
  color: #666;
  margin: 0;
  font-size: 0.85rem;
}

.size-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.85rem;
  color: #888;
}

.size-row label {
  color: #aaa;
}

select {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 5px;
  color: #eee;
  font-family: inherit;
  font-size: 0.85rem;
  padding: 0.35rem 0.7rem;
  cursor: pointer;
  outline: none;
}

select:disabled { opacity: 0.4; cursor: not-allowed; }
select:focus { border-color: #555; }

.note {
  font-size: 0.72rem;
  color: #555;
}

.btns {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.7rem 1.8rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.15s, filter 0.15s;
  letter-spacing: 0.03em;
}

.btn:disabled { opacity: 0.35; cursor: not-allowed; }
.btn.cpu { background: #1565c0; color: #fff; }
.btn.cpu:hover:not(:disabled) { filter: brightness(1.2); }
.btn.gpu { background: #2e7d32; color: #fff; }
.btn.gpu:hover:not(:disabled) { filter: brightness(1.2); }

.stats {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;
}

.stat {
  background: #161616;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 0.8rem 1.4rem;
  text-align: center;
  min-width: 130px;
  transition: border-color 0.3s;
}

.stat.lit { border-color: #444; }
.stat.winner { border-color: #ffd54f; }

.stat-label {
  display: block;
  font-size: 0.7rem;
  color: #666;
  margin-bottom: 0.3rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.stat-val {
  font-size: 1.15rem;
  color: #eee;
  font-weight: bold;
}

.stat-val small {
  display: block;
  font-size: 0.7rem;
  color: #aaa;
  font-weight: normal;
  margin-top: 0.15rem;
}

.viz {
  border: 1px solid #222;
  border-radius: 4px;
  width: 100%;
  max-width: 860px;
  height: 180px;
  display: block;
}

.preview {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.78rem;
  color: #888;
  width: 100%;
  max-width: 860px;
}

.preview-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag {
  padding: 0.1rem 0.45rem;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: bold;
  flex-shrink: 0;
}

.cpu-tag { background: #1565c0; color: #fff; }
.gpu-tag { background: #2e7d32; color: #fff; }

.error {
  color: #ef5350;
  background: #1a0a0a;
  border: 1px solid #ef5350;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
}
</style>
