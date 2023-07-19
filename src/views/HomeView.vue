<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
import Cards from '@/components/TheCard.vue'

const router = useRouter()
const rawData = computed(() => router.options.routes)

const data = rawData.value.filter((route) => route.path !== '/')

onMounted(() => {
  const scrollTriggerRef = gsap.utils.toArray('.scrollTriggerRef')
  scrollTriggerRef.map((card) => {
    ScrollTrigger.create({
      trigger: card,
      start: 'top 75%',
      animation: gsap.from(card, { duration: 0.75, opacity: 0 })
    })
  })
})
</script>
<template>
  <v-container class="pa-16 bg">
    <h1 class="text-center text-h3">Welcome to my creative lab</h1>
    <v-row class="pa-8" flex justify="space-around">
      <v-col cols="4" v-for="route in data" :key="route.path">
        <Cards :data="route" v-if="route.path !== '/'" class="scrollTriggerRef" />
      </v-col>
    </v-row>
    <v-footer class="text-center d-flex flex-column rounded">
      <div class="d-flex align-center">
        <a href="https://twitter.com/jaimebboyjt" rel="noreferrer" target="_blank" class="mx-4">
          <img cover src="/images/twitter-logo.svg" />
        </a>
        <a href="https://github.com/JaimeTorrealba" rel="noreferrer" target="_blank" class="mx-4">
          <img src="/images/github-logo.svg" />
        </a>
        <a
          href="https://www.linkedin.com/in/jaime-torrealba-cordova/"
          rel="noreferrer"
          target="_blank"
          class="mx-4"
        >
          <img src="/images/Linkedin-logo.svg" />
        </a>
        <a href="https://codepen.io/jaime_torrealba" rel="noreferrer" target="_blank" class="mx-4">
          <img src="/images/codepen-logo.svg" />
        </a>
      </div>

      <div class="pt-0">
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
p {
  font-size: 1.2rem;
}
li {
  line-height: 1.75rem;
}

.bg {
  background-color: #333;
  min-height: 100vh;
  min-height: 100dvh;
}
</style>
