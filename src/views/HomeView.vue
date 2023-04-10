<script setup>
import Earth from '@/components/theEarth.vue'
import ShowLayout from '../components/layout/ShowLayout.vue'

const url =
  'https://github.com/JaimeTorrealba/my-trejs-playground/blob/main/src/components/theEarth.vue'
const title = '3D earth, clouds paralax, markers'
</script>
<template>
  <show-layout :sourceLink="url" :title="title">
    <Earth />
  </show-layout>
</template>
<style scoped></style>
