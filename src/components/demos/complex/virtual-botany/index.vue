<script setup>
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'
import { useLoop } from '@tresjs/core'
import { useTexture } from '@tresjs/cientos'
import { Color, DoubleSide, RepeatWrapping, Vector2, Vector3 } from 'three'
import { reactive, shallowRef, onUnmounted } from 'vue'
import { watchOnce } from '@vueuse/core'
import { Pane } from 'tweakpane'
import {
  LIGHT_POSITION,
  ROCKS,
  buildClutterGeometry,
  buildGrassGeometry,
  buildTerrainGeometry,
  terrainHeight
} from './planting.js'

const lightDir = new Vector3(...LIGHT_POSITION).normalize()
const sunColor = new Color('#fff3d6')
const ambientColor = new Color('#5a6a72').multiplyScalar(0.6)

const makeUniforms = (fadeStart, fadeEnd) => ({
  uTime: { value: 0 },
  uWindStrength: { value: 0.12 },
  uWindSpeed: { value: 1.5 },
  uWindDir: { value: new Vector2(1, 0.3).normalize() },
  uAtlas: { value: null },
  uNoiseTex: { value: null },
  uLightDir: { value: lightDir },
  uSunColor: { value: sunColor },
  uAmbientColor: { value: ambientColor },
  uFadeStart: { value: fadeStart },
  uFadeEnd: { value: fadeEnd },
  uAlphaCut: { value: 0.35 }
})

const grassShader = {
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: makeUniforms(18, 32),
  side: DoubleSide,
  transparent: false,
  depthWrite: true
}

const clutterShader = {
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: makeUniforms(26, 42),
  side: DoubleSide,
  transparent: false,
  depthWrite: true
}

const terrainGeometry = buildTerrainGeometry()
const grassGeometry = shallowRef(buildGrassGeometry())
const clutterGeometry = shallowRef(buildClutterGeometry())

const { state: atlasTex, isLoading: atlasLoading } = useTexture('/textures/botany/grass-atlas.png')
const { state: noiseTex, isLoading: noiseLoading } = useTexture('/textures/noise-fbm.png')
const { state: groundColor, isLoading: groundLoading } = useTexture(
  '/textures/botany/ground/Grass004_Color.jpg'
)
const { state: groundNormal } = useTexture('/textures/botany/ground/Grass004_NormalGL.jpg')
const { state: groundAo } = useTexture('/textures/botany/ground/Grass004_AmbientOcclusion.jpg')

watchOnce(atlasLoading, (loading) => {
  if (loading) return
  grassShader.uniforms.uAtlas.value = atlasTex.value
  clutterShader.uniforms.uAtlas.value = atlasTex.value
})

watchOnce(noiseLoading, (loading) => {
  if (loading) return
  noiseTex.value.wrapS = RepeatWrapping
  noiseTex.value.wrapT = RepeatWrapping
  grassShader.uniforms.uNoiseTex.value = noiseTex.value
  clutterShader.uniforms.uNoiseTex.value = noiseTex.value
})

watchOnce(groundLoading, (loading) => {
  if (loading) return
  for (const map of [groundColor.value, groundNormal.value, groundAo.value]) {
    if (!map) continue
    map.wrapS = RepeatWrapping
    map.wrapT = RepeatWrapping
    map.repeat.set(8, 8)
  }
})

const params = reactive({
  windStrength: 0.12,
  windSpeed: 1.5,
  fadeStart: 18,
  fadeEnd: 32,
  density: 6,
  showClutter: true
})

const pane = new Pane()
onUnmounted(() => pane?.dispose())

pane.addBinding(params, 'windStrength', { min: 0, max: 0.5, step: 0.01 }).on('change', (ev) => {
  grassShader.uniforms.uWindStrength.value = ev.value
  clutterShader.uniforms.uWindStrength.value = ev.value
})
pane.addBinding(params, 'windSpeed', { min: 0, max: 5, step: 0.1 }).on('change', (ev) => {
  grassShader.uniforms.uWindSpeed.value = ev.value
  clutterShader.uniforms.uWindSpeed.value = ev.value
})
pane.addBinding(params, 'fadeStart', { min: 5, max: 40, step: 1 }).on('change', (ev) => {
  grassShader.uniforms.uFadeStart.value = ev.value
  clutterShader.uniforms.uFadeStart.value = ev.value + 8
})
pane.addBinding(params, 'fadeEnd', { min: 10, max: 60, step: 1 }).on('change', (ev) => {
  grassShader.uniforms.uFadeEnd.value = ev.value
  clutterShader.uniforms.uFadeEnd.value = ev.value + 10
})
pane.addBinding(params, 'density', { min: 1, max: 12, step: 1 })
pane.addBinding(params, 'showClutter')
pane.addButton({ title: 'Replant' }).on('click', () => {
  grassGeometry.value.dispose()
  grassGeometry.value = buildGrassGeometry(params.density)
})

const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed }) => {
  grassShader.uniforms.uTime.value = elapsed
  clutterShader.uniforms.uTime.value = elapsed
})

const rockPosition = (rock) => [rock.x, terrainHeight(rock.x, rock.z) + rock.radius * 0.2, rock.z]
</script>
<template>
  <TresMesh :geometry="terrainGeometry">
    <TresMeshStandardMaterial
      :map="groundColor"
      :normal-map="groundNormal"
      :ao-map="groundAo"
      :roughness="1"
    />
  </TresMesh>

  <TresMesh v-for="(rock, i) in ROCKS" :key="i" :position="rockPosition(rock)" :scale="[1, 0.7, 1]">
    <TresIcosahedronGeometry :args="[rock.radius, 1]" />
    <TresMeshStandardMaterial color="#78716a" :roughness="0.95" :flat-shading="true" />
  </TresMesh>

  <TresMesh :geometry="grassGeometry">
    <TresShaderMaterial v-bind="grassShader" />
  </TresMesh>

  <TresMesh v-if="params.showClutter" :geometry="clutterGeometry">
    <TresShaderMaterial v-bind="clutterShader" />
  </TresMesh>

  <TresDirectionalLight :position="LIGHT_POSITION" :intensity="1.6" color="#fff3d6" />
  <TresAmbientLight :intensity="0.6" color="#5a6a72" />
</template>
