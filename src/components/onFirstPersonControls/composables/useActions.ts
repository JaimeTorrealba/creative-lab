import { onKeyDown } from '@vueuse/core'

export const useActions = (keys) => {
  const { wheelActionUp, wheelActionDown, actions } = keys

  actions.actions.map((action) => {
    onKeyDown(action.keys, () => {
      action.action()
    })
  })

  window.onwheel = (event) => {
    if (event.deltaY > 0) {
      wheelActionUp.action()
    } else {
      wheelActionDown.action()
    }
  }
}
