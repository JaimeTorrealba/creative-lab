<script setup>
import NotFoundDemo from '@/components/demos/NotFoundDemo.vue'
</script>

<template>
  <div style="position: relative; width: 100vw; height: 100vh">
    <TresCanvas window-size clear-color="#0a0a0a">
      <TresPerspectiveCamera :position="[0, 0, 10]" />
      <Suspense>
        <NotFoundDemo />
      </Suspense>
    </TresCanvas>
    <div class="overlay">
      <p class="subtitle has-text-light mb-4">Page not found</p>
      <router-link to="/">
        <button class="button is-link is-inverted">Back home</button>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: absolute;
  bottom: 12%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  pointer-events: none;
  white-space: nowrap;
}
.overlay a,
.overlay button {
  pointer-events: all;
}
</style>
