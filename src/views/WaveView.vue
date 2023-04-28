<script setup>
import Wave from '@/components/shaders_experiments/wave/TheExperience.vue'
import ShowLayout from '../components/layout/ShowLayout.vue'

const url =
'https://github.com/JaimeTorrealba/my-trejs-playground/blob/main/src/components/shaders_experiments/wave/TheExperience.vue'
const title = 'Wave Shader Animation when click'
</script>
<template>
  <show-layout :sourceLink="url" :title="title">
    <Wave />
  </show-layout>
</template>
