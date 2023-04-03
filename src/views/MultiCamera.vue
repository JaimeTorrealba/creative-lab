<script setup>
import MultiCamera from '../components/MultiCamera.vue';
import ShowLayout from '../components/layout/ShowLayout.vue';
import loader from '../components/layout/theLoader.vue';

const url = "https://github.com/JaimeTorrealba/my-trejs-playground/blob/main/src/components/MultiCamera.vue"
const title = "Multi Camera with animation model"
</script>
<template>
    <show-layout :sourceLink="url" :title="title">
            <Suspense>
            <MultiCamera />
            <template #fallback>
                <loader />
              </template>
        </Suspense>
        </show-layout>
</template>
<style scoped></style>