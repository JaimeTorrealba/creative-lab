<script setup>
import { ref, shallowRef } from 'vue'
import { useLoop, useTresContext } from '@tresjs/core'
import { OrbitControls, useGLTF, useAnimations } from '@tresjs/cientos'
import { Vector3, DoubleSide } from 'three'

const { scene: model, animations } = await useGLTF('/models/footman/source/Footman_RIG.glb')
const { actions, mixer } = useAnimations(animations, model)

//constants
const fadeDuration = 0.2

// template ref
const { camera: cameraRef } = useTresContext()
const cameraTarget = new Vector3()
const orbitControlsRef = shallowRef()
const highlighter = shallowRef(null)
const waitForAnimation = ref(false)
const destination = ref(new Vector3())

const curruentAction = ref(actions.Idle)
curruentAction.value.play()

const changeAnimation = (action) => {
  curruentAction.value.fadeOut(fadeDuration)
  action.reset().fadeIn(fadeDuration).play()
  curruentAction.value = action
  if (action === actions.SwordAndShieldSlash) {
    mixer.addEventListener('loop', () => {
      changeAnimation(actions.Idle)
      waitForAnimation.value = false
    })
  }
}

const onSelect = (e) => {
  const highlighterPos = new Vector3().copy(e.point).floor().addScalar(0.5)
  highlighter.value.position.set(highlighterPos.x, 0, highlighterPos.z)
  highlighter.value.visible = true
}

const moveCharacter = () => {
  destination.value.x = highlighter.value.position.x
  destination.value.y = 0
  destination.value.z = highlighter.value.position.z
  model.lookAt(destination.value)
  changeAnimation(actions.SwordAndShieldRun)
  setTimeout(() => {
    changeAnimation(actions.Idle)
  }, 500)
}
const { onBeforeRender } = useLoop()

onBeforeRender(({ delta }) => {
  mixer.update(delta * 0.5)
  orbitControlsRef.value.value.update()

  model.position.x += (destination.value.x - model.position.x) * 0.1 * 0.5
  model.position.z += (destination.value.z - model.position.z) * 0.1 * 0.5

  // move camera
  cameraRef.value.position.x += (destination.value.x - model.position.x) * 0.1 * 0.5
  cameraRef.value.position.z += (destination.value.z - model.position.z) * 0.1 * 0.5
  cameraTarget.x = model.position.x
  cameraTarget.y = model.position.y
  cameraTarget.z = model.position.z
  orbitControlsRef.value.value.target = cameraTarget
})

</script>
<template>
    <OrbitControls enableDamping :enable-pan="false" :min-distance="5" :max-distance="15"
      :max-polar-angle="Math.PI / 2 - 0.05" ref="orbitControlsRef" />
    <primitive :object="model" />
    <!-- GRID -->
    <TresMesh ref="highlighter" :position="[0.5, 0, 0.5]" :rotation-x="-Math.PI * 0.5">
      <TresPlaneGeometry :args="[1, 1]" />
      <TresMeshBasicMaterial :color="0xf7f7f7" :side="DoubleSide" />
    </TresMesh>
    <TresMesh name="ground" :rotation-x="-Math.PI * 0.5" :visible="false" @click="moveCharacter()"
      @pointer-move="(e) => onSelect(e)">
      <TresPlaneGeometry :args="[10, 10, 32]" />
      <TresMeshBasicMaterial :color="0x00ff00" :side="DoubleSide" />
    </TresMesh>
    <TresGridHelper :size="5" :divisions="10" />
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
</template>