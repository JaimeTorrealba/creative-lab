<script setup>
import { reactive, shallowRef, watch } from 'vue';
import MultiCloneComponent from '../../internals/MultiCloneComponent.vue';
import { useGLTF } from '@tresjs/cientos'
import { Pane } from 'tweakpane';

const { scene: mesh } = await useGLTF('/models/House.glb')

const multiCloneRef = shallowRef(null)

watch(multiCloneRef, value => {
    console.log('multi clone', value.instance)
})

const options = reactive({
    count: 4,
})

const pane = new Pane();

pane.addBinding(options, 'count', {
    label: 'Count',
    min: 1,
    max: 50,
    step: 1,
})

</script>
<template>
    <!-- <TresMesh>
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshBasicMaterial :color="0x00ff00" /> 
    </TresMesh> -->
    <MultiCloneComponent 
    ref="multiCloneRef"
    :position="[-10, 0, 0]" :count="options.count" 
    :mesh="mesh" 
    :x-gap="[2, -7, 3, 3]" 
    :y-gap="[-0.25, 0, 0.25]"
    :z-gap="[-3, 3, 5, -4]" 
    />
    <TresMesh :rotation-x="-Math.PI * 0.5" :position-y="-1">
        <TresPlaneGeometry :args="[100, 100]" />
        <TresMeshBasicMaterial :color="0xe4e4e4" />
    </TresMesh>
</template>