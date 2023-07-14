<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const show = ref(false)

defineProps({
  data: {
    type: Object,
    required: true
  }
})

const router = useRouter()
</script>
<template>
  <v-card class="mx-auto" max-width="344" dark>
      <v-img :src="data.meta.img" @click="router.push(data.path)" height="200px" cover></v-img>

    <v-card-title> {{ data.name }} </v-card-title>

    <v-card-subtitle> {{ data.meta.name }} </v-card-subtitle>
    <v-divider class="mx-4 my-1"></v-divider>

    <div class="px-4">
      <v-chip-group>
        <a :href="data.meta.sourceCode" target="_blank">
          <v-chip>Source code</v-chip>
        </a>
        <v-chip>{{ data.meta.difficulty }}</v-chip>
        <v-chip>{{ data.meta.section }}</v-chip>
        <a href="https://cientos.tresjs.org/" target="_blank">
          <v-chip color="primary" variant="outlined" v-show="data.meta.isOnTres"
            >Abstraction on cientos
          </v-chip>
        </a>
      </v-chip-group>
    </div>

    <v-card-actions>
      <v-btn color="primary" variant="text" :to="data.path">Go to demo</v-btn>

      <v-spacer></v-spacer>

      <v-btn :icon="show ? 'mdi-chevron-up' : 'mdi-chevron-down'" @click="show = !show"></v-btn>
    </v-card-actions>

    <v-expand-transition>
      <div v-show="show">
        <v-divider></v-divider>

        <v-card-text>
          {{ data.meta.description }}
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>
