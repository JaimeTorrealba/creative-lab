<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/fun/PointsEarthDemo.vue';

</script>
<template>
    <TresCanvas window-size clear-color='#111'>
        <TresPerspectiveCamera :position='[0, 0, 5]' :fov='45' :aspect='1' :near='0.1' :far='1000' />
        <OrbitControls :auto-rotate="true" />
        <Suspense>
            <TheExperience />
        </Suspense>
        <TresAmbientLight />
    </TresCanvas>
</template>