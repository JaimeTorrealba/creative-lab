<script setup>
import { watchEffect, ref, computed } from 'vue'
import { useLoop, useTres } from '@tresjs/core'
import { useGLTF, useAnimations } from '@tresjs/cientos'
import { useMagicKeys } from '@vueuse/core'
import { Quaternion, Vector3 } from 'three'

const { state } = useGLTF('/models/footman/source/Footman_RIG.glb')

const animations = computed(() => state.value?.animations || [])
const model = computed(() => state?.value?.scene)
const { actions, mixer } = useAnimations(animations, model)

//constants
const fadeDuration = 0.3

const decceleration = new Vector3(-0.0005, -0.0001, -5.0);
const acceleration = new Vector3(1, 0.25, 50.0);
const velocity = new Vector3(0, 0, 0);

// template ref
const { camera} = useTres()

const curruentAction = ref(actions.Idle)
curruentAction.value.play()

const changeAnimation = (action) => {
  curruentAction.value.fadeOut(fadeDuration)
  action.reset().fadeIn(fadeDuration).play()
  curruentAction.value = action
  if (action === actions.SwordAndShieldSlash) {
    mixer.value.addEventListener('loop', () => {
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


const onMovement = (delta) => {
  const frameDecceleration = new Vector3(
    velocity.x * decceleration.x,
    velocity.y * decceleration.y,
    velocity.z * decceleration.z
  );
  frameDecceleration.multiplyScalar(delta);
  frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
    Math.abs(frameDecceleration.z), Math.abs(velocity.z));

  velocity.add(frameDecceleration);

  const controlObject = model.value;
  const _Q = new Quaternion();
  const _A = new Vector3();
  const _R = controlObject.quaternion.clone();
  const acc = acceleration.clone();
  if (w.value) {
    velocity.z += acc.z * delta;
  }
  if (s.value) {
    velocity.z -= acc.z * delta;
  }
  if (a.value) {
    _A.set(0, 1, 0);
    _Q.setFromAxisAngle(_A, 4.0 * Math.PI * delta * acceleration.y);
    _R.multiply(_Q);
  }
  if (d.value) {
    _A.set(0, 1, 0);
    _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * delta * acceleration.y);
    _R.multiply(_Q);
  }

  controlObject.quaternion.copy(_R);

  const oldPosition = new Vector3();
  oldPosition.copy(controlObject.position);

  const forward = new Vector3(0, 0, 1);
  forward.applyQuaternion(controlObject.quaternion);
  forward.normalize();

  const sideways = new Vector3(1, 0, 0);
  sideways.applyQuaternion(controlObject.quaternion);
  sideways.normalize();

  sideways.multiplyScalar(velocity.x * delta);
  forward.multiplyScalar(velocity.z * delta);

  controlObject.position.add(forward);
  controlObject.position.add(sideways);

  oldPosition.copy(controlObject.position);

}

//CAMERA
const currentPosition = new Vector3();
const currentLookat = new Vector3();

const calculateIdealOffset = (model3D) => {
  const idealOffset = new Vector3(0, 2.5, -10);
  idealOffset.applyQuaternion(model3D.quaternion);
  idealOffset.add(model3D.position);
  return idealOffset;
}

const calculateIdealLookat = (model3D) => {
  const idealLookat = new Vector3(0, 0, 0);
  idealLookat.applyQuaternion(model3D.quaternion);
  idealLookat.add(model3D.position);
  return idealLookat;
}
const thirdPersonCamera = (elapsed, model3D, camera) => {
  const idealOffset = calculateIdealOffset(model3D);
  const idealLookat = calculateIdealLookat(model3D);

  // const t = 0.05;
  // const t = 4.0 * timeElapsed;
  const t = 1.0 - Math.pow(0.001, elapsed);

  currentPosition.lerp(idealOffset, t);
  currentLookat.lerp(idealLookat, t);

  camera.position.copy(currentPosition);
  camera.lookAt(currentLookat);
}
const { onBeforeRender } = useLoop()

onBeforeRender(({ delta, elapsed }) => {
  mixer.value.update(delta * 0.5)
  if (model.value && camera.value) {
    onMovement(delta * 0.5)
    thirdPersonCamera(elapsed, model.value, camera.value)
  }
})
  
</script>
<template>
    <primitive :object="model" />
    <TresGridHelper :size="100" :divisions="100" />
    <TresDirectionalLight :position="[0, 2, 4]" :intensity="2" />
    <TresAmbientLight />
</template>