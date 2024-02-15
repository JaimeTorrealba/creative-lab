<script setup>
import { TresCanvas, useTexture } from '@tresjs/core'
import { CameraControls, OrbitControls, useGLTF } from '@tresjs/cientos';
import { shallowRef } from 'vue';
import { Vector3 } from 'three'

const { displacementMap, map } = await useTexture({
    displacementMap: '/textures/gaea/height.png',
    map: '/textures/gaea/texture.png',
})

const { scene: model } = await useGLTF('/models/footman/source/Footman_RIG.glb', { draco: true })

const ant = shallowRef()
const canvasRef = shallowRef()

const onChange = () => {
    const camera = canvasRef.value.context.camera.value
    const test = camera.getWorldDirection( new Vector3(0,1,0))
    // console.log('test', test)
    ant.value.rotation.y = test.x
    ant.value.rotation.z = test.y
    ant.value.position.copy(camera.position).add(camera.getWorldDirection(new Vector3()).multiplyScalar(2.5))

    // ant.value.children[0].position.x =  -5
    // ant.value.children[0].position.y =  -5
    // ant.value.children[0].position.z = 1x

    // console.log('jaime ~ onChange ~ ant.value:', ant.value);
}

</script>
<template>
    <TresCanvas window-size clear-color="#626A71" ref="canvasRef">
        <TresFog color="#626A71" :near="0.1" :far="100" />
        <TresPerspectiveCamera :position="[0,0, -10]" :fov="45" :aspect="1" :near="0.1" :far="1000" :look-at="[0, 3, 0]" />
        <!-- <CameraControls @change="onChange" /> -->
        <OrbitControls @change="onChange" :enablePan="false" :enable-zoom="false" />
        <primitive ref="ant" :object="model" :position="[-5, 0, -5]" :scale="0.1" :rotation="[0, 0, 0]" />
        <TresMesh :rotation-x="Math.PI * -0.5">
            <TresPlaneGeometry :args="[2.5, 2.5, 100, 100]" />
            <TresMeshStandardMaterial :displacementMap="displacementMap" :map="map"  />
        </TresMesh>
        <TresDirectionalLight :position="[0, 2, 4]" :intensity="0.15" />
        <TresAmbientLight :intensity="0.50" />
    </TresCanvas>
</template>