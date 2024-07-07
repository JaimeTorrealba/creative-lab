<script setup>
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/basics/GaeaDemo.vue'

</script>
<template>
    <TresCanvas window-size clear-color="#626A71" ref="canvasRef">
        <TresPerspectiveCamera :position="[0, 0.6, 1.75]" :look-at="[0, 3, 0]" :args="[45, 1, 0.1, 1000]" />
        <Suspense>
            <TheExperience />
          </Suspense>
    </TresCanvas>
</template>