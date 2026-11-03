import { PointLight } from 'three'

const FIRE_LIGHT_COLOR = '#ff8a3a'
const FIRE_LIGHT_HEIGHT = 1.1
const FIRE_LIGHT_DISTANCE = 6

export const attachFireLight = (root) => {
  const light = new PointLight(FIRE_LIGHT_COLOR, 0, FIRE_LIGHT_DISTANCE, 2)
  light.position.y = FIRE_LIGHT_HEIGHT
  root.add(light)
  return light
}

const flickerAt = (elapsed, seed) =>
  0.8 + 0.12 * Math.sin(elapsed * 13 + seed) + 0.08 * Math.sin(elapsed * 29 + seed * 3.1)

export const updateFireLight = (light, intensity, strength, elapsed, seed) => {
  light.intensity = intensity * strength * flickerAt(elapsed, seed)
}
