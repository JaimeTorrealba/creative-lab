import { ref } from 'vue'
import { onKeyDown, onKeyUp } from '@vueuse/core'
export const useWalk = (speed, keys) => {
  const xMove = ref(0)
  const zMove = ref(0)
  const { forward, backward, rightward, leftward } = keys

  // FORWARD DIRECTION MOVEMENTS
  onKeyDown(['w', 'W'], () => {
    zMove.value = speed
  })
  onKeyDown(backward.keys, () => {
    zMove.value = -speed
  })
  onKeyUp([...forward.keys, ...backward.keys], () => {
    zMove.value = 0
  })
  // X DIRECTION MOVEMENTS
  onKeyDown(leftward.keys, () => {
    xMove.value = -speed
  })
  onKeyDown(rightward.keys, () => {
    xMove.value = speed
  })
  onKeyUp([...leftward.keys, ...rightward.keys], () => {
    xMove.value = 0
  })
  return { xMove, zMove }
}
