<script setup>
import mouseShaderEffect from '../components/mouseShaderEffect/entryPoint.vue';
import ShowLayout from '../components/layout/ShowLayout.vue';

const url = "https://github.com/JaimeTorrealba/my-trejs-playground/blob/main/src/components/entryPoint.vue"
const title = "Shader Mouse transparent Effect"
</script>
<template>
    <Suspense>
        <show-layout :sourceLink="url" :title="title">
            <mouse-shader-effect />
        </show-layout>
    </Suspense>
</template>
<style scoped></style>