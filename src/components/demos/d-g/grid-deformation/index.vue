<script setup>
import { computed, onUnmounted, reactive } from 'vue'
import { MathUtils, Uniform, Vector2 } from 'three'
import { useLoop, useTres } from '@tresjs/core'
import { useTexture } from '@tresjs/cientos'
import { useWindowSize } from '@vueuse/core'
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'
import { CAMERA_DISTANCE, CAMERA_FOV, DEFAULT_PARAMS, IMAGE_URL } from './constants'
import {
  createGridSimulation,
  getGridTexture,
  placeGridPointer,
  pushGridPointer,
  stepGridSimulation,
  toGridUv
} from './gridSimulation'
import { createGridDeformationPane } from './pane'

const params = reactive({ ...DEFAULT_PARAMS })
const { renderer } = useTres()
const { width, height } = useWindowSize()
const { state: texture, isLoading } = useTexture(IMAGE_URL)
const gridUv = new Vector2()

let simulation = createGridSimulation(renderer, params)

const rebuildGridSimulation = () => {
  simulation.computation.dispose()
  simulation = createGridSimulation(renderer, params)
}

const pane = createGridDeformationPane(params, { onGridRebuild: rebuildGridSimulation })

const imageAspect = computed(() => {
  const image = texture.value?.image
  return image ? image.width / image.height : 1
})

const planeScale = computed(() => {
  const viewHeight = 2 * CAMERA_DISTANCE * Math.tan(MathUtils.degToRad(CAMERA_FOV / 2))
  const viewWidth = viewHeight * (width.value / height.value)
  const planeHeight = Math.min(viewHeight, viewWidth / imageAspect.value) * params.fill
  return [planeHeight * imageAspect.value, planeHeight, 1]
})

const material = {
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uTexture: new Uniform(null),
    uGrid: new Uniform(null),
    uAspect: new Uniform(1),
    uDisplacement: new Uniform(params.displacement),
    uRgbShift: new Uniform(params.rgbShift),
    uShowGrid: new Uniform(0)
  }
}

const onPointerEnter = (ev) => {
  placeGridPointer(simulation, toGridUv(ev.uv, imageAspect.value, gridUv))
}

const onPointerMove = (ev) => {
  pushGridPointer(simulation, toGridUv(ev.uv, imageAspect.value, gridUv), params.strength)
}

const syncMaterialUniforms = () => {
  const { uniforms } = material
  uniforms.uTexture.value = texture.value
  uniforms.uGrid.value = getGridTexture(simulation)
  uniforms.uAspect.value = imageAspect.value
  uniforms.uDisplacement.value = params.displacement
  uniforms.uRgbShift.value = params.rgbShift
  uniforms.uShowGrid.value = params.showGrid ? 1 : 0
}

const { onBeforeRender } = useLoop()
onBeforeRender(({ delta }) => {
  stepGridSimulation(simulation, params, delta)
  syncMaterialUniforms()
})

onUnmounted(() => {
  pane.dispose()
  simulation.computation.dispose()
})
</script>

<template>
  <TresMesh
    v-if="!isLoading"
    :scale="planeScale"
    @pointerenter="onPointerEnter"
    @pointermove="onPointerMove"
  >
    <TresPlaneGeometry />
    <TresShaderMaterial v-bind="material" />
  </TresMesh>
</template>
