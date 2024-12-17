<script setup>
import { ref, watch } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { TresCanvas } from '@tresjs/core'
import TheExperience from '@/components/demos/Textures_effects/BlurPixelsDemo.vue'


const cameraRef = ref(null)

const { width, height } = useWindowSize()

watch(cameraRef, (camera) => {
    camera.fov = 2 * Math.atan((height.value / 2) / 600) * (180 / Math.PI)
    camera.position.z = 600
    camera.updateProjectionMatrix()
})

//resize
watch(width, () => {
    cameraRef.value.fov = 2 * Math.atan((height.value / 2) / 600) * (180 / Math.PI)
    cameraRef.value.position.z = 600
    cameraRef.value.updateProjectionMatrix()
})

</script>
<template>
  <TresCanvas window-size clear-color="#111">
    <TresPerspectiveCamera ref="cameraRef" :position='[0, 0, 600]' :args="[50, width / height, 0.1, 1000]"  />
    <Suspense>
      <TheExperience />
    </Suspense>
  </TresCanvas>
</template>
