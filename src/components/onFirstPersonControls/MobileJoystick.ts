import { inject, defineComponent, ref, reactive } from 'vue'
import { useEventListener } from '@vueuse/core'
import { onMove, endTouch, startTouch, getMousePosition } from './composables/utilsMobile'

// todo define props
// todo try others styles
// more test mobile

export const MobileJoystick = defineComponent({
  name: 'MobileJoystick',
  props: {
    showPanel: {
      type: Number,
      default: 0
    }
  },

  setup(props) {
    const moveMethods = inject('moveMethods')

    // joystick DOM element
    const circle = document.createElement('div')
    circle.style.cssText =
      'position:absolute; bottom:35px; width:80px; height:80px; background:rgba(126, 126, 126, 0.5); border:#fff solid medium; border-radius:50%; left:20%; transform:translateX(-50%);z-index:1000;'
    const domElement = document.createElement('div')
    domElement.style.cssText =
      'position: absolute; left: 20px; top: 20px; width: 40px; height: 40px; border-radius: 50%; background: #fff;'
    circle.appendChild(domElement)
    document.body.appendChild(circle)

    // VARIABLES
    const offset = reactive({ x: 0, y: 0 })
    const maxRadius = 40 // prop maxRadius
    const origin = { left: domElement.offsetLeft, top: domElement.offsetTop }

    if (domElement != undefined) {
      if ('ontouchstart' in window) {
        useEventListener(domElement, 'touchstart', (evt) => {
          startTouch(moveMethods, evt, offset, domElement, maxRadius, origin)
        })
      } else {
        useEventListener(domElement, 'mousedown', (evt) => {
          startTouch(moveMethods, evt, offset, domElement, maxRadius, origin)
        })
      }
    }
  }
})
