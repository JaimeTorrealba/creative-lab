<script setup>
const inspirations = [
  {
    name: 'Frontend Horse',
    link: 'https://www.youtube.com/@TrostCodes'
  },
  {
    name: 'Bruno Simon',
    link: 'https://threejs-journey.com/'
  },
  {
    name: 'Yuri Artyukh',
    link: 'https://www.youtube.com/@akella_'
  },
  {
    name: 'Gsap showcase',
    link: 'https://greensock.com/showcase/'
  },
  {
    name: 'Awwwards',
    link: 'https://www.awwwards.com/'
  },
  {
    name: 'Dribble',
    link: 'https://dribbble.com/'
  },
  {
    name: 'React three (ecosystem)',
    link: 'https://github.com/pmndrs'
  },
  {
    name: 'Codepen',
    link: 'https://codepen.io'
  }
]
const resources = [
  {
    name: 'Threejs',
    link: 'https://threejs.org/'
  },
  {
    name: 'TresJs (ecosystem)',
    link: 'https://tresjs.org/'
  },
  {
    name: '3dtextures (textures)',
    link: 'https://3dtextures.me/'
  },
  {
    name: 'withpoly (textures)',
    link: 'https://withpoly.com/'
  },
  {
    name: 'Polyhaven (textures)',
    link: 'https://polyhaven.com/'
  },
  {
    name: 'Poly.pizza (models)',
    link: 'https://poly.pizza/'
  },
  {
    name: 'Sketchfab (models)',
    link: 'https://sketchfab.com/'
  }
]
</script>
<template>
  <v-container fluid class="pa-16 bg">
    <h1 class="text-center text-h3">Jaime's lab</h1>
    <v-row class="pa-8">
      <h2 class="text-h4">Hi thank for been here, this is my personal creative lab</h2>
      <!--  -->
      <p>
        All the code here is free and if you have any doubt please feel free to contact me directly
      </p>
      <p></p>
      
    </v-row>
    <!-- <v-row class="pa-8">
      <v-col>
        <h3 class="text-h5 mb-4">
          I take several inspiration from several resource here are some of them:
        </h3>
          <v-list style="background-color: #222;">
            <v-list-item v-for="{ name, link } in inspirations" :key="name">
              <a :href="link" target="_blank">
                <v-list-item-title v-text="name"></v-list-item-title>
              </a>
            </v-list-item>
            <v-list-item style="color: #f7f7f7;">To all thanks</v-list-item>
          </v-list>
      </v-col>
      <v-col>
        <h3 class="text-h5 mb-4">Also I use several models/code/textures</h3>
        <v-list-item v-for="{ name, link } in resources" :key="name">
          <a :href="link" target="_blank">
            <v-list-item-title v-text="name"></v-list-item-title>
          </a>
        </v-list-item>
      </v-col>
    </v-row>
    <v-row class="pa-8">
      <v-col class="d-flex justify-center">
        <v-btn to="/contactme" variant="outlined">Go to Contact me</v-btn>
      </v-col>
    </v-row> -->
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
  background-color: #222;
  min-height: 100vh;
  min-height: 100dvh;
}
</style>
