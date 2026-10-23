import {
  DirectionalLight,
  Mesh,
  MeshBasicNodeMaterial,
  PMREMGenerator,
  PointLight,
  SphereGeometry
} from 'three/webgpu'
import { color, length, mix, screenUV, smoothstep } from 'three/tsl'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

const createEnvironmentTexture = (renderer) => {
  const pmrem = new PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const texture = pmrem.fromScene(room, 0.04).texture
  room.dispose()
  pmrem.dispose()
  return texture
}

const createBackgroundNode = () => {
  const vignette = smoothstep(0.9, 0.1, length(screenUV.sub(0.5)))
  return mix(color('#040409'), color('#1a1b26'), vignette)
}

// Decay 0 keeps the diffraction intensity independent of the light's orbit radius
const createKeyLight = (uniforms) => {
  const light = new PointLight(uniforms.lightColor.value, 2.5, 0, 0)
  const marker = new Mesh(
    new SphereGeometry(0.025, 16, 16),
    new MeshBasicNodeMaterial({ color: uniforms.lightColor.value })
  )
  light.add(marker)
  return { light, marker }
}

export const createStudio = ({ renderer, scene, uniforms }) => {
  const previous = { environment: scene.environment, backgroundNode: scene.backgroundNode }
  const environment = createEnvironmentTexture(renderer)
  scene.environment = environment
  scene.environmentIntensity = 0.5
  scene.backgroundNode = createBackgroundNode()

  const { light, marker } = createKeyLight(uniforms)
  const fill = new DirectionalLight('#9fb6ff', 0.4)
  fill.position.set(-2, -1, 1.5)

  const disposeStudio = () => {
    scene.environment = previous.environment
    scene.backgroundNode = previous.backgroundNode
    environment.dispose()
    marker.geometry.dispose()
    marker.material.dispose()
  }

  return { light, marker, fill, disposeStudio }
}
