<script setup>
import { TresCanvas } from '@tresjs/core';
import TheExperience from '@/components/demos/fun/SkyDome.vue';

</script>
<template>
    <TresCanvas window-size clear-color='#111'>
        <TresPerspectiveCamera :position="[0, 0, 7]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
        <Suspense>
            <TheExperience />
        </Suspense>
    </TresCanvas>
</template>