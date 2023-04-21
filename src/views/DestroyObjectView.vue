<script setup>
import TheDestroyEffect from '@/components/destroyObject.vue'
import ShowLayout from '../components/layout/ShowLayout.vue'

const url =
  'https://github.com/JaimeTorrealba/my-trejs-playground/blob/main/src/components/destroyObject.vue'
const title = 'Destroy object animation'
</script>
<template>
  <show-layout :sourceLink="url" :title="title">
    <TheDestroyEffect />
  </show-layout>
</template>
<style scoped></style>
