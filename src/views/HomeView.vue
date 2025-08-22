<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
import Cards from "@/components/TheCard.vue";
import RRSS from "@/components/RRSS.vue";
import { BLACK_LIST_PATHS } from "../utils";
import NavBar from "../components/NavBar.vue";

const router = useRouter();
const data = ref();
const allRoutes = computed(() => router.options.routes);
const filteredRoutes = allRoutes.value.filter(
  (route) => !BLACK_LIST_PATHS.includes(route.path)
);
data.value = filteredRoutes;

onMounted(() => {
  const scrollTriggerRef = gsap.utils.toArray(".scrollTriggerRef");
  scrollTriggerRef.map((card) => {
    ScrollTrigger.create({
      trigger: card,
      start: "top 80%",
      animation: gsap.from(card, { duration: 0.75, opacity: 0 }),
    });
  });
});

const updateSearch = (value) => {
  data.value = value;
};
</script>
<template>
  <h1 class="has-text-centered has-text-light is-size-1 mt-6">
    Welcome to my creative lab
  </h1>
  <h2 class="is-size-4 has-text-centered py-4 max_subtitle_size has-text-light">
    All the code is free, take what you like, and if you have questions please contact me,
    also you can give me a github start if this repo have help you :D
  </h2>
  <section class="is-flex is-justify-content-center pb-6">
    <RRSS />
  </section>
  <div>
    <NavBar class="sticky-nav" @searchResult="(value) => updateSearch(value)" />
    <!-- BODY -->
    <div class="grid is-col-min-13 is-gap-2">
      <div class="cell " v-for="route in data" :key="route.path">
        <Cards :data="route" class="scrollTriggerRef" />
      </div>
    </div>
  </div>
</template>
<style scoped>
h1,
h2,
h3,
p,
li,
a,
.router-link-active {
  color: #f7f7f7;
}
.max_subtitle_size {
  width: 70ch;
  margin: auto;
}
.sticky-nav {
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
