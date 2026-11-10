import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  InstancedMesh,
  MeshBasicMaterial,
  Object3D
} from 'three'
import { getRocketHeading } from './Rocket'

const ROCKET_RADIUS = 5
const BODY_COLOR = new Color('#ffffff')
const THRUSTER_COLOR = new Color('#ff7a3d')
const FLYING_TINT = new Color('#c8c8c8')
const LANDED_TINT = new Color('#7dff9a')

const createQuadVertices = (centerX, centerY, width, height) => {
  const left = centerX - width / 2
  const right = centerX + width / 2
  const bottom = centerY - height / 2
  const top = centerY + height / 2
  const lowerTriangle = [left, bottom, 0, right, bottom, 0, right, top, 0]
  const upperTriangle = [left, bottom, 0, right, top, 0, left, top, 0]
  return [...lowerTriangle, ...upperTriangle]
}

const repeatColor = (color, vertexCount) =>
  Array.from({ length: vertexCount }, () => [color.r, color.g, color.b]).flat()

// Thrusters come first so the body, drawn later at the same depth, covers their overlap
const createRocketGeometry = () => {
  const r = ROCKET_RADIUS
  const thrusters = [
    ...createQuadVertices(-r / 2, -r * 2, r / 2, r),
    ...createQuadVertices(r / 2, -r * 2, r / 2, r)
  ]
  const body = [0, r * 2, 0, -r, -r * 2, 0, r, -r * 2, 0]
  const colors = [...repeatColor(THRUSTER_COLOR, 12), ...repeatColor(BODY_COLOR, 3)]

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute([...thrusters, ...body], 3))
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  return geometry
}

export const createRocketMesh = (maxCount) => {
  const material = new MeshBasicMaterial({ vertexColors: true })
  const mesh = new InstancedMesh(createRocketGeometry(), material, maxCount)
  mesh.frustumCulled = false
  return mesh
}

const placeholder = new Object3D()

const writeRocketInstance = (mesh, rocket, index) => {
  placeholder.position.set(rocket.position.x, rocket.position.y, 0)
  placeholder.rotation.z = getRocketHeading(rocket)
  placeholder.updateMatrix()
  mesh.setMatrixAt(index, placeholder.matrix)
  mesh.setColorAt(index, rocket.hitTarget ? LANDED_TINT : FLYING_TINT)
}

export const syncRocketMesh = (mesh, rockets) => {
  mesh.count = rockets.length
  rockets.forEach((rocket, index) => writeRocketInstance(mesh, rocket, index))
  mesh.instanceMatrix.needsUpdate = true
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
}

export const disposeRocketMesh = (mesh) => {
  mesh.geometry.dispose()
  mesh.material.dispose()
  mesh.dispose()
}
