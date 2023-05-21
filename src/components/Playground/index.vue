<script setup>
import Earth from './earthWithWaves/TheExperience.vue'
import showProjects from './showProjects/TheExperience.vue'
import ShowLayout from '@/components/layout/ShowLayout.vue'

const url =
  'None'
const title = 'None'
</script>
<template>
  <show-layout :sourceLink="url" :title="title">
    <showProjects />
  </show-layout>
</template>
<style scoped></style>
