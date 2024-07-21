<script setup>
import { useGLTF, useAnimations } from '@tresjs/cientos'
import { gsap } from 'gsap'

const pxPerSecond = 2.5

const models = []

const { scene: model1, animations: animation1 } = await useGLTF('/models/ant.glb', { draco: true })
const { scene: model2 } = await useGLTF('/models/ant.glb', { draco: true })
const { scene: model3 } = await useGLTF('/models/ant.glb', { draco: true })
const { scene: model4 } = await useGLTF('/models/ant.glb', { draco: true })
const { scene: model5 } = await useGLTF('/models/ant.glb', { draco: true })
const { scene: model6 } = await useGLTF('/models/ant.glb', { draco: true })
const { scene: model7 } = await useGLTF('/models/ant.glb', { draco: true })
const { scene: model8 } = await useGLTF('/models/ant.glb', { draco: true })
const { scene: model9 } = await useGLTF('/models/ant.glb', { draco: true })
const { scene: model10 } = await useGLTF('/models/ant.glb', { draco: true })

models.push(model1, model2, model3, model4, model5, model6, model7, model8, model9, model10)

function moveMe(target) {
  const newPos = {
    x: gsap.utils.random(-5, 5),
    z: gsap.utils.random(-5, 5)
  }
  const curPos = {
    x: gsap.getProperty(target.position, 'x'),
    z: gsap.getProperty(target.position, 'z')
  }
  const deltaX = curPos.x - newPos.x
  const deltaZ = curPos.z - newPos.z
  const distance = Math.hypot(deltaX, deltaZ)
  const duration = distance / pxPerSecond

  target.lookAt(newPos.x, -2, newPos.z)

  gsap.to(target.position, {
    x: newPos.x,
    z: newPos.z,
    duration: duration,
    ease: 'none',
    onComplete: moveMe,
    onCompleteParams: [target]
  })
}



models.forEach((model) => {
    const { actions } = useAnimations(animation1, model)
    actions.running.play()
    moveMe(model)
})

</script>
<template>
    <primitive v-for="model in models" :object="model" :position-y="-2" :scale="Math.random() * 10 + 5" :rotation="[0, 0, 0]" :key="model.uuid" />
</template>