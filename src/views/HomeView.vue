<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
import Cards from "@/components/TheCard.vue";
import RRSS from "@/components/RRSS.vue";
import { BLACK_LIST_PATHS } from "../utils";
import NavBar from "../components/NavBar.vue";

//TODO route query params for filter by tag

const router = useRouter();
const data = ref();
const allRoutes = computed(() => router.options.routes);
const filteredRoutes = allRoutes.value.filter(
  (route) => !BLACK_LIST_PATHS.includes(route.path)
);
data.value = filteredRoutes;

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
     <!-- grid is-col-min-13 is-gap-2 -->
    <div class="masonry py-4">
      <div class="cell" v-for="route in data" :key="route.path">
        <Cards :data="route" />
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


.masonry {
  column-gap: var(--masonry-gap, 1.5rem);
  column-count: 6;
  @media screen and (max-width: 1696px) {
    column-count: 5;
  }
  @media screen and (max-width: 1440px) {
    column-count: 4;
  }
  @media screen and (max-width: 1024px) {
    column-count: 3;
  }
  @media screen and (max-width: 768px) {
    column-count: 2;
  }
  @media screen and (max-width: 480px) {
    column-count: 1;
  }

}

.masonry > .cell {
  break-inside: avoid;
  margin-bottom: var(--masonry-gap, 1.5rem);
  width: 100%;
  max-width: 350px;
}
</style>
