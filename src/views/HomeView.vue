<script setup>
import Earth from '@/components/theEarth.vue'
import ShowLayout from '../components/layout/ShowLayout.vue';
</script>
<template>
    <Suspense>
        <show-layout>
            <Earth />
        </show-layout>
    </Suspense>
</template>
<style scoped></style>