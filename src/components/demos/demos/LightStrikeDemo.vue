<script setup>
import { ref, shallowRef } from 'vue'
import { TransformControls } from '@tresjs/cientos'
import { useTresContext, useLoop } from '@tresjs/core'
import { DodecahedronGeometry, Vector3, Mesh, MeshBasicMaterial } from 'three'
import { LightningStrike } from '../../internals/LightingStrikeClass.js'

const geometry = new DodecahedronGeometry()

const redMeshRef = shallowRef()
const greenVector = ref(new Vector3(0, 1, 10))
const redVector = ref(new Vector3(10, 1, -10))
const blueVector = ref(new Vector3(-10, 1, -10))

const greenRayParam = {

    sourceOffset: greenVector.value,
    destOffset: redVector.value,
    radius0: 0.05,
    radius1: 0.05,
    minRadius: 2.5,
    maxIterations: 7,
    isEternal: true,

    timeScale: 0.7,

    propagationTimeFactor: 0.05,
    vanishingTimeFactor: 0.95,
    subrayPeriod: 2.5,
    subrayDutyCycle: 0.3,
    maxSubrayRecursion: 3,
    ramification: 1,
    recursionProbability: 0.6,

    roughness: 0.85,
    straightness: 0.68

}
const redRayParam = {

    sourceOffset: redVector.value,
    destOffset: blueVector.value,
    radius0: 0.05,
    radius1: 0.05,
    minRadius: 2,
    maxIterations: 6,
    isEternal: true,

    timeScale: 0.7,

    propagationTimeFactor: 0.05,
    vanishingTimeFactor: 0.95,
    subrayPeriod: 2.5,
    subrayDutyCycle: 0.3,
    maxSubrayRecursion: 3,
    ramification: 7,
    recursionProbability: 0.6,

    roughness: 0.85,
    straightness: 0.68

}
const blueRayParam = {

    sourceOffset: blueVector.value,
    destOffset: greenVector.value,
    radius0: 0.05,
    radius1: 0.05,
    minRadius: 2.5,
    maxIterations: 7,
    isEternal: true,

    timeScale: 0.7,

    propagationTimeFactor: 0.05,
    vanishingTimeFactor: 0.95,
    subrayPeriod: 2.5,
    subrayDutyCycle: 0.3,
    maxSubrayRecursion: 3,
    ramification: 7,
    recursionProbability: 0.6,

    roughness: 0.85,
    straightness: 0.68

}

const { scene } = useTresContext()
const greenRay = new LightningStrike(greenRayParam);
const greenRayMesh = new Mesh(greenRay, new MeshBasicMaterial({ color: 0x00ff00 }));
const redRay = new LightningStrike(redRayParam);
const redRayMesh = new Mesh(redRay, new MeshBasicMaterial({ color: 0xaa0000 }));
const blueRay = new LightningStrike(blueRayParam);
const blueRayMesh = new Mesh(blueRay, new MeshBasicMaterial({ color: 0x0000aa }));

scene.value.add(greenRayMesh, redRayMesh, blueRayMesh);

const { onBeforeRender } = useLoop()

onBeforeRender(({elapsed}) => {
    greenRay.update(elapsed)
    redRay.update(elapsed)
    blueRay.update(elapsed)
    greenVector.value.x = Math.sin(elapsed) * 2.5
    greenVector.value.y = Math.cos(elapsed) * 2.5
    redVector.value.copy(redMeshRef.value.position)

})

//outline pass
</script>
<template>
    <TransformControls :object="redMeshRef" />
    <TresMesh ref="redMeshRef" :position="[...redVector]" :geometry="geometry">
        <TresMeshStandardMaterial :color="0xf7f7f7" :metalness="1" wireframe :emissive="0xaa0000" />
    </TresMesh>
    <TresMesh :position="[...greenVector]" :geometry="geometry">
        <TresMeshStandardMaterial :color="0xf7f7f7" :metalness="1" wireframe :emissive="0x00aa00" />
    </TresMesh>
    <TresMesh :position="[...blueVector]" :geometry="geometry">
        <TresMeshStandardMaterial :color="0xf7f7f7" :metalness="1" wireframe :emissive="0x0000aa" />
    </TresMesh>
</template>