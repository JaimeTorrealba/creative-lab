import { onKeyDown } from '@vueuse/core'
import { useTresContext } from '@tresjs/core'
import { useEventListener } from '@vueuse/core'



export const useActions = (keys) => {
  const { renderer } = useTresContext()
  const { wheelActionUp, wheelActionDown, actions, leftClick, rightClick, middleClick } = keys
  console.log('jaime ~ useActions ~ keys:', middleClick);

  actions.actions.map((action) => {
    onKeyDown(action.key, () => {
      action.action()
    })
  })

  useEventListener(renderer.value.domElement, 'click', (evt) => {
    // TODO add compatibility with touch events, and more buttons mouse
    if (evt.button === 0) leftClick ? leftClick.action() : console.log('no leftClick defined')
    else if (evt.button === 1) middleClick ? middleClick.action() : console.log('no middleClick defined')
    else if (evt.button === 2) rightClick ? rightClick?.action() : console.log('no rightClick defined')
  })

  renderer.value.domElement.onwheel = (event) => {
    if (event.deltaY > 0) {
      wheelActionUp.action()
    } else {
      wheelActionDown.action()
    }
  }
}
