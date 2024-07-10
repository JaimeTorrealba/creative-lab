<script setup>
import { reactive } from 'vue'
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/frag_shader/RMDemo.vue'
import { Pane } from 'tweakpane';

const camera = reactive({y:1})
const pane = new Pane();

pane.addBinding(camera, 'y', { min: -5, max: 5, step: 0.1 });
</script>
<template>
    <TresCanvas window-size clear-color="#111">
      <TresPerspectiveCamera :position="[0, camera.y, 1]" />
      <Suspense>
        <TheExperience />
      </Suspense>
    </TresCanvas>
</template>
