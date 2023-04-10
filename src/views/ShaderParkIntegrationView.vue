<script setup>
import SPintegration from '@/components/shaders_experiments/shaderParkIntegration/TheExperience.vue'
import ShowLayout from '../components/layout/ShowLayout.vue'

const url =
  'https://github.com/JaimeTorrealba/my-trejs-playground/blob/main/src/components/shaders_experiments/shaderParkIntegration/TheExperience.vue'
const title = 'Integration with Shader Park'
</script>
<template>
  <show-layout :sourceLink="url" :title="title">
    <SPintegration />
  </show-layout>
</template>
<style scoped></style>
