<script setup>
import { shallowRef } from 'vue'
import { Sphere } from '@tresjs/cientos'
import { DoubleSide, Vector3 } from 'three'

const highlighter = shallowRef(null)
const sphereBase = shallowRef(null)
const objects = []

const onSelect = (e) => {
  const highlighterPos = new Vector3().copy(e.point).floor().addScalar(0.5)
  highlighter.value.position.set(highlighterPos.x, 0, highlighterPos.z)
  const objectExists = objects.find((obj) => obj.position.equals(highlighter.value.position))
  if (objectExists) {
    highlighter.value.visible = false
  } else {
    highlighter.value.visible = true
  }
}

const createSphere = () => {
  const objectExists = objects.find((obj) => obj.position.equals(highlighter.value.position))

  if (objectExists) return
  const sphere = sphereBase.value.instance.clone()
  sphere.visible = true
  sphere.position.copy(highlighter.value.position)
  objects.push(sphere)
  highlighter.value.parent.add(sphere)
}

</script>
<template>
    <TresMesh name="ground" :rotation-x="-Math.PI * 0.5" :visible="false" @click="createSphere()"
        @pointermove="(e) => onSelect(e)">
        <TresPlaneGeometry :args="[10, 10, 32]" />
        <TresMeshBasicMaterial :color="0x00ff00" :side="DoubleSide" />
    </TresMesh>
    <TresMesh ref="highlighter" :position="[0.5, 0, 0.5]" :rotation-x="-Math.PI * 0.5">
        <TresPlaneGeometry :args="[1, 1]" />
        <TresMeshBasicMaterial :color="0xf7f7f7" :side="DoubleSide" />
    </TresMesh>
    <Sphere ref="sphereBase" :args="[0.25, 16, 16]" :position-y="1" :visible="false">
        <TresMeshBasicMaterial :color="0x00ff00" wireframe />
    </Sphere>
    <TresGridHelper :size="5" :divisions="10" />
</template>