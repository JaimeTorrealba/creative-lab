import { gsap } from 'gsap'
import { Color, InstancedMesh, Object3D, Vector3 } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

const dummy = new Object3D()

export const createVoxelGeometry = ({ boxSize, boxRoundness }) =>
  new RoundedBoxGeometry(boxSize, boxSize, boxSize, 2, Math.min(boxRoundness, boxSize / 2))

const createRandomVoxel = (gridSize) => {
  const randomCoordinate = () => {
    const value = Math.random() - 0.5
    return value - (value % gridSize)
  }
  return {
    position: new Vector3(randomCoordinate(), randomCoordinate(), randomCoordinate()),
    color: new Color().setHSL(Math.random(), 0.8, 0.8)
  }
}

export const growVoxelPool = (voxels, count, gridSize) => {
  while (voxels.length < count) voxels.push(createRandomVoxel(gridSize))
}

const writeVoxelMatrix = (mesh, index, position) => {
  dummy.position.copy(position)
  dummy.updateMatrix()
  mesh.setMatrixAt(index, dummy.matrix)
  mesh.instanceMatrix.needsUpdate = true
}

const writeVoxelColor = (mesh, index, color) => {
  mesh.setColorAt(index, color)
  mesh.instanceColor.needsUpdate = true
}

export const createVoxelMesh = ({ geometry, material, voxels }) => {
  const mesh = new InstancedMesh(geometry, material, voxels.length)
  mesh.castShadow = true
  mesh.receiveShadow = true
  // Instances move every transition, so a cached bounding sphere would go stale
  mesh.frustumCulled = false
  voxels.forEach(({ position, color }, index) => {
    writeVoxelMatrix(mesh, index, position)
    writeVoxelColor(mesh, index, color)
  })
  return mesh
}

export const killVoxelTweens = (mesh, voxels) => {
  voxels.forEach(({ position, color }) => gsap.killTweensOf([position, color]))
  gsap.killTweensOf([mesh, mesh.rotation])
}

const tweenVoxelColor = ({ mesh, voxel, index, targetColor, duration }) =>
  gsap.to(voxel.color, {
    delay: 0.7 * Math.random() * duration,
    duration: 0.05,
    r: targetColor.r,
    g: targetColor.g,
    b: targetColor.b,
    ease: 'power1.in',
    onUpdate: () => writeVoxelColor(mesh, index, voxel.color)
  })

const tweenVoxelPosition = ({ mesh, voxel, index, targetPosition, duration }) =>
  gsap.to(voxel.position, {
    delay: 0.2 * Math.random(),
    duration,
    x: targetPosition.x,
    y: targetPosition.y,
    z: targetPosition.z,
    ease: 'back.out(3)',
    onUpdate: () => writeVoxelMatrix(mesh, index, voxel.position)
  })

const pickRandomVoxel = (voxels) => voxels[Math.floor(Math.random() * voxels.length)]

// Spare voxels fly into an occupied cell and get hidden by the instance count tween
export const morphVoxels = ({ mesh, voxels, targetVoxels }) => {
  killVoxelTweens(mesh, voxels)

  voxels.forEach((voxel, index) => {
    const duration = 0.5 + 0.5 * Math.pow(Math.random(), 6)
    const target = targetVoxels[index]
    if (target) tweenVoxelColor({ mesh, voxel, index, targetColor: target.color, duration })
    const targetPosition = (target ?? pickRandomVoxel(targetVoxels)).position
    tweenVoxelPosition({ mesh, voxel, index, targetPosition, duration })
  })

  gsap.to(mesh.rotation, { duration: 1.2, y: `+=${1.3 * Math.PI}`, ease: 'power2.out' })
  gsap.to(mesh, { duration: 0.4, count: targetVoxels.length, snap: 'count' })
}
