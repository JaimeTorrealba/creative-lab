<script setup>
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'
import { useLoop } from '@tresjs/core'
import { useTexture } from '@tresjs/cientos'
import { Color, DoubleSide, RepeatWrapping, Vector2 } from 'three'
import { reactive, shallowRef, onUnmounted } from 'vue'
import { watchOnce } from '@vueuse/core'
import { Pane } from 'tweakpane'
import { buildGrassGeometry } from './buildGrass.js'

const params = reactive({
  windStrength: 0.35,
  windSpeed: 1.2,
  windAngle: 20,
  waveLength: 0.6,
  gustiness: 0.8,
  alphaCut: 0.35,
  fadeStart: 30,
  fadeEnd: 55,
  count: 2000,
  patchSize: 30
})

const windDir = new Vector2(1, 0)
const setWindDir = (deg) => {
  const rad = (deg * Math.PI) / 180
  windDir.set(Math.cos(rad), Math.sin(rad))
}
setWindDir(params.windAngle)

const grassShader = {
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uTime: { value: 0 },
    uWindStrength: { value: params.windStrength },
    uWindSpeed: { value: params.windSpeed },
    uWindDir: { value: windDir },
    uWaveLength: { value: params.waveLength },
    uGustiness: { value: params.gustiness },
    uAlphaCut: { value: params.alphaCut },
    uFadeStart: { value: params.fadeStart },
    uFadeEnd: { value: params.fadeEnd },
    uMap: { value: null },
    uSunColor: { value: new Color('#fff3d6') },
    uAmbientColor: { value: new Color('#4c5b52') }
  },
  side: DoubleSide,
  transparent: false,
  depthWrite: true
}

let seed = 0
const makeGeometry = () =>
  buildGrassGeometry({
    count: params.count,
    patchSize: params.patchSize,
    bladeWidth: 1.4,
    bladeHeight: 1.1,
    seed
  })
const grassGeometry = shallowRef(makeGeometry())

const { state: grassTex, isLoading: grassLoading } = useTexture(
  '/textures/botany/grassbushcc008.png'
)
const { state: groundTex, isLoading: groundLoading } = useTexture(
  '/textures/botany/ground/Grass004_Color.jpg'
)

watchOnce(grassLoading, (loading) => {
  if (loading) return
  grassShader.uniforms.uMap.value = grassTex.value
})

watchOnce(groundLoading, (loading) => {
  if (loading) return
  groundTex.value.wrapS = RepeatWrapping
  groundTex.value.wrapT = RepeatWrapping
  groundTex.value.repeat.set(10, 10)
})

const pane = new Pane()
onUnmounted(() => pane?.dispose())

const wind = pane.addFolder({ title: 'Wind' })
wind.addBinding(params, 'windStrength', { min: 0, max: 2, step: 0.01 }).on('change', (ev) => {
  grassShader.uniforms.uWindStrength.value = ev.value
})
wind.addBinding(params, 'windSpeed', { min: 0, max: 5, step: 0.1 }).on('change', (ev) => {
  grassShader.uniforms.uWindSpeed.value = ev.value
})
wind.addBinding(params, 'windAngle', { min: 0, max: 360, step: 1 }).on('change', (ev) => {
  setWindDir(ev.value)
})
wind.addBinding(params, 'waveLength', { min: 0, max: 2, step: 0.05 }).on('change', (ev) => {
  grassShader.uniforms.uWaveLength.value = ev.value
})
wind.addBinding(params, 'gustiness', { min: 0, max: 2, step: 0.05 }).on('change', (ev) => {
  grassShader.uniforms.uGustiness.value = ev.value
})

const look = pane.addFolder({ title: 'Look' })
look.addBinding(params, 'alphaCut', { min: 0.05, max: 0.9, step: 0.01 }).on('change', (ev) => {
  grassShader.uniforms.uAlphaCut.value = ev.value
})
look.addBinding(params, 'fadeStart', { min: 5, max: 60, step: 1 }).on('change', (ev) => {
  grassShader.uniforms.uFadeStart.value = ev.value
})
look.addBinding(params, 'fadeEnd', { min: 10, max: 90, step: 1 }).on('change', (ev) => {
  grassShader.uniforms.uFadeEnd.value = ev.value
})

const meadow = pane.addFolder({ title: 'Meadow' })
meadow.addBinding(params, 'count', { min: 500, max: 8000, step: 100 })
meadow.addBinding(params, 'patchSize', { min: 10, max: 60, step: 1 })
meadow.addButton({ title: 'Replant' }).on('click', () => {
  seed++
  grassGeometry.value.dispose()
  grassGeometry.value = makeGeometry()
})

const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed }) => {
  grassShader.uniforms.uTime.value = elapsed
})
</script>
<template>
  <TresMesh :geometry="grassGeometry">
    <TresShaderMaterial v-bind="grassShader" />
  </TresMesh>

  <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, -0.01, 0]">
    <TresPlaneGeometry :args="[params.patchSize + 12, params.patchSize + 12]" />
    <TresMeshStandardMaterial :map="groundTex" color="#9aa86a" :roughness="1" />
  </TresMesh>

  <TresDirectionalLight :position="[12, 18, 8]" :intensity="1.4" color="#fff3d6" />
  <TresAmbientLight :intensity="0.6" color="#bcd0dd" />
</template>
