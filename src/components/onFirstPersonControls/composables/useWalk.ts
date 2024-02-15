import { ref, watch, watchEffect, reactive } from 'vue'
import { useMagicKeys } from '@vueuse/core'

export const useWalk = (speed, keys) => {
  const sidewardMove = ref(0)
  const forwardMove = ref(0)
  const isWalking = ref(false)
  const isRunning = ref(false)
  const isCreeping = ref(false)
  const direction = reactive({
    forward: false,
    backward: false,
    rightward: false,
    leftward: false
  })
  const { forward, backward, rightward, leftward, run, creep } = keys

  const keysDetector = useMagicKeys()
  const forwardKey = keysDetector[forward.key]
  const backwardKey = keysDetector[backward.key]
  const rightwardKey = keysDetector[rightward.key]
  const leftwardKey = keysDetector[leftward.key]
  const runKey = keysDetector[`${run.key}+${forward.key}`]
  const creepKey = keysDetector[`${creep.key}+${forward.key}`]

  // forward && backward
  const moveForward = () => {
    forwardMove.value = speed
    direction.forward = true
  }
  const moveBackward = () => {
    forwardMove.value = -speed
    direction.backward = true
  }
  const applyRun = () => {
    forwardMove.value = run.speed ?? speed * 2
    isRunning.value = true
  }
  const stopRun = () => {
    forwardMove.value = speed
    isRunning.value = false
  }
  const stopCreep = () => {
    forwardMove.value = speed
    isCreeping.value = false
  }
  const applyCreep = () => {
    forwardMove.value = creep.speed ?? speed * 0.25
    isCreeping.value = true
  }
  const stopForward = () => {
    forwardMove.value = 0
    direction.forward = false
    direction.backward = false
  }

  // rightward && leftward
  const moveLeftward = () => {
    sidewardMove.value = -speed
    direction.leftward = true
  }
  const moveRightward = () => {
    sidewardMove.value = speed
    direction.rightward = true
  }
  const stopSideward = () => {
    sidewardMove.value = 0
    direction.leftward = false
    direction.rightward = false
  }

  watchEffect(() => {
    // forward && backward
    if (forwardKey.value) {
      moveForward()
      if (runKey.value) {
        applyRun()
      } else isRunning.value = false
      if (creepKey.value) {
        applyCreep()
      } else isCreeping.value = false
    } else if (backwardKey.value) {
      moveBackward()
    } else stopForward()

    // rightward && leftward
    if (rightwardKey.value) {
      moveRightward()
    } else if (leftwardKey.value) {
      moveLeftward()
    } else stopSideward()
  })

  watch([forwardMove, sidewardMove], ([fValue, sValue]) => {
    if (fValue !== 0 || sValue !== 0) isWalking.value = true
    else isWalking.value = false
  })

  return {
    sidewardMove,
    forwardMove,
    isWalking,
    isRunning,
    isCreeping,
    moveForward,
    moveBackward,
    moveLeftward,
    moveRightward,
    applyCreep,
    applyRun,
    stopCreep,
    stopRun,
    stopSideward,
    stopForward,
    direction
  }
}
