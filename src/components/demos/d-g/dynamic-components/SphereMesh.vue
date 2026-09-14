<script setup></script>
<template>
  <TresMesh>
    <TresSphereGeometry :args="[1, 16]" />
    <TresMeshStandardMaterial :color="0x00ff" transparent />
  </TresMesh>
</template>
