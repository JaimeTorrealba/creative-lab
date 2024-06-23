<script setup>
import { shallowRef } from 'vue'
import { useLoop } from '@tresjs/core'
import { OrbitControls, TransformControls } from '@tresjs/cientos'
import { useBasicCollision } from '../../../utils/useBasicCollision'

const greenBox = shallowRef(null)
const redSphere = shallowRef(null)
const blueBox = shallowRef(null)

const { check } = useBasicCollision([greenBox,
    blueBox,
    redSphere])

const { onBeforeRender } = useLoop()

onBeforeRender(() => {
    const result = check()
    if (result.length) {
        console.log('jaime ~ onBeforeRender ~ result:', result[0].name);
        console.log('jaime ~ onBeforeRender ~ result:', result[1].name);
    }
})


</script>
<template>
    <OrbitControls make-default />
    <TransformControls :object="greenBox" />
    <TresMesh ref="greenBox" name="greenBox" :position-x="-1.5">
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshBasicMaterial :color="0x00ff00" />
    </TresMesh>
    <TresMesh ref="redSphere" :position-y="10">
        <TresSphereGeometry :args="[5, 16]" />
        <TresMeshBasicMaterial :color="0xff0000" />
    </TresMesh>
    <TresMesh ref="blueBox" name="blueBox" :position="[2, -5, 0]">
        <TresBoxGeometry :args="[2, 2, 2]" />
        <TresMeshBasicMaterial :color="0x00ff" />
    </TresMesh>
</template>