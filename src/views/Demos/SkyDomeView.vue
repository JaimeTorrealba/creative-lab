<script setup>
import SkyDome from '../../components/demos/demos/SkyDome.vue';
import BasicSetup from '../../components/demos/BasicSetup.vue';

</script>
<template>
    <BasicSetup>
        <TresPerspectiveCamera :position="[0, 0, 7]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
        <Suspense>
            <SkyDome />
        </Suspense>
    </BasicSetup>
</template>