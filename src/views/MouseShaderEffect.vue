<script setup>
import mouseShaderEffect from '../components/mouseShaderEffect/theExperience.vue'
import ShowLayout from '../components/layout/ShowLayout.vue'

const url =
  'https://github.com/JaimeTorrealba/my-trejs-playground/blob/main/src/components/mouseShaderEffect/theExperience.vue'
const title = 'Shader Mouse transparent Effect'
</script>
<template>
  <show-layout :sourceLink="url" :title="title">
    <mouse-shader-effect />
  </show-layout>
</template>
<style scoped></style>
