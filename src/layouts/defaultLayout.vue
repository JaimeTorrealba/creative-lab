<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { HomeIcon, CodeBracketIcon, DocumentTextIcon } from "@heroicons/vue/24/solid";
import Tooltip from "@/components/Tooltip.vue";

const router = useRouter();
const data = router.currentRoute.value;

const showTooltipBack = ref(false);
const showTooltipCode = ref(false);
const showTooltipDesc = ref(false);
</script>
<template>
  <main style="min-height: 100vh">
    <div class="floating-back">
      <router-link to="/">
        <Tooltip text="Back home" :show="showTooltipBack" anchor="right" >
          <button
            class="button is-link is-inverted mr-1"
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
        <Tooltip text="Go to GitHub" :show="showTooltipCode" anchor="right">
          <button
            class="button is-link is-inverted mr-1"
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
      <Tooltip :text="data.meta.description" :show="showTooltipDesc" anchor="center right" click-outside @close="showTooltipDesc = false">
        <button
          class="button is-link is-inverted mr-1"
          @click="showTooltipDesc = !showTooltipDesc"
        >
          <!-- @mouseleave="showTooltipDesc = false" -->
          <span class="icon is-small">
            <DocumentTextIcon />
          </span>
        </button>
      </Tooltip>
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
  top: 6%;
  left: 2%;
  z-index: 9999;
}
.floating-description {
  position: fixed;
  top: 10%;
  left: 2%;
  z-index: 9999;
}
</style>
