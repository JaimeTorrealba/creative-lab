<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/fun/RibbonDemo.vue';

</script>
<template>
    <TresCanvas window-size clear-color='#e4e4e4'>
        <TresPerspectiveCamera :position='[0, 0, 15]' />
        <OrbitControls />
        <Suspense>
            <TheExperience />
        </Suspense>
    </TresCanvas>
</template>