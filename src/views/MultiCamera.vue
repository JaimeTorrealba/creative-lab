<script setup>
import MultiCamera from '../components/MultiCamera.vue'
import ShowLayout from '../components/layout/ShowLayout.vue'

const url =
  'https://github.com/JaimeTorrealba/my-trejs-playground/blob/main/src/components/MultiCamera.vue'
const title = 'Multi Camera with animation model'
</script>
<template>
  <show-layout :sourceLink="url" :title="title">
    <MultiCamera />
  </show-layout>
</template>
<style scoped></style>
