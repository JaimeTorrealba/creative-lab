<script setup>
import { ref, shallowRef, computed } from 'vue'
import { TresCanvas, useRenderLoop, useTexture } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { useMagicKeys } from '@vueuse/core'
import { Vector3 } from 'three'
import { useWindowSize } from '@vueuse/core'
import { NearestFilter } from 'three'

//constants
const tilesHorizontal = 9
const tilesVertical = 9
const currentTile = ref(0)
const velocity = 5
const rotateAngle = new Vector3(0, 1, 0)
const cameraTarget = new Vector3()
const walkDirection = new Vector3()
const { width, height } = useWindowSize()
const playSpriteIndicesGlobal = ref()
const runningTileArrayIndex = ref()
const maxDisplayTime = ref()
const elapsedTimeGlobal = ref()

const { map } = await useTexture({
  map: '/textures/Evil Druid.png',
})
map.magFilter = NearestFilter
map.repeat.set(1 / tilesHorizontal, 1 / tilesVertical)


const updateSprites = () => {
  elapsedTimeGlobal.value = 0;
  runningTileArrayIndex.value = (runningTileArrayIndex.value + 1) % playSpriteIndicesGlobal.value.length;
  currentTile.value = playSpriteIndicesGlobal.value[runningTileArrayIndex.value];
  const offsetX = ((currentTile.value % tilesHorizontal) / tilesHorizontal)
  // const offsetY = (tilesVertical - Math.floor(currentTile / tilesHorizontal) -1 ) / tilesVertical
  map.offset.x = offsetX
   map.offset.y = 0.885
  // map.offset.y = 0.77 // factor of 0.115
}
const spritesLoop = (playSpriteIndices, totalDuration) => {
  playSpriteIndicesGlobal.value = playSpriteIndices
  runningTileArrayIndex.value = 0;
  currentTile.value = playSpriteIndicesGlobal.value[runningTileArrayIndex.value];
  maxDisplayTime.value = totalDuration / playSpriteIndicesGlobal.value.length;
  elapsedTimeGlobal.value = maxDisplayTime.value; // force to play new animation
}
spritesLoop([0, 1, 2, 3, 4, 5], 0.65)

// template ref
const cameraRef = shallowRef()
const orbitControlsRef = shallowRef()
const spriteRef = shallowRef()

//KEYS
const { w, s, a, d } = useMagicKeys()
const hasPressed = computed(() => w.value || s.value || a.value || d.value)

const updateCamera = (camera, delta) => {
  const directionOffset = getOffset()

  // calculate direction
  camera.getWorldDirection(walkDirection)
  walkDirection.y = 0
  walkDirection.normalize()
  walkDirection.applyAxisAngle(rotateAngle, directionOffset)

  const moveX = walkDirection.x * velocity * delta
  const moveZ = walkDirection.z * velocity * delta
  spriteRef.value.position.x += moveX
  spriteRef.value.position.z += moveZ
  updateCameraTarget(moveX, moveZ)
}
const getOffset = () => {
  let directionOffset = 0 // ww
  if (w.value) {
    if (a.value) {
      directionOffset = Math.PI / 4 // w+a
    } else if (d.value) {
      directionOffset = - Math.PI / 4 // w+d
    }
  } else if (s.value) {
    if (a.value) {
      directionOffset = Math.PI / 4 + Math.PI / 2 // s+a
    } else if (d.value) {
      directionOffset = -Math.PI / 4 - Math.PI / 2 // s+d
    } else {
      directionOffset = Math.PI // s
    }
  } else if (a.value) {
    directionOffset = Math.PI / 2 // a
  } else if (d.value) {
    directionOffset = - Math.PI / 2 // d
  }

  return directionOffset
}
const updateCameraTarget = (moveX, moveZ) => {
  // move camera
  cameraRef.value.position.x += moveX
  cameraRef.value.position.z += moveZ

  // update camera target
  cameraTarget.x = spriteRef.value.position.x
  cameraTarget.y = spriteRef.value.position.y
  cameraTarget.z = spriteRef.value.position.z
  orbitControlsRef.value.value.target = cameraTarget
}
const { onLoop } = useRenderLoop()

onLoop(({ delta }) => {
  elapsedTimeGlobal.value += delta
  orbitControlsRef.value.value.update()
  if (maxDisplayTime.value > 0 && elapsedTimeGlobal.value >= maxDisplayTime.value) {
    updateSprites()
  }

  if (cameraRef.value && orbitControlsRef.value && hasPressed.value) {
    updateCamera(cameraRef.value, delta)
  }

})

</script>
<template>
  <TresCanvas window-size clear-color="#111" ref="canvasRef">
    <TresPerspectiveCamera ref="cameraRef" :args="[45, width / height, 0.1, 1000]" :position="[0, 5, 5]" />
    <OrbitControls enableDamping :enable-pan="false" :min-distance="5" :max-distance="15"
      :max-polar-angle="Math.PI / 2 - 0.05" ref="orbitControlsRef" />
    <TresSprite ref="spriteRef" :scale="2">
      <TresSpriteMaterial :map="map" />
    </TresSprite>
    <TresGridHelper position-y="-1" :size="50" :divisions="50" />
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>