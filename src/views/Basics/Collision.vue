<script setup>
import { shallowRef, onMounted, nextTick, } from 'vue'
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import { OrbitControls, TransformControls } from '@tresjs/cientos'
import { Box3, Sphere, Vector3 } from 'three'

const greenBox = shallowRef(null)
const redSphere = shallowRef(null)
const blueBox = shallowRef(null)

const iVector = new Vector3()

const greenBoxAABB = shallowRef(new Box3())
const redSphereAABB = shallowRef(new Sphere(iVector, 0.5))
const blueBoxAABB = shallowRef(new Box3())

const checkCollision = () => {
  if (greenBoxAABB.value.intersectsBox(blueBoxAABB.value)) {
    console.log('Collision detected BOX')
  } else if (greenBoxAABB.value.intersectsSphere(redSphereAABB.value)) {
    console.log('Collision detected BALL')
  } else {
    console.log('No collision')
  }
}
onMounted(async () => {
  await nextTick()
  greenBoxAABB.value.setFromObject(greenBox.value)
  blueBoxAABB.value.setFromObject(blueBox.value)
})

const { onLoop } = useRenderLoop()

onLoop(() => {
  if (!greenBox.value && !blueBox.value && greenBoxAABB.value) return
  greenBoxAABB.value.copy(greenBox.value.geometry.boundingBox).applyMatrix4(greenBox.value.matrixWorld)
  checkCollision()
})

</script>
<template>
  <TresCanvas window-size clear-color="#111" ref="canvasRef">
    <TresPerspectiveCamera :position="[0, 0, 7]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
    <OrbitControls make-default />
    <TransformControls :object="greenBox" />
    <TresMesh ref="greenBox" :position-x="-1.5">
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresMeshBasicMaterial :color="0x00ff00" />
    </TresMesh>
    <TresMesh ref="redSphere">
      <TresSphereGeometry :args="[0.5, 16]" />
      <TresMeshBasicMaterial :color="0xff0000" />
    </TresMesh>
    <TresMesh ref="blueBox" :position-x="2">
      <TresBoxGeometry :args="[2, 2, 2]" />
      <TresMeshBasicMaterial :color="0x00ff" />
    </TresMesh>
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>