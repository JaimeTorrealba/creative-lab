<script setup>
import { shallowRef, watch } from 'vue';
import { useTexture, useLoop, vLightHelper } from '@tresjs/core'
import { DoubleSide, Vector3, CameraHelper, RepeatWrapping } from 'three';
import gsap from 'gsap'

//todo learn more about shadows types
//Another directional light (replace spotLight)
// name of this abstraction

const { alphaMap } = await useTexture({
    alphaMap: '/textures/noise-fbm.png'
})

const cloudsRef = shallowRef()
const dirLightRef = shallowRef()
const spotLightRef = shallowRef()
const lightPosition = new Vector3(0, 18, 12)
const randomCloudsAlphaTest = gsap.utils.random(0.35, 0.65)

watch(dirLightRef, value => {
    value.shadow.camera.near = 0.01
    value.shadow.camera.far = 50
    value.shadow.camera.right = 10
    value.shadow.camera.top = 10
    value.shadow.camera.bottom = -10
    value.shadow.camera.left = -10
    const helper = new CameraHelper(value.shadow.camera);
    value.parent.add(helper);
})

watch(spotLightRef, value => {
    value.shadow.camera.near = 0.01
    value.shadow.camera.far = 50
    value.shadow.camera.right = 10
    value.shadow.camera.top = 10
    value.shadow.camera.bottom = -10
    value.shadow.camera.left = -10
    const helper = new CameraHelper(value.shadow.camera);
    value.parent.add(helper);
})

watch(cloudsRef, value => {
    value.material.alphaMap.wrapS = RepeatWrapping
    value.material.alphaMap.wrapT = RepeatWrapping
})


const { onBeforeRender } = useLoop()

onBeforeRender(({ elapsed }) => {
    if (cloudsRef.value) {
        cloudsRef.value.material.alphaMap.offset.x = elapsed * 0.05
        // cloudsRef2.value.material.alphaMap.offset.x = elapsed * 0.01
        // cloudsRef.value.material.alphaMap.offset.y = elapsed * 0.005
    }
})
</script>
<template>
    <TresMesh cast-shadow receive-shadow :position-y="2">
        <TresBoxGeometry :args="[1, 1, 3]" />
        <TresMeshStandardMaterial :color="0x00ff00" />
    </TresMesh>
    <TresMesh cast-shadow receive-shadow :position="[4, 2, 0]" :look-at="[lightPosition]">
        <TresTorusGeometry :args="[1, 1]" />
        <TresMeshStandardMaterial :color="0x2222ff" />
    </TresMesh>
    <TresMesh receive-shadow :rotate-x="-Math.PI * 0.5">
        <TresPlaneGeometry :args="[20, 20, 20]" />
        <TresMeshStandardMaterial :color="0xf7f7f7" />
    </TresMesh>


    <TresDirectionalLight ref="dirLightRef" v-light-helper cast-shadow :position="[...lightPosition]"
        :intensity="2" :shadow-blurSamples="25" :shadow-radius="4" :shadow-bias="0.000005" />
    <TresMesh ref="cloudsRef" cast-shadow
        :position="[lightPosition.x - 0.5, lightPosition.y - 0.5, lightPosition.z - 0.5]" :look-at="[0, 0, 0]"
        v-layer-set="2">
        <TresPlaneGeometry :args="[25, 25, 25]" />
        <TresMeshStandardMaterial transparent :side="DoubleSide" :alphaMap="alphaMap"
            :alphaTest="randomCloudsAlphaTest" />
    </TresMesh>


    <TresSpotLight ref="spotLightRef" v-light-helper cast-shadow
        :position="[lightPosition.x, lightPosition.y + 7.5, lightPosition.z + 7.5]" :power="50" :intensity="150"
        :shadow-blurSamples="5" :shadow-radius="1" :shadow-bias="0.000005" />
    <TresAmbientLight :intensity="0.5" />
    <!-- <TresMesh ref="cloudsRef2" cast-shadow
        :position="[lightPosition.x - 0.5, lightPosition.y - 3, lightPosition.z - 3]" :look-at="[0, 0, 0]">
        <TresPlaneGeometry :args="[25, 25, 25]" />
        <TresMeshStandardMaterial transparent :side="DoubleSide" :alphaMap="alphaMap" :alphaTest="0.5" />
      </TresMesh> -->
</template>