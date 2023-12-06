import { ref } from 'vue'
import { onKeyDown, onKeyUp } from '@vueuse/core'
export const useWalk = (speed, keys) => {
  const xMove = ref(0)
  const zMove = ref(0)
  const { forward, back, right, left } = keys

  // FORWARD DIRECTION MOVEMENTS
  onKeyDown(forward.value, () => {
    zMove.value = speed
  })
  onKeyDown(back.value, () => {
    zMove.value = -speed
  })
  onKeyUp([...forward.value, ...back.value], () => {
    zMove.value = 0
  })
  // X DIRECTION MOVEMENTS
  onKeyDown(left.value, () => {
    xMove.value = -speed
  })
  onKeyDown(right.value, () => {
    xMove.value = speed
  })
  onKeyUp([...left.value, ...right.value], () => {
    xMove.value = 0
  })
  return { xMove, zMove }
}
