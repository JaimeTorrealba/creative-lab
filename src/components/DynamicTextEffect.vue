<script setup>
import { ref, watch,watchEffect, onMounted } from 'vue'
import { TresCanvas, useRenderLoop, useTres, useLoader } from '@tresjs/core'
import { Text3D } from '@tresjs/cientos'
import { Mesh, MeshMatcapMaterial } from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import { useMouse, useWindowSize } from '@vueuse/core'
import matcap from "../assets/matcap.png"


const name = ref('')
const username = ref('')
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
const meshNameText = new Mesh(
  new TextGeometry(name.value, textOptions).center(),
  material
  )
const meshUsernameText = new Mesh(
  new TextGeometry(username.value, textOptions).center(),
  material
  )
  meshNameText.name = 'text3DName'
  meshUsernameText.name = 'text3DUsername'
  meshNameText.position.set(-1, 0, -3)
  meshUsernameText.position.set(-1, -1, -3)
onMounted(() => {
  useTres().scene.value.add(meshNameText, meshUsernameText)
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
  x.value = (x.value / width.value) * 3 - 1
  y.value = -(y.value / height.value) * 3 + 1
})

const { onLoop } = useRenderLoop()
onLoop(() => {
  if (useTres().scene?.value) {
    const nameText = useTres().scene.value.getObjectByName('text3DName')
    const usernameText = useTres().scene.value.getObjectByName('text3DUsername')
    nameText.lookAt(x.value, y.value, 0)
    usernameText.lookAt(x.value, y.value, 0)
  }
})
</script>
<template>
  <div class="container">
    <div class="center-grid">
      <div>
        <div class="field">
          <label class="label">Name</label>
          <div class="control">
            <input class="input" type="text" v-model="name" placeholder="Text input" />
          </div>
        </div>

        <div class="field">
          <label class="label">Username</label>
          <div class="control has-icons-left has-icons-right">
            <input
              class="input is-success"
              type="text"
              placeholder="Text input"
              v-model="username"
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
    </div>
    <div class="">
      <TresCanvas clear-color="#333">
        <TresPerspectiveCamera
          :position="[0, 0, 4]"
          :fov="45"
          :aspect="1"
          :near="0.1"
          :far="1000"
        />
        <Suspense>
          <TresGroup>
            <Text3D text="Welcome" :size="0.2" :font="fontPath" :position="[-1, 1, -3]" />
          </TresGroup>
        </Suspense>
        <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" cast-shadow />
        <TresAmbientLight />
      </TresCanvas>
    </div>
  </div>
</template>
<style scoped>
.container {
  display: grid;
  grid-template-columns: 0.5fr 1fr;
  min-height: 90%;
  border-radius: 4px;
}
.center-grid {
  display: grid;
  place-items: center;
  color: 'white';
  background-color: aliceblue;
}
</style>
