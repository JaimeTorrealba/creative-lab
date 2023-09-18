<script setup>
import { ref } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { CameraControls, useVideoTexture } from '@tresjs/cientos'
import { MeshBasicMaterial, BoxGeometry, MultiplyOperation  } from 'three'
import { createMultiMaterialObject } from 'three/addons/utils/SceneUtils.js';

const exampleVideo = 'https://raw.githubusercontent.com/Tresjs/assets/main/textures/video-textures/useVideoTexture.mp4'
const texture = ref()
texture.value = await useVideoTexture(exampleVideo)

const material1 = new MeshBasicMaterial({ color: 0x00ff00, map: texture.value })
const material2 = new MeshBasicMaterial({ color: 0xffff00, map: texture.value })
const material3 = new MeshBasicMaterial({ color: 0xff0000, map: texture.value })
const material4 = new MeshBasicMaterial({ color: 0x0000ff, map: texture.value })
const material5 = new MeshBasicMaterial({ color: 0xf3f3f3, map: texture.value })
const material6 = new MeshBasicMaterial({ color: 0xff33f7, map: texture.value })

const materials = [material6, material5, material4, material3, material2, material1]
materials.map((material) => {
  material.combine = MultiplyOperation
})

const cube = createMultiMaterialObject(new BoxGeometry(1, 1, 1), materials)

cube.children[0].position.y = 0.001
cube.children[0].scale.set(0.999,1, 0.999)

cube.children[1].position.x = 0.001
cube.children[1].scale.set(1, 0.999, 0.999)

cube.children[2].position.x = -0.001
cube.children[2].scale.set(1, 0.999, 0.999)

cube.children[3].position.z = -0.001
cube.children[3].scale.set(0.999, 0.999, 1)

cube.children[4].position.z = 0.001
cube.children[4].scale.set(0.999, 0.999, 1)

cube.children[5].position.y = -0.001
cube.children[5].scale.set(0.999, 1, 0.999)

</script>
<template>
  <TresCanvas window-size clear-color="#000" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 0, 3]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <CameraControls />
    <primitive :object="cube" />
    <TresGridHelper :size="100" :divisions="100" :position="[0, -2, 0]" />
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>
