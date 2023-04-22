<script setup>
import TheDestroyEffect from '../components/shaders_experiments/destroyGeos/TheExperience.vue'
import ShowLayout from '../components/layout/ShowLayout.vue'

const url =
  'https://github.com/JaimeTorrealba/my-trejs-playground/blob/main/src/components/shaders_experiments/destroyGeos/TheExperience.vue'
const title = 'Destroy vertex geometries animation'
</script>
<template>
  <show-layout :sourceLink="url" :title="title">
    <TheDestroyEffect />
  </show-layout>
</template>
<style scoped></style>
