<script setup>
import { TresCanvas, useTexture } from '@tresjs/core'
import { CameraControls, Precipitation } from '@tresjs/cientos';

const { displacementMap, map } = await useTexture({
    displacementMap: '/textures/gaea/height.png',
    map: '/textures/gaea/texture.png',
})
</script>
<template>
    <TresCanvas window-size clear-color="#626A71" ref="canvasRef">
        <TresFog color="#626A71" :near="0.1" :far="100" />
        <TresPerspectiveCamera :position="[0, 0.6, 1.75]" :fov="45" :aspect="1" :near="0.1" :far="1000" :look-at="[0, 3, 0]" />
        <CameraControls />
        <Precipitation :area="[2.5, 2.5, 2.5]" :count="500" :size="0.01" />
        <TresMesh :rotation-x="Math.PI * -0.5">
            <TresPlaneGeometry :args="[2.5, 2.5, 100, 100]" />
            <TresMeshStandardMaterial :displacementMap="displacementMap" :map="map"  />
        </TresMesh>
        <TresDirectionalLight :position="[0, 2, 4]" :intensity="0.15" />
        <TresAmbientLight :intensity="0.50" />
    </TresCanvas>
</template>