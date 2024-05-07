<script setup>
</script>
<template>
    <TresMesh>
        <TresSphereGeometry :args="[1, 16]" />
        <TresMeshBasicMaterial :color="0x00ff" transparent />
    </TresMesh>
</template>