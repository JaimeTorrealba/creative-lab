<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
import Cards from '@/components/TheCard.vue'
import { BLACK_LIST_PATHS } from '../utils';

const router = useRouter()
const data = ref()
const search = ref('')
const currentTag = ref('All')
const allRoutes = computed(() => router.options.routes)
const filteredRoutes = allRoutes.value.filter((route) => !BLACK_LIST_PATHS.includes(route.path))
data.value = filteredRoutes

const tags = new Set(data.value.map((route) => route.meta.section))

const goAllRoutes = () => {
  data.value = filteredRoutes
  currentTag.value = 'All'
}

const filterByTag = (tag) => {
  currentTag.value = tag
  data.value = filteredRoutes.filter((demo) => demo.meta.section === tag)
  const scrollTriggerRef = gsap.utils.toArray('.scrollTriggerRef')
  scrollTriggerRef.map((card) => {
    gsap.to(card, { duration: 0.5, opacity: 1 })
  })
}

watch(search, (newVal) => {
  if (newVal) {
    search.value = newVal.toLowerCase()
    const filterKeyResult = data.value.filter((route) => {
      const routeName = route.name.toLowerCase()
      return routeName.includes(search.value)
    })
    const scrollTriggerRef = gsap.utils.toArray('.scrollTriggerRef')
  scrollTriggerRef.map((card) => {
    gsap.to(card, { duration: 0.5, opacity: 1 })
  })
    data.value = filterKeyResult;
  } else {
    if(currentTag.value !== 'All'){
      filterByTag(currentTag.value)
      } else {
      goAllRoutes()
    }
  }
})


onMounted(() => {
  const scrollTriggerRef = gsap.utils.toArray('.scrollTriggerRef')
  scrollTriggerRef.map((card) => {
    ScrollTrigger.create({
      trigger: card,
      start: 'top 80%',
      animation: gsap.from(card, { duration: 0.75, opacity: 0 })
    })
  })
 })
</script>
<template>
  <v-container class="pa-lg-8 bg">
    <h1 class="text-center text-h3">Welcome to my creative lab</h1>
    <div class="d-flex justify-center">
      <v-chip-group class="d-flex justify-center mt-4">
        <v-chip class="mx-2" color="primary" label @click="goAllRoutes()"> All </v-chip>
        <v-chip v-for="tag in tags" :key="tag" class="mx-2" color="primary" label @click="filterByTag(tag)">
          {{ tag }}
        </v-chip>
      </v-chip-group>
    </div>
    <v-responsive class="mx-auto py-4 " max-width="344">
      <v-text-field clearable label="Search demo" variant="outlined" v-model="search"></v-text-field>
    </v-responsive>

    <!-- BODY -->

    <v-row class="pa-lg-8" flex justify="space-around">
      <v-col v-for="route in data" :key="route.path">
        <Cards :data="route" class="scrollTriggerRef" />
      </v-col>
    </v-row>

    <!-- FOOTER -->

    <v-footer class="text-center d-flex flex-column rounded">
      <div class="d-flex align-center">
        <a href="https://twitter.com/jaimebboyjt" rel="noreferrer" target="_blank" class="mx-4">
          <img cover src="/images/twitter-logo.svg" />
        </a>
        <a href="https://github.com/JaimeTorrealba" rel="noreferrer" target="_blank" class="mx-4">
          <img src="/images/github-logo.svg" />
        </a>
        <a href="https://www.linkedin.com/in/jaime-torrealba-cordova/" rel="noreferrer" target="_blank" class="mx-4">
          <img src="/images/Linkedin-logo.svg" />
        </a>
        <a href="https://codepen.io/jaime_torrealba" rel="noreferrer" target="_blank" class="mx-4">
          <img src="/images/codepen-logo.svg" />
        </a>
      </div>

      <div class="pt-4">
        Big thanks to all of my inspirations and resources. <br />
        Feel free to take any code that you want here, and if you have a doubt or suggestion, please
        contact me on my social networks.
      </div>

      <v-divider></v-divider>

      <div>{{ new Date().getFullYear() }} — <strong>MIT License</strong></div>
    </v-footer>
  </v-container>
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

.bg {
  background-color: #333;
  min-height: 100vh;
  min-height: 100dvh;
}
</style>
