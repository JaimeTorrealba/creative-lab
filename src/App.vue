<script setup>
import Loader from "@/components/Loader.vue";
</script>
<template>
  <component :is="$route.meta.layout || 'div'">
    <Suspense>
      <router-view></router-view>
      <template #fallback>
        <div class="center-screen">
          <Loader />
        </div>
      </template>
    </Suspense>
  </component>
</template>

<style lang="scss">
@font-face {
  font-family: "CascadiaCode";
  font-display: swap;
  src: local("CascadiaCode"), url("./assets/fonts/CascadiaCode.woff2") format("truetype");
}
.tp-dfwv {
  z-index: 9999 !important;
}
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  font-family: "CascadiaCode";
}
#app {
  width: 100%;
  background-color: #000;
}

.debug {
  border: 1px solid red;
}

.center-screen {
  min-height: 100vh;
  display: grid;
  place-items: center;
}
</style>
