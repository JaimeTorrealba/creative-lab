<script setup>
</script>
<template>
    <TresMesh>
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshBasicMaterial :color="0x00ff00" transparent />
    </TresMesh>
</template>