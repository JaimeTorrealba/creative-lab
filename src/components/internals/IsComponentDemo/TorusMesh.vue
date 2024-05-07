<script setup>
</script>
<template>
    <TresMesh>
        <TresTorusGeometry :args="[1, 0.4, 16, 100]" />
        <TresMeshBasicMaterial :color="0xff0000" transparent />
    </TresMesh>
</template>