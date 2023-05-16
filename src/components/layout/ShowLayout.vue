<script setup>
import loader from './theLoader.vue';
defineProps({
  sourceLink: {
    type: String,
    required: false
  },
  title: {
    type: String,
    required: false
  }
})
</script>
<template>
   <h1 class="title is-size-3">{{ title }}</h1>
   <Suspense>
     <slot />
     <template #fallback>
      <loader />
    </template>
    </Suspense>
  <a :href="sourceLink" target="_blank" class="float-button">
    <img src="../../assets/github-logo.svg" width="32" height="32" />
  </a>
  <div class="versions">
      <p>Tres Version: <strong class="text-white">2.0.0</strong></p>
      <p>Cientos Version: <strong class="text-white">2.0.0</strong></p>
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
.text-white{
  color:#c7c7c7
}
.title {
  position: fixed;
  top: 95%;
  color:#f7f7f7;
  z-index: 1000;
  text-align: center;
  width: 100vw;
  font-family: 'CascadiaCode';
}
</style>
