<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const data = router.currentRoute.value
</script>
<template>
  <v-layout>
    <v-main style="min-height: 100vh;" ref="navigationRef">
      <div class="floating-back">
        <v-tooltip location="bottom">
          <template v-slot:activator="{ props }">
              <v-btn icon v-bind="props" to="/" >
                <v-icon color="grey-lighten-1"> mdi-arrow-left-bold </v-icon>
              </v-btn>
          </template>
          <span>Go to home</span>
        </v-tooltip>
      </div>
      <slot />
      <div class="floating-source">
        <v-tooltip location="top">
          <template v-slot:activator="{ props }">
            <a :href="data.meta.sourceCode" target="_blank" >
              <v-btn icon v-bind="props" >
                <v-icon color="grey-lighten-1"> mdi-code-tags </v-icon>
              </v-btn>
            </a>
          </template>
          <span>Go to github</span>
        </v-tooltip>
      </div>
      <div class="floating-description">
        <v-tooltip location="bottom" max-width="300">
          <template v-slot:activator="{ props }">
              <v-btn icon v-bind="props" >
                <v-icon color="grey-lighten-1"> mdi-help </v-icon>
              </v-btn>
          </template>
          <span>{{ data.meta.description }}</span>
        </v-tooltip>
      </div>

    </v-main>
  </v-layout>
</template>

<style scoped>
.floating-back {
  position: fixed;
  top: 2%;
  left: 2%;
  z-index: 9999;
}
.floating-source {
  position: fixed;
  bottom: 10%;
  right: 2%;
  z-index: 9999;
}
.floating-description {
  position: fixed;
  bottom: 2%;
  right: 2%;
  z-index: 9999;
}

</style>
