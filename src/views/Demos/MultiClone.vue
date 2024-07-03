<script setup>
import { OrbitControls } from '@tresjs/cientos'
import MultiClone from '../../components/demos/demos/MultiClone.vue';
import BasicSetup from '../../components/demos/BasicSetup.vue';

</script>
<template>
    <BasicSetup>
        <TresPerspectiveCamera :position='[0, 2, 50]' :fov='45' :aspect='1' :near='0.1' :far='1000' />
        <OrbitControls />
        <Suspense>
            <MultiClone />
        </Suspense>
        <TresAmbientLight />
    </BasicSetup>
</template>