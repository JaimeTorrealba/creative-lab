<script setup>
import MixHTML from '@/components/MixHTML.vue'
import ShowLayout from '../components/layout/ShowLayout.vue'

const url =
  'https://github.com/JaimeTorrealba/my-trejs-playground/blob/main/src/components/MixHTML.vue'
const title = 'Mix HTML + TresJs'
</script>
<template>
  <show-layout :sourceLink="url" :title="title">
    <MixHTML />
  </show-layout>
</template>
<style scoped></style>
