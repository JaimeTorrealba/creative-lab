<script setup>
import { shallowRef, reactive } from 'vue'
import vertex from "./vertex.glsl"
import fragment from "./fragment.glsl"
import { Vector3 } from 'three'

const discRef = shallowRef()

const uniforms = reactive({
  uLightDir: { value: new Vector3(1.5, 2.5, 2).normalize() },
})
</script>

<template>
  <TresGroup :rotation="[0.4, 0, 0]">
    <!-- Main iridescent disc surface (both sides) -->
    <TresMesh ref="discRef">
      <TresRingGeometry :args="[0.18, 1.2, 256, 4]" />
      <TresShaderMaterial
        :vertex-shader="vertex"
        :fragment-shader="fragment"
        :uniforms="uniforms"
        :side="2"
      />
    </TresMesh>

    <!-- Centre hub — white plastic ring -->
    <TresMesh>
      <TresRingGeometry :args="[0.06, 0.18, 64]" />
      <TresMeshStandardMaterial color="#dde0ee" :metalness="0.05" :roughness="0.5" :side="2" />
    </TresMesh>

    <!-- Centre hole -->
    <TresMesh :position="[0, 0, 0.001]">
      <TresCircleGeometry :args="[0.06, 32]" />
      <TresMeshStandardMaterial color="#0a0a10" :roughness="0.3" :side="2" />
    </TresMesh>
  </TresGroup>

  <TresDirectionalLight :position="[1.5, 2.5, 2]" :intensity="4" color="#fff6e8" />
  <TresDirectionalLight :position="[-2, -1, 1.5]" :intensity="1" color="#b0c8ff" />
  <TresAmbientLight :intensity="0.25" />
</template>
