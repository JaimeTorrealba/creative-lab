import { useTresContext } from '@tresjs/core'
import { onKeyDown, useEventListener } from '@vueuse/core'

export const useActions = (keys) => {

  const { renderer } = useTresContext()
  const { wheelActionUp, wheelActionDown, actions, leftClick, rightClick, middleClick } = keys

  actions.actions.map((action) => {
    onKeyDown(action.key, () => {
      action.action()
    })
  })

  useEventListener(renderer.value.domElement, 'click', (evt) => {
    if (evt.button === 0) leftClick ? leftClick.action() : console.log('no leftClick defined')
    else if (evt.button === 1) middleClick ? middleClick.action() : console.log('no middleClick defined')
    else if (evt.button === 2) rightClick ? rightClick?.action() : console.log('no rightClick defined')
  })

  renderer.value.domElement.onwheel = (event) => {
    if (event.deltaY > 0) {
      wheelActionDown.action()
    } else {
      wheelActionUp.action()
    }
  }
}
