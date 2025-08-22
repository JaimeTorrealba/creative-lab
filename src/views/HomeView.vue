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
  <h1 class="has-text-centered is-size-1">Welcome to my creative lab</h1>
  <h2 class="is-size-4 has-text-centered py-4">
    All the code is free, take what you like, and if you have questions please contact me
  </h2>
  <section class="d-flex justify-center pb-6">
    <RRSS />
  </section>
  <div>
    <NavBar class="sticky-nav" @searchResult="(value) => updateSearch(value)" />
      <!-- BODY -->
      <v-row class="pa-lg-8" flex justify="space-around">
        <v-col v-for="route in data" :key="route.path">
          <Cards :data="route" class="scrollTriggerRef" />
        </v-col>
      </v-row>
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
.sticky-nav {
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
