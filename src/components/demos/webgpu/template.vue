<script setup>
import { useLoop } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';
// console.log('jaime ~ WebGPURenderer:', WebGPURenderer);


const gpuRenderer = new WebGPURenderer( { antialias: true } );
// const { render } = useLoop()

// render(({ camera, scene }) => {
//     gpuRenderer.render( scene, camera );
// })
</script>
<template>
    <TresPerspectiveCamera :position="[0, 0, 3]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <OrbitControls />
    <TresMesh >
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresMeshBasicMaterial :color="0x00ff00" />
    </TresMesh>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
</template>