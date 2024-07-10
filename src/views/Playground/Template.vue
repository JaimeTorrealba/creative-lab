<script setup>
import { OrbitControls } from '@tresjs/cientos'
import TheExperience from '@/components/demos/FOLDER/DEMO.vue'

</script>
<template>
    <TresPerspectiveCamera :position="[0, 0, 7]"  />
    <OrbitControls />
    <Suspense>
      <TheExperience />
    </Suspense>
    <TresAmbientLight />
</template>