<script setup>
import DynamicTextEffect from '@/components/DynamicTextEffect.vue'
import ShowLayout from '../components/layout/ShowLayout.vue';

const url = "https://github.com/JaimeTorrealba/my-trejs-playground/blob/main/src/components/DynamicTextEffect.vue"
const title = "Reactive 3D text effect"
</script>
<template>
    <Suspense>
        <show-layout :sourceLink="url" :title="title">
            <DynamicTextEffect />
        </show-layout>
    </Suspense>
</template>
<style scoped></style>