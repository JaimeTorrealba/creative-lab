<script setup>
import { ref, watch, watchEffect, onMounted } from 'vue'
import { TresCanvas, useRenderLoop, useTres, useLoader } from '@tresjs/core'
import { Mesh, MeshMatcapMaterial } from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import { useMouse, useWindowSize } from '@vueuse/core'
import matcap from '../assets/matcap.png'

const name = ref('')
const username = ref('')
const nameObject = ref(null)
const usernameObject = ref(null)
const { x, y } = useMouse()
const { width, height } = useWindowSize()

const loader = new FontLoader()
const fontPath = 'https://raw.githubusercontent.com/Tresjs/assets/main/fonts/FiraCodeRegular.json'
const font = await loader.loadAsync(fontPath)

const matcaptexture = await useLoader(TextureLoader, matcap)

const textOptions = {
  font: font,
  size: 0.2,
  height: 0.1,
  curveSegments: 5,
  bevelEnabled: true,
  bevelThickness: 0.05,
  bevelSize: 0.02,
  bevelOffset: 0,
  bevelSegments: 4
}
const material = new MeshMatcapMaterial({
  matcap: matcaptexture
})
const meshNameText = new Mesh(new TextGeometry(name.value, textOptions).center(), material)
const meshUsernameText = new Mesh(new TextGeometry(username.value, textOptions).center(), material)
const welcomeText = new Mesh(new TextGeometry('Welcome', textOptions).center(), material)
meshNameText.name = 'text3DName'
meshUsernameText.name = 'text3DUsername'
meshNameText.position.set(-1, 0, -3)
meshUsernameText.position.set(-1, -1, -3)
welcomeText.position.set(-1, 1, -3)
onMounted(() => {
  useTres().scene.value.add(meshNameText, meshUsernameText, welcomeText)
  nameObject.value = useTres().scene.value.getObjectByName('text3DName')
  usernameObject.value = useTres().scene.value.getObjectByName('text3DUsername')
})

watch(name, () => {
  if (useTres().scene) {
    const currentText = useTres().scene.value.getObjectByName('text3DName')
    if (currentText) {
      currentText.geometry.dispose()
      currentText.geometry = new TextGeometry(name.value, textOptions)
      currentText.geometry.center()
    }
  }
})
watch(username, () => {
  if (useTres().scene) {
    const currentText = useTres().scene.value.getObjectByName('text3DUsername')
    if (currentText) {
      currentText.geometry.dispose()
      currentText.geometry = new TextGeometry(username.value, textOptions)
      currentText.geometry.center()
    }
  }
})
watchEffect(() => {
  x.value = (x.value / width.value) * 3 - 2
  y.value = -(y.value / height.value) * 3 + 1
})

const { onLoop } = useRenderLoop()
onLoop(() => {
  if (nameObject.value && usernameObject.value) {
    nameObject.value.lookAt(x.value, y.value, 0)
    usernameObject.value.lookAt(x.value, y.value, 0)
    welcomeText.lookAt(x.value, y.value + 1, 0)
  }
})
</script>
<template>
  <div class="columns container-playground is-gapless">
    <div class="column p-2 is-one-third center-grid">
      <div>
        <h2 class="is-size-4 has-text-centered">Welcome</h2>
        <p>Please write your name on the inputs</p>
      </div>
      <div>
        <div class="field">
          <label class="label">Name</label>
          <div class="control">
            <input
              class="input"
              type="text"
              v-model="name"
              placeholder="Ej: Jaime"
              maxlength="15"
            />
          </div>
        </div>

        <div class="field">
          <label class="label">Username</label>
          <div class="control has-icons-left has-icons-right">
            <input
              class="input is-success"
              type="text"
              placeholder="Ej: jaimebboyjt"
              v-model="username"
              maxlength="15"
            />
            <span class="icon is-small is-left">
              <i class="fas fa-user"></i>
            </span>
            <span class="icon is-small is-right">
              <i class="fas fa-check"></i>
            </span>
          </div>
        </div>
      </div>
      <p class="is-size-7">Licence MIT</p>
    </div>
    <div class="column">
      <TresCanvas clear-color="#333">
        <TresPerspectiveCamera
          :position="[0, 0, 4]"
          :fov="45"
          :aspect="1"
          :near="0.1"
          :far="1000"
        />
        <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" cast-shadow />
        <TresAmbientLight />
      </TresCanvas>
    </div>
  </div>
</template>
<style scoped>
.container-playground {
  min-height: 90%;
  padding: 0 5%;
}
.center-grid {
  display: grid;
  place-items: center;
  color: 'white';
  background-color: aliceblue;
}
</style>
