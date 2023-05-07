<script setup>
import infiniteBeam from '../components/infiniteBeam.vue'
import ShowLayout from '../components/layout/ShowLayout.vue'

const url =
  'https://github.com/JaimeTorrealba/my-trejs-playground/blob/main/src/components/infiniteBeam.vue'
const title = 'Infinite particles moving'
</script>
<template>
  <show-layout :sourceLink="url" :title="title">
    <infiniteBeam />
  </show-layout>
</template>
<style scoped></style>
