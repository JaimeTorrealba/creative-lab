<script setup>
import { TresCanvas, useRenderLoop, useTexture } from '@tresjs/core'
import { OrbitControls, GLTFModel } from '@tresjs/cientos'
import fragment from '@/components/shaders/CoffeeCup/fragment.glsl'
import vertex from '@/components/shaders/CoffeeCup/vertex.glsl'
import { DoubleSide, RepeatWrapping } from 'three';

const { map: perlinTexture } = await useTexture({ map: '/perlin.png' })
perlinTexture.wrapS = RepeatWrapping
perlinTexture.wrapT = RepeatWrapping

const shader = {
  uniforms: {
    uTime: { value: 0.0 },
    uPerlin: { value: perlinTexture }
  },
  vertexShader: vertex,
  fragmentShader: fragment,
  side: DoubleSide,
  deepWrite: false
}

const { onLoop } = useRenderLoop()

onLoop(({ elapsed }) => {
  shader.uniforms.uTime.value = elapsed
})

</script>
<template>
  <TresCanvas window-size antialias clear-color="#111" ref="canvasRef">
    <TresPerspectiveCamera :position="[8, 10, 12]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <OrbitControls />
    <TresMesh :position-y="1.83">
      <TresPlaneGeometry :args="[1, 1, 16, 64]" :translate="[0, 0.5, 0]" :scale="[1.5, 6, 1.5]" />
      <TresShaderMaterial v-bind="shader" transparent />
    </TresMesh>
    <Suspense>
      <GLTFModel path="/models/bakedModel.glb" />
    </Suspense>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>