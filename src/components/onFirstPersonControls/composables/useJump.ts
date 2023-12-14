import { ref } from 'vue'
import { onKeyStroke } from '@vueuse/core'

export const useJump = (jumpKey, gravity, initCameraPos = 0) => {
  const isJumping = ref(false)
  const jumpDistance = ref(0)
  const initJumpTime = ref(0)

  onKeyStroke(jumpKey.keys, () => {
    if (!isJumping.value) initJumpTime.value = Date.now()
    isJumping.value = true
  })

  const getJumpTime = () => ((Date.now() - initJumpTime.value) / 1000) * 3
  const getJumpDistance = (jumpTime) =>
    initCameraPos + 6 * jumpTime - 0.5 * gravity * jumpTime ** 2

  const getJump = () => {
    if (isJumping.value) {
      jumpDistance.value = getJumpDistance(getJumpTime())
      if (jumpDistance.value <= initCameraPos) isJumping.value = false
      return jumpDistance.value
    }
    return initCameraPos
  }

  return { getJump, isJumping }
}
