import { ref, watch, watchEffect } from 'vue'
import { useMagicKeys } from '@vueuse/core'
export const useWalk = (speed, keys) => {
  const sidewardMove = ref(0)
  const forwardMove = ref(0)
  const isWalking = ref(false)
  const isRunning = ref(false)
  const isCreeping = ref(false)
  const { forward, backward, rightward, leftward, run, creep } = keys

  const keysDetector = useMagicKeys()
  const forwardKey = keysDetector[forward.key]
  const backwardKey = keysDetector[backward.key]
  const rightwardKey = keysDetector[rightward.key]
  const leftwardKey = keysDetector[leftward.key]
  const runKey = keysDetector[`${run.key}+${forward.key}`]
  const creepKey = keysDetector[`${creep.key}+${forward.key}`]

  watchEffect(() => {
    if (forwardKey.value) {
      forwardMove.value = speed
      if (runKey.value) forwardMove.value = speed * 2; isRunning.value = true
      if (creepKey.value) forwardMove.value = speed * 0.25; isCreeping.value = true
    } else if (backwardKey.value) forwardMove.value = -speed
    else forwardMove.value = 0
    if (rightwardKey.value) sidewardMove.value = speed
    else if (leftwardKey.value) sidewardMove.value = -speed
    else sidewardMove.value = 0
  })

  watch(([forwardMove, sidewardMove]), ([fValue, sValue]) => {
    if(fValue !== 0 || sValue !== 0) isWalking.value = true
    else isWalking.value = false
  })

  return { sidewardMove, forwardMove, isWalking, isRunning, isCreeping}
}
