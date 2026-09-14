<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three/webgpu'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { createSmokeVolume, regenerateSmokeVolume } from './volume'
import { createPipelines } from './raymarch'
import { ESTIMATOR_NAMES, params, u } from './params'
import { setupUI } from './ui'

// This demo bypasses TresCanvas: it renders via THREE.WebGPURenderer with
// node-based TSL shaders and a manual ping-pong accumulation loop that
// draws two full-screen quads directly (never `renderer.render(scene, camera)`).
// That doesn't fit TresCanvas's declarative scene graph or its synchronous
// `:renderer` factory (which can't await `renderer.init()` before first use),
// so the component owns its own canvas + renderer lifecycle instead.

const containerRef = ref()
const overlayText = ref('')
const errorMessage = ref('')

const state = {
  frame: 0 // accumulated samples per pixel
}

let renderer
let controls
let pane
let resizeHandler
let rtRead
let rtWrite

function reset() {
  state.frame = 0
}

onMounted(async () => {
  try {
    overlayText.value = 'generating volume…'

    renderer = new THREE.WebGPURenderer({ antialias: false })
    await renderer.init()
    containerRef.value.appendChild(renderer.domElement)

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(2.3, 0.7, 3.1)
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.target.set(0, 0, 0)

    // let the overlay paint before the ~1s synchronous bake
    await new Promise((r) => setTimeout(r, 30))
    const volume = createSmokeVolume(128, params.seed)
    u.majorant.value = volume.maxDensity * params.densityScale

    function regenerateVolume() {
      const maxDensity = regenerateSmokeVolume(volume, params.seed)
      u.majorant.value = maxDensity * params.densityScale
      reset()
    }

    const makeRT = () =>
      new THREE.RenderTarget(1, 1, {
        // float32 + nearest: exact ping-pong accumulation, no filterable-float
        // feature requirement
        type: THREE.FloatType,
        format: THREE.RGBAFormat,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        generateMipmaps: false,
        depthBuffer: false
      })

    rtRead = makeRT()
    rtWrite = makeRT()

    const pipelines = createPipelines(volume.texture, rtRead, rtWrite)

    const sampleMat = new THREE.MeshBasicNodeMaterial()
    // fragmentNode bypasses tonemapping/colorspace: the RT holds raw data
    sampleMat.fragmentNode = pipelines.sampleNode
    const sampleQuad = new THREE.QuadMesh(sampleMat)

    const displayMat = new THREE.MeshBasicNodeMaterial()
    displayMat.colorNode = pipelines.displayNode
    const displayQuad = new THREE.QuadMesh(displayMat)

    function resize() {
      const w = containerRef.value.clientWidth
      const h = containerRef.value.clientHeight
      const dpr = Math.min(window.devicePixelRatio, 2)
      renderer.setPixelRatio(dpr)
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()

      const rw = Math.max(1, Math.round(w * dpr * params.renderScale))
      const rh = Math.max(1, Math.round(h * dpr * params.renderScale))
      rtRead.setSize(rw, rh)
      rtWrite.setSize(rw, rh)
      u.resolution.value.set(rw, rh)
      u.aspect.value = rw / rh
      u.tanHalfFov.value = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)
      reset()
    }
    resizeHandler = resize
    window.addEventListener('resize', resizeHandler)
    resize()

    pane = setupUI({ getMaxDensity: () => volume.maxDensity, reset, resize, regenerateVolume })

    const lastMatrix = new THREE.Matrix4()
    const fps = { last: performance.now(), frames: 0, value: 0 }

    function updateCameraUniforms() {
      const e = camera.matrixWorld.elements
      u.camRight.value.set(e[0], e[1], e[2])
      u.camUp.value.set(e[4], e[5], e[6])
      u.camFwd.value.set(-e[8], -e[9], -e[10])
      u.camPos.value.copy(camera.position)
    }

    function updateOverlay() {
      fps.frames++
      const now = performance.now()
      if (now - fps.last > 500) {
        fps.value = Math.round((fps.frames * 1000) / (now - fps.last))
        fps.last = now
        fps.frames = 0
      }
      const backend = renderer.backend.isWebGPUBackend ? 'WebGPU' : 'WebGL2 fallback'
      const a = ESTIMATOR_NAMES[params.estimatorA]
      const b = ESTIMATOR_NAMES[params.estimatorB]
      const view =
        params.viewMode === 0
          ? `A: ${a}  |  B: ${b}`
          : params.viewMode === 1
            ? `A: ${a}`
            : `|A − reference| · A: ${a}`
      overlayText.value = `${backend} · ${rtRead.width}×${rtRead.height} · ${state.frame} spp · ${fps.value} fps · ${view}`
    }

    renderer.setAnimationLoop(() => {
      controls.update()
      camera.updateMatrixWorld()
      if (!lastMatrix.equals(camera.matrixWorld)) {
        lastMatrix.copy(camera.matrixWorld)
        reset()
      }
      updateCameraUniforms()

      if (params.accumulate || state.frame === 0) {
        u.frame.value = state.frame
        pipelines.prevAccumTex.value = rtRead.texture
        renderer.setRenderTarget(rtWrite)
        sampleQuad.render(renderer)
        renderer.setRenderTarget(null)
        ;[rtRead, rtWrite] = [rtWrite, rtRead]
        state.frame++
      }

      pipelines.accumTex.value = rtRead.texture // most recently written
      displayQuad.render(renderer)
      updateOverlay()
    })
  } catch (err) {
    console.error(err)
    errorMessage.value = `Failed to start: ${err instanceof Error ? err.message : String(err)}. This demo needs WebGPU (or WebGL2 as fallback). Try a recent Chrome/Edge.`
  }
})

onUnmounted(() => {
  if (renderer) {
    renderer.setAnimationLoop(null)
    renderer.dispose()
  }
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  controls?.dispose()
  pane?.dispose()
  rtRead?.dispose()
  rtWrite?.dispose()
})
</script>

<template>
  <div ref="containerRef" class="jackknife-container">
    <div class="jackknife-overlay">{{ overlayText }}</div>
    <div v-if="errorMessage" class="jackknife-error">{{ errorMessage }}</div>
  </div>
</template>

<style scoped>
.jackknife-container {
  position: fixed;
  inset: 0;
  background: #0b0d10;
}
.jackknife-container :deep(canvas) {
  display: block;
}
.jackknife-overlay {
  position: fixed;
  left: 12px;
  bottom: 10px;
  color: #9aa4b2;
  font-size: 12px;
  pointer-events: none;
  user-select: none;
  text-shadow: 0 1px 2px #000;
}
.jackknife-error {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  color: #e8edf4;
  background: #0b0d10;
  padding: 2rem;
  text-align: center;
}
</style>
