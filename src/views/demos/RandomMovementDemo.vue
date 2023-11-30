<script setup>
import { ref, reactive, watch } from 'vue'
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import { OrbitControls, useGLTF, useAnimations, useTweakPane } from '@tresjs/cientos'
import { gsap } from 'gsap'

const ants = ref()
const cameraRef = ref()
const pxPerSecond = 2.5
const options = reactive({
  y: 0
})

const { scene: model1, animations: animations1 } = await useGLTF('/models/ant.glb')
const { scene: model2, animations: animations2 } = await useGLTF('/models/ant.glb')
const { scene: model3, animations: animations3 } = await useGLTF('/models/ant.glb')
const { scene: model4, animations: animations4 } = await useGLTF('/models/ant.glb')
const { scene: model5, animations: animations5 } = await useGLTF('/models/ant.glb')
const { scene: model6, animations: animations6 } = await useGLTF('/models/ant.glb')
const { scene: model7, animations: animations7 } = await useGLTF('/models/ant.glb')
const { scene: model8, animations: animations8 } = await useGLTF('/models/ant.glb')
const { scene: model9, animations: animations9 } = await useGLTF('/models/ant.glb')
const { scene: model10, animations: animations10 } = await useGLTF('/models/ant.glb')

const { actions: actions1 } = useAnimations(animations1, model1)
const { actions: actions2 } = useAnimations(animations2, model2)
const { actions: actions3 } = useAnimations(animations3, model3)
const { actions: actions4 } = useAnimations(animations4, model4)
const { actions: actions5 } = useAnimations(animations5, model5)
const { actions: actions6 } = useAnimations(animations6, model6)
const { actions: actions7 } = useAnimations(animations7, model7)
const { actions: actions8 } = useAnimations(animations8, model8)
const { actions: actions9 } = useAnimations(animations9, model9)
const { actions: actions10 } = useAnimations(animations10, model10)

actions1.running.play()
actions2.running.play()
actions3.running.play()
actions4.running.play()
actions5.running.play()
actions6.running.play()
actions7.running.play()
actions8.running.play()
actions9.running.play()
actions10.running.play()

const { pane } = useTweakPane()

pane.addBinding(options, 'y', { min: -Math.PI, max: Math.PI, step: 0.01 })

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

moveMe(model1)
moveMe(model2)
moveMe(model3)
moveMe(model4)
moveMe(model5)
moveMe(model6)
moveMe(model7)
moveMe(model8)
moveMe(model9)
moveMe(model10)

const { onLoop } = useRenderLoop()

onLoop(() => {
  // if (mixer && cameraRef.value) {
  //   mixer.update(0.001)
  // }
})
</script>
<template>
  <TresCanvas window-size clear-color="#333" ref="canvasRef">
    <TresPerspectiveCamera
      :position="[0, 8, 12]"
      :fov="45"
      :aspect="1"
      :near="0.1"
      :far="1000"
      :look-at="[0, 0, 0]"
      ref="cameraRef"
    />
    <OrbitControls />

    <primitive
      ref="ants"
      :object="model1"
      :position-y="-2"
      :scale="10"
      :rotation="[0, options.y, 0]"
    />
    <primitive
      ref="ants"
      :object="model2"
      :position-y="-2"
      :scale="10"
      :rotation="[0, options.y, 0]"
    />
    <primitive
      ref="ants"
      :object="model3"
      :position-y="-2"
      :scale="10"
      :rotation="[0, options.y, 0]"
    />
    <primitive
      ref="ants"
      :object="model4"
      :position-y="-2"
      :scale="10"
      :rotation="[0, options.y, 0]"
    />
    <primitive
      ref="ants"
      :object="model5"
      :position-y="-2"
      :scale="10"
      :rotation="[0, options.y, 0]"
    />
    <primitive
      ref="ants"
      :object="model6"
      :position-y="-2"
      :scale="10"
      :rotation="[0, options.y, 0]"
    />
    <primitive
      ref="ants"
      :object="model7"
      :position-y="-2"
      :scale="10"
      :rotation="[0, options.y, 0]"
    />
    <primitive
      ref="ants"
      :object="model8"
      :position-y="-2"
      :scale="10"
      :rotation="[0, options.y, 0]"
    />
    <primitive
      ref="ants"
      :object="model9"
      :position-y="-2"
      :scale="10"
      :rotation="[0, options.y, 0]"
    />
    <primitive
      ref="ants"
      :object="model10"
      :position-y="-2"
      :scale="10"
      :rotation="[0, options.y, 0]"
    />

    <TresGridHelper :size="100" :divisions="100" :position="[0, -2, 0]" />
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="20" />
    <TresAmbientLight />
  </TresCanvas>
</template>
