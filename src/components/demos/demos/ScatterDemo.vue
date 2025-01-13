<script setup>
import { reactive, shallowRef, watch } from 'vue';
import { useTresContext } from '@tresjs/core';
import { Mesh, BoxGeometry, MeshBasicMaterial, Vector3 } from 'three';
import { Pane } from 'tweakpane';
import { ThreeScatter } from '../../internals/ThreeScatter'

const { scene } = useTresContext()
const floorRef = shallowRef(null)
const scatter = shallowRef(null)

const testMesh = new Mesh(new BoxGeometry(0.5,0.5,0.5), new MeshBasicMaterial({ color: 0x00ff00 }))

watch(floorRef, (floor) => {
    if (floor) {
        scatter.value = new ThreeScatter(floor.geometry, testMesh,  10, 
        {
            allRotation: new Vector3(0,0,2),seeds: 3
        })
        scene.value.add(scatter.value.scatterGroup)
  }
})

// debugger
const pane = new Pane()

const options = reactive({
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    //more
    seeds: 1,
})

// rotations
pane.addBinding(options, 'rotX', {
    min: -Math.PI,
    max: Math.PI,
    step: 0.01,
}).on('change', ({value}) => {
    scatter.value.setRotationX( value )
})
pane.addBinding(options, 'rotY', {
    min: -Math.PI,
    max: Math.PI,
    step: 0.01,
}).on('change', ({value}) => {
    scatter.value.setRotationY( value )
})
pane.addBinding(options, 'rotZ', {
    min: -Math.PI,
    max: Math.PI,
    step: 0.01,
}).on('change', ({value}) => {
    scatter.value.setRotationZ( value )
})
pane.addBinding(options, 'seeds', {
    min: 1,
    max: 100,
    step: 1,
}).on('change', ({value}) => {
    scatter.value.setSeeds( value )
})

</script>
<template>
<TresMesh ref="floorRef" :position="[0, -0.5, 0]" :rotation-x="-Math.PI / 2">
    <TresPlaneGeometry :args="[10, 10]" />
</TresMesh>
</template>