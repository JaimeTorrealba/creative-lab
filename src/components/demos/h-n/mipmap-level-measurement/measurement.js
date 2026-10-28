import { DepthTexture, Mesh, MeshBasicNodeMaterial, RenderTarget, Scene, Vector2 } from 'three/webgpu'
import {
  Fn,
  If,
  atomicAdd,
  cameraFar,
  cameraNear,
  instancedArray,
  perspectiveDepthToViewZ,
  positionView,
  screenUV,
  texture,
  uint,
  uniform,
  vec4
} from 'three/tsl'
import {
  CHUNK_COUNT,
  COUNTERS_PER_CHUNK,
  LEVEL_ALPHAS,
  MEASURED_LEVELS,
  REFERENCE_SLOT
} from './constants'

// A fragment is visible when it is no further than the scene depth (plus a relative tolerance)
const DEPTH_TOLERANCE = 1.002

// Alpha above the next level's value means this level (or a finer one) was sampled
const getLevelAlphaThreshold = (level) => (LEVEL_ALPHAS[level + 1] + 0.5) / 255

const countVisiblePixel = (counters, firstCounter, calibrationAlpha) => {
  atomicAdd(counters.element(firstCounter.add(uint(REFERENCE_SLOT))), uint(1))
  for (let level = 0; level < MEASURED_LEVELS; level++) {
    If(calibrationAlpha.greaterThan(getLevelAlphaThreshold(level)), () => {
      atomicAdd(counters.element(firstCounter.add(uint(level))), uint(1))
    })
  }
}

// Stands in for the chapter's alpha test + occlusion query: WebGL2/WebGPU queries can't count
// pixels, so every surviving fragment bumps an atomic counter instead. Storage writes don't get
// early depth testing, so occlusion is checked by hand against a depth prepass.
const createCounterMaterial = ({ counters, calibrationTexture, sceneDepthTexture }) => {
  const chunkIndex = uniform(0, 'uint').onObjectUpdate(({ object }) => object.userData.chunkIndex)
  const material = new MeshBasicNodeMaterial({
    colorWrite: false,
    depthTest: false,
    depthWrite: false
  })
  material.fragmentNode = Fn(() => {
    // Sampled before branching: implicit-derivative sampling needs uniform control flow
    const calibrationAlpha = texture(calibrationTexture).a.toVar()
    const sceneDepth = texture(sceneDepthTexture, screenUV).x.toVar()
    const sceneViewZ = perspectiveDepthToViewZ(sceneDepth, cameraNear, cameraFar)
    const firstCounter = chunkIndex.mul(uint(COUNTERS_PER_CHUNK)).toVar()
    If(positionView.z.greaterThanEqual(sceneViewZ.mul(DEPTH_TOLERANCE)), () => {
      countVisiblePixel(counters, firstCounter, calibrationAlpha)
    })
    return vec4(0)
  })()
  return material
}

const createMeasurementScenes = ({ geometries, counterMaterial }) => {
  const depthScene = new Scene()
  const countScene = new Scene()
  const depthMaterial = new MeshBasicNodeMaterial({ colorWrite: false })
  const countMeshes = geometries.map((geometry, chunkIndex) => {
    depthScene.add(new Mesh(geometry, depthMaterial))
    const countMesh = new Mesh(geometry, counterMaterial)
    countMesh.userData.chunkIndex = chunkIndex
    countMesh.visible = false
    // Always drawn so the counter buffer is bound (and its reset uploaded) even when off-screen
    countMesh.frustumCulled = false
    countScene.add(countMesh)
    return countMesh
  })
  return { depthScene, countScene, countMeshes, depthMaterial }
}

export const createMeasurement = ({ renderer, geometries, calibrationTexture }) => {
  const counters = instancedArray(CHUNK_COUNT * COUNTERS_PER_CHUNK, 'uint').toAtomic()
  const depthTarget = new RenderTarget(1, 1, { depthTexture: new DepthTexture(1, 1) })
  // Full resolution on purpose: mip selection depends on screen-space derivatives
  const countTarget = new RenderTarget(1, 1, { depthBuffer: false })
  const counterMaterial = createCounterMaterial({
    counters,
    calibrationTexture,
    sceneDepthTexture: depthTarget.depthTexture
  })
  const { depthScene, countScene, countMeshes, depthMaterial } = createMeasurementScenes({
    geometries,
    counterMaterial
  })
  const drawingBufferSize = new Vector2()

  const matchTargetsToCanvas = () => {
    renderer.getDrawingBufferSize(drawingBufferSize)
    const { x, y } = drawingBufferSize
    if (depthTarget.width === x && depthTarget.height === y) return
    depthTarget.setSize(x, y)
    countTarget.setSize(x, y)
  }

  const showOnlyChunks = (chunkIndices) => {
    countMeshes.forEach((countMesh) => (countMesh.visible = false))
    chunkIndices.forEach((chunkIndex) => (countMeshes[chunkIndex].visible = true))
  }

  const resetCounters = () => {
    counters.value.array.fill(0)
    counters.value.needsUpdate = true
  }

  const renderCountPasses = (camera) => {
    const previousTarget = renderer.getRenderTarget()
    renderer.setRenderTarget(depthTarget)
    renderer.render(depthScene, camera)
    renderer.setRenderTarget(countTarget)
    renderer.render(countScene, camera)
    renderer.setRenderTarget(previousTarget)
  }

  const measureChunksAsync = async (camera, chunkIndices) => {
    resetCounters()
    matchTargetsToCanvas()
    showOnlyChunks(chunkIndices)
    renderCountPasses(camera)
    return new Uint32Array(await renderer.getArrayBufferAsync(counters.value))
  }

  const dispose = () => {
    depthTarget.dispose()
    countTarget.dispose()
    counterMaterial.dispose()
    depthMaterial.dispose()
  }

  return { measureChunksAsync, dispose }
}
