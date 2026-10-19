import { BufferAttribute, BufferGeometry, DynamicDrawUsage } from 'three'

// Suspended particulate drifting up through the light. Cheap enough to move on the CPU, and
// keeping it here keeps index.vue to scene composition.
export const createMarineSnow = (count, box) => {
  const positions = new Float32Array(count * 3)
  const speeds = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * box
    positions[i * 3 + 1] = (Math.random() - 0.5) * box
    positions[i * 3 + 2] = (Math.random() - 0.5) * box
    speeds[i] = 0.02 + Math.random() * 0.1
  }

  const geometry = new BufferGeometry()
  const attribute = new BufferAttribute(positions, 3)
  attribute.setUsage(DynamicDrawUsage)
  geometry.setAttribute('position', attribute)

  const update = (delta, elapsed) => {
    for (let i = 0; i < count; i++) {
      const k = i * 3
      positions[k] += Math.sin(elapsed * 0.4 + i) * delta * 0.05
      positions[k + 1] += speeds[i] * delta

      if (positions[k + 1] > box * 0.5) {
        positions[k] = (Math.random() - 0.5) * box
        positions[k + 1] -= box
        positions[k + 2] = (Math.random() - 0.5) * box
      }
    }
    attribute.needsUpdate = true
  }

  return { geometry, update, dispose: () => geometry.dispose() }
}
