<script setup>
import { shallowRef, watch, ref } from 'vue'
import { TresCanvas,useRenderLoop } from '@tresjs/core'
import { OrbitControls, GlobalAudio } from '@tresjs/cientos'
import { Vector2, AudioAnalyser } from 'three'
import { useWindowSize } from '@vueuse/core'
import vertex from '@/components/shaders/AudioAnalyser/vertex.glsl'

const { width, height } = useWindowSize()
const audioRef = shallowRef(null)
const analyzer = ref(0)
const music = 'https://raw.githubusercontent.com/Tresjs/assets/main/music/sunny-afternoon.mp3'

const shader = {
  uniforms: {
    uResolution: { value: new Vector2(width.value, height.value) },
    uTime: { value: 0.0 },
    uFrequency: { value: analyzer.value },
  },
  vertexShader: vertex,
  // fragmentShader: fragment
}

watch(audioRef, value => {
  analyzer.value = new AudioAnalyser(value.sound, 32)

})

const { onLoop } = useRenderLoop()

onLoop(({elapsed}) => {
  shader.uniforms.uTime.value = elapsed * 0.1
  shader.uniforms.uFrequency.value = analyzer.value.getAverageFrequency()
})

</script>
<template>
  <TresCanvas window-size clear-color="#000" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 3, 15]" :look-at="[0,0,0]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <OrbitControls />
    <GlobalAudio ref="audioRef" :src="music"  />
    <TresMesh>
      <TresIcosahedronGeometry :args="[4, 30]" />
      <TresShaderMaterial v-bind="shader" wireframe />
    </TresMesh>
  </TresCanvas>
</template>