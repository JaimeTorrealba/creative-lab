<script setup>
import Earth from '@/components/theEarth.vue'
import ShowLayout from '../components/layout/ShowLayout.vue';

const url = "https://github.com/JaimeTorrealba/my-trejs-playground/blob/main/src/components/theEarth.vue"
const title = "Simple 3D earth, with cloud paralax effect"
</script>
<template>
    <Suspense>
        <show-layout :sourceLink="url" :title="title">
            <Earth />
        </show-layout>
    </Suspense>
</template>
<style scoped></style>