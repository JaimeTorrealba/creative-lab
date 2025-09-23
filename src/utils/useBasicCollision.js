import { Box3 } from 'three'
import { unrefElement } from '@vueuse/core'

// Works with Mesh, Group, and loaded models (e.g., GLTF roots).
export const useBasicCollision = (objects = []) => {
  if (!Array.isArray(objects) || objects.length < 2) {
    console.error('useBasicCollision: requires at least 2 objects')
    return { check: () => [] }
  }

  // Preallocate one Box3 per tracked object
  const AABBStore = objects.map(() => new Box3())

  // Try to resolve a usable THREE.Object3D from different wrappers/refs
  const resolveObject3D = (maybe) => {
    const el = unrefElement(maybe)
    if (el?.isObject3D) return el
    if (el?.object3D?.isObject3D) return el.object3D
    if (el?.value?.isObject3D) return el.value
    return null
  }

  const check = () => {
    // Update world-space AABBs for all objects
    for (let i = 0; i < objects.length; i++) {
      const obj = resolveObject3D(objects[i])
      if (!obj) {
        AABBStore[i].makeEmpty()
        continue
      }
      AABBStore[i].setFromObject(obj)
    }

    // Pairwise intersection test; return first collision pair found
    for (let i = 0; i < AABBStore.length; i++) {
      for (let j = i + 1; j < AABBStore.length; j++) {
        if (AABBStore[i].intersectsBox(AABBStore[j])) {
          return [resolveObject3D(objects[i]), resolveObject3D(objects[j])]
        }
      }
    }
    return []
  }

  return { check }
}
