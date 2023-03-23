<script setup>
const props = defineProps({
  sourceLink: {
    type: String,
    required: false
  }
})
console.log('jaime ~ props:', props)
</script>
<template>
  <!-- <h1>{{ myProps }}</h1> -->
  <slot />
  <a :href="sourceLink" target="_blank" class="float-button">
    <img src="../../assets/github-logo.svg" width="32" height="32" />
  </a>
  <div class="versions">
      <p>Tres Version: <strong>2.0.0-alpha.1</strong></p>
      <p>Cientos Version: <strong>2.0.0-alpha.1</strong></p>
  </div>
</template>
<style scoped>
.float-button {
  position: fixed;
  bottom: 5%;
  right: 5%;
}
.versions {
  position: fixed;
  bottom: 5%;
  left: 2.5%;
  color:#c7c7c7
}
</style>
