<script setup>
import { onMounted, computed, ref, shallowRef, nextTick, watch } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { vLog } from '@tresjs/cientos'
import { useWindowSize } from '@vueuse/core'
import { TextureLoader, PlaneGeometry, MeshBasicMaterial, Mesh } from 'three'

const { width, height } = useWindowSize()
const fov = computed(() => 2 * Math.atan(height.value / 2 / 600) * (180 / Math.PI))
const meshesData = ref([])
const canvasRef = shallowRef()
// const reRenderValue = ref(0)
// todo infinite height?
// todo no update meshes

const getImagesData = () => {
  console.log('jaime ~ getImagesData ~ images:');
  meshesData.value = []
  const images = [...document.querySelectorAll('img')] // convert to array
  images.map(img => {
    const bound = img.getBoundingClientRect()
    const geometry = new PlaneGeometry(bound.width, bound.height, 1, 1)
    const material = new MeshBasicMaterial({
      // map: new TextureLoader().load(img.src),
      // transparent: true,
      color: 'red'
    })
    const mesh = new Mesh(geometry, material)
    mesh.position.y = -bound.top + height.value / 2
    mesh.position.x = bound.left - width.value / 2
    meshesData.value.push(mesh)
  })
}
onMounted(async () => {
  await nextTick()
  getImagesData()
  meshesData.value.map(mesh => canvasRef.value.context.scene.value.add(mesh))
  // canvasRef.value.context.scene.value.add()

  // reRenderValue.value ++ // no re-renderiza
})

watch([width, height], () => getImagesData())

</script>
<template>
  <main class="html-page">
    <v-row class="row-container" align="center">
      <v-col class="image-container" cols="4">
        <img class="img" src="/images/imgToShader.jpg" alt="image" />
      </v-col>
      <v-col class="image-container" cols="4">
        <img class="img" src="/images/imgToShader.jpg" alt="image" />
      </v-col>
      <v-col class="image-container" cols="4">
        <img class="img" src="/images/imgToShader.jpg" alt="image" />
      </v-col>
      <v-col class="image-container" cols="4">
        <img class="img" src="/images/imgToShader.jpg" alt="image" />
      </v-col>
      <v-col class="image-container" cols="4">
        <img class="img" src="/images/imgToShader.jpg" alt="image" />
      </v-col>
      <v-col class="image-container" cols="4">
        <img class="img" src="/images/imgToShader.jpg" alt="image" />
      </v-col>
    </v-row>
  </main>
  <TresCanvas window-size clear-color="transparent" ref="canvasRef" class="canvas-style" :key="reRenderValue">
    <TresPerspectiveCamera :args="[fov, width / height, 100, 2000]" :position="[0, 0, 600]" />

    <!--<TresGroup ref="wrapperRef">
         <TresMesh v-for="mesh in meshesData" :key="mesh.uuid" :geometry="mesh.geometry" :material="mesh.material"
        :position="mesh.position" />
      </TresGroup> -->

    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>
<style scoped>
.canvas-style {
  position: fixed;
  z-index: -1;
  top: 0;
  left: 0;
}

.html-page {
  background-color: transparent;
}

.row-container {
  padding: 0.5rem;
}

.img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>