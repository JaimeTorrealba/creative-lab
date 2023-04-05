<script setup>
import glassMorphism from '@/components/glassMorphism.vue'
import ShowLayout from '../components/layout/ShowLayout.vue'

const url =
  'https://github.com/JaimeTorrealba/my-trejs-playground/blob/main/src/components/glassMorphism.vue'
const title = 'Simple glass morphism effect, on 3D'
</script>
<template>
  <show-layout :sourceLink="url" :title="title">
    <glassMorphism />
  </show-layout>
</template>
<style scoped></style>
