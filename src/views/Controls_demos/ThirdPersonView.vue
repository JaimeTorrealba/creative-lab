<script setup>
import { watchEffect, ref, shallowRef, computed } from 'vue'
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import { OrbitControls, useGLTF, useAnimations } from '@tresjs/cientos'
import { useMagicKeys } from '@vueuse/core'
import { Quaternion, Vector3 } from 'three'
import { useWindowSize } from '@vueuse/core'


const { scene: model, animations } = await useGLTF('/models/footman/source/Footman_RIG.glb')
const { actions, mixer } = useAnimations(animations, model)

//constants
const fadeDuration = 0.2
const velocity = 5
const rotateAngle = new Vector3(0, 1, 0)
const cameraTarget = new Vector3()
const walkDirection = new Vector3()
const rotateQuarternion = new Quaternion()
const { width, height } = useWindowSize()

// template ref
const cameraRef = shallowRef()
const orbitControlsRef = shallowRef()

const curruentAction = ref(actions.Idle)
curruentAction.value.play()

const changeAnimation = (action) => {
  curruentAction.value.fadeOut(fadeDuration)
  action.reset().fadeIn(fadeDuration).play()
  curruentAction.value = action
  if(action === actions.SwordAndShieldSlash){
    mixer.addEventListener( 'loop', () => {
      changeAnimation(actions.Idle)
      waitForAnimation.value = false
    })
  }
}

//KEYS
const { w, s, a, d } = useMagicKeys()
const hasPressed = computed(() => w.value || s.value || a.value || d.value)
const waitForAnimation = ref(false)
watchEffect(() => {
  if (hasPressed.value) {
    changeAnimation(actions.SwordAndShieldRun)
  }
  if (!hasPressed.value && !waitForAnimation.value) {
    changeAnimation(actions.Idle)
  }
})

document.addEventListener('click', () => {
  waitForAnimation.value = true
  changeAnimation(actions.SwordAndShieldSlash)
})


const updateCamera = (camera, delta) => {
  const angleYCameraDirection = Math.atan2(
    (camera.position.x - model.position.x),
    (camera.position.z - model.position.z))
  const directionOffset = getOffset()
  let directionOffsetModel = getInvertOffset() // correct rotation model coordinates

  // rotate model
  rotateQuarternion.setFromAxisAngle(rotateAngle, angleYCameraDirection + directionOffsetModel)
  model.quaternion.rotateTowards(rotateQuarternion, 0.2)


  // calculate direction
  camera.getWorldDirection(walkDirection)
  walkDirection.y = 0
  walkDirection.normalize()
  walkDirection.applyAxisAngle(rotateAngle, directionOffset)

  const moveX = walkDirection.x * velocity * delta
  const moveZ = walkDirection.z * velocity * delta
  model.position.x += moveX
  model.position.z += moveZ
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
const getInvertOffset = () => {
  let directionOffset = Math.PI // ww
  if (w.value) {
    if (a.value) {
      directionOffset = -Math.PI / 4 - Math.PI / 2 // w+a
    } else if (d.value) {
      directionOffset = Math.PI / 4 + Math.PI / 2 // w+d
    }
  } else if (s.value) {
    if (a.value) {
      directionOffset = -Math.PI / 4 // s+a
    } else if (d.value) {
      directionOffset =  Math.PI / 4 // s+d
    } else {
      directionOffset = 0 // s
    }
  } else if (a.value) {
    directionOffset = -Math.PI / 2 // a
  } else if (d.value) {
    directionOffset = + Math.PI / 2 // d
  }

  return directionOffset
}
const updateCameraTarget = (moveX, moveZ) => {
  // move camera
  cameraRef.value.position.x += moveX
  cameraRef.value.position.z += moveZ

  // update camera target
  cameraTarget.x = model.position.x
  cameraTarget.y = model.position.y
  cameraTarget.z = model.position.z
  orbitControlsRef.value.value.target = cameraTarget
}
const { onLoop } = useRenderLoop()

onLoop(({ delta }) => {
  mixer.update(delta * 0.5)
  orbitControlsRef.value.value.update()
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
    <primitive :object="model" />
    <TresGridHelper :size="50" :divisions="50" />
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
  </TresCanvas>
</template>