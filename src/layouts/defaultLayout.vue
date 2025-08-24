<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { HomeIcon, CodeBracketIcon } from "@heroicons/vue/24/solid";
import Tooltip from "@/components/Tooltip.vue";

const router = useRouter();
const data = router.currentRoute.value;

const showTooltipBack = ref(false);
const showTooltipCode = ref(false);
</script>
<template>
  <main style="min-height: 100vh">
    <div class="floating-back">
      <router-link to="/">
        <Tooltip text="Back home" :show="showTooltipBack" anchor="right">
          <button
            class="button is-rounded is-link is-inverted"
            @mouseenter="showTooltipBack = true"
            @mouseleave="showTooltipBack = false"
          >
            <span class="icon is-small">
              <HomeIcon />
            </span>
          </button>
        </Tooltip>
      </router-link>
    </div>
    <slot />
    <div class="floating-source">
      <a :href="data.meta.sourceCode" target="_blank">
        <Tooltip text="Go to GitHub" :show="showTooltipCode" anchor="left">
          <button
            class="button is-rounded is-link is-inverted"
            @mouseenter="showTooltipCode = true"
            @mouseleave="showTooltipCode = false"
          >
            <span class="icon is-small">
              <CodeBracketIcon />
            </span>
          </button>
        </Tooltip>
      </a>
    </div>
    <div class="floating-description">
      <v-tooltip location="bottom" max-width="300">
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon color="grey-lighten-1"> mdi-help </v-icon>
          </v-btn>
        </template>
        <span>{{ data.meta.description }}</span>
      </v-tooltip>
    </div>
  </main>
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
