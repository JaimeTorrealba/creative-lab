<script setup>
import { ref, watchEffect } from 'vue'
import { TresCanvas, useRenderLoop, useTexture } from '@tresjs/core'
import { Text3D, Stars } from '@tresjs/cientos'
import { useMouse, useWindowSize } from '@vueuse/core'
import matcapURL from '../../assets/matcap.png'

const name = ref('')
const username = ref('')

const welcomeRef = ref(null)
const nameRef = ref(null)
const usernameRef = ref(null)
const { x, y } = useMouse()
const { width, height } = useWindowSize()

const fontPath = 'https://raw.githubusercontent.com/Tresjs/assets/main/fonts/FiraCodeRegular.json'

const { matcap: matcapTexture } = await useTexture({matcap: matcapURL})

const textOptions = {
  size: 0.2,
  height: 0.1,
  curveSegments: 5,
  bevelEnabled: true,
  bevelThickness: 0.05,
  bevelSize: 0.02,
  bevelOffset: 0,
  bevelSegments: 4
}

watchEffect(() => {
  x.value = (x.value / width.value) * 3 - 2
  y.value = -(y.value / height.value) * 3 + 1
})

const { onLoop } = useRenderLoop()
onLoop(() => {
  if(welcomeRef.value && nameRef.value && usernameRef.value){
    welcomeRef.value.value.lookAt(x.value, y.value + 1, 0)
    nameRef.value.value.lookAt(x.value, y.value + 1, 0)
    usernameRef.value.value.lookAt(x.value, y.value + 1, 0)
  }

})
</script>
<template>
  <v-row class="fullscreen" align="center" no-gutters>
    <v-col cols="4" class="px-4 ">
      <h1 class="title-4 text-center">Welcome</h1>
      <h2 class="title-2">Please write your fill out the form, to see the effect</h2>
      <v-text-field label="Name" class="my-4" variant="outlined" v-model="name" />
      <v-text-field label="Username" class="my-4" variant="outlined" v-model="username" />
      <p class="is-size-7">Licence MIT</p>
    </v-col>
    <v-col class="fullscreen border-section">
      <TresCanvas clear-color="#111">
        <TresPerspectiveCamera
          :position="[0, 0, 4]"
          :fov="45"
          :aspect="1"
          :near="0.1"
          :far="1000"
        />
        <Suspense>
          <Text3D
            text="Welcome"
            ref="welcomeRef"
            :font="fontPath"
            :position="[-1, 1, -3]"
            center
            v-bind="textOptions"

          >
            <TresMeshMatcapMaterial :matcap="matcapTexture" />
          </Text3D>
        </Suspense>
        <Suspense>
          <Text3D
            :text="name || ' '"
            ref="nameRef"
            :font="fontPath"
            :position="[-1, 0, -3]"
            center
            v-bind="textOptions"
            need-updates 
            >
          <TresMeshMatcapMaterial :matcap="matcapTexture" />
        </Text3D>
        </Suspense>
        <Suspense>
          <Text3D
            :text="username || ' '"
            ref="usernameRef"
            :font="fontPath"
            :position="[-1, -1, -3]"
            center
            v-bind="textOptions"
            need-updates 
            >
          <TresMeshMatcapMaterial :matcap="matcapTexture" />
        </Text3D>
        </Suspense>
        <Stars />

        <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" cast-shadow />
        <TresAmbientLight />
      </TresCanvas>
    </v-col>
  </v-row>
</template>
<style scoped>
.border-section{
  border-left: 1px solid #ccc;
}
.fullscreen {
  height: 100vh;
}
</style>
