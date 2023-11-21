<script setup>
import { ref } from 'vue'
import { useTresContext, useRenderLoop } from '@tresjs/core'
import { useGLTF, PointerLockControls, KeyboardControls } from '@tresjs/cientos'
import { Vector3 } from 'three'

const { camera } = useTresContext()
const rotation = new Vector3()
const swordRef = ref()
const controls = ref()
const { scene } = await useGLTF('/models/PixelArt Medieval Sword.glb')

const updateWeaponPosition = () => {
    swordRef.value.rotation.copy(camera.value.rotation)
    swordRef.value.children[0].rotation.y = 1
    swordRef.value.position.copy(camera.value.position).add(camera.value.getWorldDirection(rotation).multiplyScalar(1))
    swordRef.value.children[0].position.set(-4.5, -4, 0)
}

// watch(controls, value => {
//     if (value.value) value.value.addEventListener('change', () => updateWeaponPosition())
// })

// setTimeout(() => {
//     console.log('jaime ~ ready');
//     controls.value.value.addEventListener('change', () => updateWeaponPosition())
// }, 500)


const { onLoop } = useRenderLoop()

onLoop(() => {
    updateWeaponPosition()
})


</script>
<template>
    <PointerLockControls make-default ref="controls" />
    <KeyboardControls head-bobbing />
    <primitive ref="swordRef" :scale="0.1" :object="scene" :rotation="[0, 1, 0]" />
</template>