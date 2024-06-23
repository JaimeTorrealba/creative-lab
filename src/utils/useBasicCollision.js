import { onMounted, nextTick } from 'vue'
import { Box3 } from 'three'
// import type { MaybeElementRef } from '@vueuse/core'
import { unrefElement } from '@vueuse/core'

// TODO handle models

export const useBasicCollision = (objects) => {
  if (objects.length < 2) return console.error('It requires at least 2 objects to check collision')

  const AABBStore = []

  onMounted(async () => {
    await nextTick()
    objects.map((object) => {
      let el = unrefElement(object)
      if (!el.geometry) {
        console.error('useBasicCollision: can access to geometry or boundingBox')
        return
      }
      const currentAABB = new Box3()
      currentAABB.setFromObject(el)
      AABBStore.push(currentAABB)
    })
  })

  const check = () => {
    let result = []
    objects.map((object, index) => {
      const el = unrefElement(object)
      AABBStore[index].copy(el.geometry.boundingBox).applyMatrix4(el.matrixWorld)
      // inner loop
      AABBStore.map((_, innerIndex) => {
        if (index === innerIndex) return
        if (AABBStore[index].intersectsBox(AABBStore[innerIndex])) {
          result = [unrefElement(objects[index]), unrefElement(objects[innerIndex])]
        }
      })
    })
    return result
  }
  return { check }
}
