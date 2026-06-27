<script setup>
import { ref, shallowRef, computed } from 'vue'
import { useLoop, useTres } from '@tresjs/core'
import { OrbitControls, useTexture } from '@tresjs/cientos'
import { useMagicKeys } from '@vueuse/core'
import { Vector3, NearestFilter } from 'three'

//constants
const tilesHorizontal = 9
const tilesVertical = 9
const currentTile = ref(0)
const velocity = 5
const rotateAngle = new Vector3(0, 1, 0)
const cameraTarget = new Vector3()
const walkDirection = new Vector3()
const playSpriteIndicesGlobal = ref()
const runningTileArrayIndex = ref()
const maxDisplayTime = ref()
const elapsedTimeGlobal = ref()

const { state: map } = await useTexture('/textures/Evil Druid.png')
map.value.magFilter = NearestFilter
map.value.repeat.set(1 / tilesHorizontal, 1 / tilesVertical)


const updateSprites = () => {
  elapsedTimeGlobal.value = 0;
  runningTileArrayIndex.value = (runningTileArrayIndex.value + 1) % playSpriteIndicesGlobal.value.length;
  currentTile.value = playSpriteIndicesGlobal.value[runningTileArrayIndex.value];
  const offsetX = ((currentTile.value % tilesHorizontal) / tilesHorizontal)
  // const offsetY = (tilesVertical - Math.floor(currentTile / tilesHorizontal) -1 ) / tilesVertical
  map.value.offset.x = offsetX
   map.value.offset.y = 0.885
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

const { camera } = useTres()
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
  camera.value.position.x += moveX
  camera.value.position.z += moveZ

  // update camera target
  cameraTarget.x = spriteRef.value.position.x
  cameraTarget.y = spriteRef.value.position.y
  cameraTarget.z = spriteRef.value.position.z
  orbitControlsRef.value.instance.target = cameraTarget
}
const { onBeforeRender } = useLoop()

onBeforeRender(({ delta }) => {
  elapsedTimeGlobal.value += delta
  if (maxDisplayTime.value > 0 && elapsedTimeGlobal.value >= maxDisplayTime.value) {
    updateSprites()
  }

  if (camera.value && orbitControlsRef.value && hasPressed.value) {
    updateCamera(camera.value, delta)
  }

})
</script>
<template>
    <OrbitControls enableDamping :enable-pan="false" :min-distance="5" :max-distance="15"
        :max-polar-angle="Math.PI / 2 - 0.05" ref="orbitControlsRef" />
    <TresSprite ref="spriteRef" :scale="2">
        <TresSpriteMaterial :map="map" />
    </TresSprite>
    <TresGridHelper position-y="-1" :size="50" :divisions="50" />
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
</template>