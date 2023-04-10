<script setup>
import darkStar from '@/components/darkStar/TheExperience.vue'
import ShowLayout from '../components/layout/ShowLayout.vue'

const url =
  'https://github.com/JaimeTorrealba/my-trejs-playground/blob/main/src/components/darkStar/TheExperience.vue'
const title = 'Courius fragment Shader effect, fresnel + noise + rotation matrix'
</script>
<template>
  <show-layout :sourceLink="url" :title="title">
    <darkStar />
  </show-layout>
</template>
<style scoped></style>
