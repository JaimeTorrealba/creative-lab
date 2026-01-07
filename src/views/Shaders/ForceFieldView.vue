<script setup>
import { TresCanvas } from "@tresjs/core";
import TheExperience from "@/components/demos/shaders/ForceFieldDemo.vue";
</script>
<template>
    <TresCanvas window-size clear-color="#333">
      <TresPerspectiveCamera :position="[0, 0, 10]" />
      <Suspense>
        <TheExperience />
      </Suspense>
    </TresCanvas>
</template>
