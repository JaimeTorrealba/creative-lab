<script setup>
import { computed, shallowRef, watch, onUnmounted } from 'vue'
import { useLoop } from '@tresjs/core'
import { useAnimations, useGLTF } from '@tresjs/cientos'
import { AdditiveBlending, Box3, BufferAttribute, Color, Uniform, Vector2, Vector3 } from 'three'
import { useDevicePixelRatio } from '@vueuse/core'
import { Pane } from 'tweakpane'
import vertexShader from './vertex.glsl'
import fragmentShader from './fragment.glsl'

const MODEL_SCALE = 0.5

const options = {
  pointSize: 30,
  stride: 1,
  colorA: '#00d0ff',
  colorB: '#ff2bd6',
  showSourceMesh: false
}

const { pixelRatio } = useDevicePixelRatio()

const uniforms = {
  uResolution: new Uniform(new Vector2(pixelRatio.value, pixelRatio.value)),
  uSize: new Uniform(options.pointSize),
  uHeight: new Uniform(1),
  uColorA: new Uniform(new Color(options.colorA)),
  uColorB: new Uniform(new Color(options.colorB))
}

const { state } = useGLTF('/models/jaimeAvatar.glb')

const animations = computed(() => state.value?.animations || [])
const model = computed(() => state.value?.scene)

const { actions } = useAnimations(animations, model)

watch(actions, (newActions) => {
  const [firstAction] = Object.values(newActions)
  firstAction?.reset().play()
})

const pointsRef = shallowRef(null)
const positions = shallowRef(null)
const sizes = shallowRef(null)

// The readback runs over every vertex every frame, so nothing is allocated inside it
const scratch = new Vector3()
let sources = []

// Points has no skinning support, so the deformed positions are read off the
// SkinnedMesh on the CPU and copied into the cloud's own buffer each frame.
const readback = () => {
  const target = positions.value
  const root = model.value
  if (!target || !root || !sources.length) return

  root.updateMatrixWorld(true)

  for (const { mesh, count, offset, stride } of sources) {
    const matrixWorld = mesh.matrixWorld
    for (let i = 0; i < count; i++) {
      mesh.getVertexPosition(i * stride, scratch)
      scratch.applyMatrix4(matrixWorld)
      const o = (offset + i) * 3
      target[o] = scratch.x
      target[o + 1] = scratch.y
      target[o + 2] = scratch.z
    }
  }
}

const build = () => {
  const root = model.value
  if (!root) return

  root.scale.setScalar(MODEL_SCALE)
  root.updateMatrixWorld(true)

  const meshes = []
  root.traverse((child) => {
    if (child.isSkinnedMesh) meshes.push(child)
  })
  if (!meshes.length) return

  const stride = Math.max(1, Math.round(options.stride))
  let total = 0
  sources = meshes.map((mesh) => {
    const count = Math.ceil(mesh.geometry.attributes.position.count / stride)
    const source = { mesh, count, offset: total, stride }
    total += count
    return source
  })

  const nextPositions = new Float32Array(total * 3)
  const nextSizes = new Float32Array(total)
  for (let i = 0; i < total; i++) nextSizes[i] = Math.random()

  positions.value = nextPositions
  sizes.value = nextSizes
  uniforms.uHeight.value = new Box3().setFromObject(root).max.y || 1

  readback()

  const geometry = pointsRef.value?.geometry
  if (geometry) {
    geometry.setAttribute('position', new BufferAttribute(nextPositions, 3))
    geometry.setAttribute('aSize', new BufferAttribute(nextSizes, 1))
  }
}

const setSourceMeshVisible = (visible) => {
  for (const { mesh } of sources) mesh.visible = visible
}

const rebuild = () => {
  build()
  setSourceMeshVisible(options.showSourceMesh)
}

watch(model, rebuild, { immediate: true })

const pane = new Pane()

pane
  .addBinding(options, 'pointSize', { label: 'Size', min: 0, max: 100, step: 0.5 })
  .on('change', (ev) => (uniforms.uSize.value = ev.value))
pane
  .addBinding(options, 'colorA', { label: 'Color A' })
  .on('change', (ev) => uniforms.uColorA.value.set(ev.value))
pane
  .addBinding(options, 'colorB', { label: 'Color B' })
  .on('change', (ev) => uniforms.uColorB.value.set(ev.value))
pane
  .addBinding(options, 'stride', { label: 'Vertex stride', min: 1, max: 8, step: 1 })
  .on('change', rebuild)
pane
  .addBinding(options, 'showSourceMesh', { label: 'Show mesh' })
  .on('change', (ev) => setSourceMeshVisible(ev.value))

onUnmounted(() => pane?.dispose())

const { onBeforeRender } = useLoop()

onBeforeRender(() => {
  readback()
  const position = pointsRef.value?.geometry?.attributes?.position
  if (position) position.needsUpdate = true
})
</script>
<template>
  <primitive v-if="model" :object="model" />

  <TresPoints v-if="positions" ref="pointsRef" :frustum-culled="false">
    <TresBufferGeometry :position="[positions, 3]" :a-size="[sizes, 1]" />
    <TresShaderMaterial
      :vertex-shader="vertexShader"
      :fragment-shader="fragmentShader"
      :uniforms="uniforms"
      :transparent="true"
      :blending="AdditiveBlending"
      :depth-write="false"
    />
  </TresPoints>

  <TresAmbientLight :intensity="1" />
  <TresDirectionalLight :position="[0, 2, 4]" :intensity="1" />
</template>
