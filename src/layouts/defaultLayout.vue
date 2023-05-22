<script setup>
import { ref } from 'vue'

const drawer = ref(false)
</script>
<template>
  <v-card>
    <v-layout>
      <Transition>
        <v-btn
          v-show="!drawer"
          icon="mdi-menu"
          @click.stop="drawer = !drawer"
          class="floating-button-menu"
        >
        </v-btn>
      </Transition>
      <v-navigation-drawer class="grey-lighten-3" v-model="drawer">
        <v-list>
          <v-list-item
            prepend-avatar="https://avatars.githubusercontent.com/u/63722373?v=4"
            title="Jaime Torrealba"
            subtitle="@jaimebboyjt"
          >
          </v-list-item>
        </v-list>

        <v-divider></v-divider>
        <v-list color="transparent">
          <v-list-item
            v-for="route in $router.options.routes"
            :key="route.path"
          >
            <v-btn :to="route.path" block>{{ route.name }}</v-btn>
          </v-list-item>
          <!--  -->
        </v-list>

        <template v-slot:append>
          <div class="pa-2">
            <v-btn block> Contact me </v-btn>
          </div>
        </template>
      </v-navigation-drawer>
      <v-main style="min-height: 100vh; background-color: #111">
        <slot />
      </v-main>
    </v-layout>
  </v-card>
</template>

<style scoped>
.floating-button-menu {
  position: absolute;
  top: 2%;
  left: 2%;
  z-index: 9999;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
