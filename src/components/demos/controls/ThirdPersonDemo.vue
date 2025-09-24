<script setup>
import { watchEffect, ref, shallowRef, computed } from 'vue'
import { useLoop, useTres } from '@tresjs/core'
import { OrbitControls, useGLTF, useAnimations } from '@tresjs/cientos'
import { useMagicKeys, watchOnce } from '@vueuse/core'
import { Quaternion, Vector3 } from 'three'

const { state, isLoading } = useGLTF('/models/footman/source/Footman_RIG.glb')

watchOnce(isLoading, (v) => {
  if (!v) {
    currentAction.value = actions.Idle;
    currentAction.value.play();
  }
});

const animations = computed(() => state.value?.animations || [])
const model = computed(() => state?.value?.scene)
const { actions, mixer } = useAnimations(animations, model)

//constants
const fadeDuration = 0.2
const velocity = 5
const rotateAngle = new Vector3(0, 1, 0)
const cameraTarget = new Vector3()
const walkDirection = new Vector3()
const rotateQuarternion = new Quaternion()

// template ref
const { camera } = useTres()
const orbitControlsRef = shallowRef()
const currentAction = ref()

const changeAnimation = (action) => {
  currentAction.value.fadeOut(fadeDuration)
  action.reset().fadeIn(fadeDuration).play()
  currentAction.value = action
  if(action === actions.SwordAndShieldSlash){
    mixer.value.addEventListener( 'loop', () => {
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
  if (hasPressed.value && !isLoading.value) {
    changeAnimation(actions.SwordAndShieldRun)
  }
  if (!hasPressed.value && !waitForAnimation.value && !isLoading.value) {
    changeAnimation(actions.Idle)
  }
})

document.addEventListener('click', () => {
  waitForAnimation.value = true
  changeAnimation(actions.SwordAndShieldSlash)
})


const updateCamera = (camera, delta) => {
  const angleYCameraDirection = Math.atan2(
    (camera.position.x - model.value.position.x),
    (camera.position.z - model.value.position.z))
  const directionOffset = getOffset()
  let directionOffsetModel = getInvertOffset() // correct rotation model coordinates

  // rotate model
  rotateQuarternion.setFromAxisAngle(rotateAngle, angleYCameraDirection + directionOffsetModel)
  model.value.quaternion.rotateTowards(rotateQuarternion, 0.2)


  // calculate direction
  camera.getWorldDirection(walkDirection)
  walkDirection.y = 0
  walkDirection.normalize()
  walkDirection.applyAxisAngle(rotateAngle, directionOffset)

  const moveX = walkDirection.x * velocity * delta
  const moveZ = walkDirection.z * velocity * delta
  model.value.position.x += moveX
  model.value.position.z += moveZ
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
  camera.value.position.x += moveX
  camera.value.position.z += moveZ

  // update camera target
  cameraTarget.x = model.value.position.x
  cameraTarget.y = model.value.position.y
  cameraTarget.z = model.value.position.z
  orbitControlsRef.value.instance.target = cameraTarget
}
const { onBeforeRender } = useLoop()

onBeforeRender(({ delta }) => {
  mixer.value.update(delta * 0.5)
  orbitControlsRef.value.instance.update()
  if (camera.value && orbitControlsRef.value && hasPressed.value) {
    updateCamera(camera.value, delta)
  }

})
</script>
<template>
    <OrbitControls enableDamping :enable-pan="false" :min-distance="5" :max-distance="15"
        :max-polar-angle="Math.PI / 2 - 0.05" ref="orbitControlsRef" />
    <primitive v-if="model" :object="model" />
    <TresGridHelper :size="50" :divisions="50" />
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
</template>