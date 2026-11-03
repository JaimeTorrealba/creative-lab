import { onUnmounted } from 'vue'
import { useRapier } from '@tresjs/rapier'
import { CLOTH_HEIGHT, CLOTH_SEGMENTS, CLOTH_SIZE } from './constants'

const SPACING = CLOTH_SIZE / (CLOTH_SEGMENTS - 1)
const PARTICLE_RADIUS = SPACING * 0.3
const BODY_CENTER = { x: 0, y: 0, z: 0 }
const ZERO_VELOCITY = { x: 0, y: 0, z: 0 }
// structural (right, down) + shear (both diagonals)
const LINK_OFFSETS = [
  [1, 0],
  [0, 1],
  [1, 1],
  [-1, 1]
]

const getRestPositionByIndex = (index) => ({
  x: (index % CLOTH_SEGMENTS) * SPACING - CLOTH_SIZE / 2,
  // tiny jitter breaks the symmetry so the cloth folds instead of draping perfectly
  y: CLOTH_HEIGHT + Math.random() * 0.02,
  z: Math.floor(index / CLOTH_SEGMENTS) * SPACING - CLOTH_SIZE / 2
})

const createParticleBody = (world, rapier, index) => {
  const { x, y, z } = getRestPositionByIndex(index)
  const bodyDesc = rapier.RigidBodyDesc.dynamic()
    .setTranslation(x, y, z)
    .lockRotations()
    .setLinearDamping(0.3)
  const body = world.createRigidBody(bodyDesc)
  world.createCollider(rapier.ColliderDesc.ball(PARTICLE_RADIUS).setFriction(0.8), body)
  return body
}

const isInsideGrid = (column, row) =>
  column >= 0 && column < CLOTH_SEGMENTS && row >= 0 && row < CLOTH_SEGMENTS

const linkParticleToNeighbors = (world, rapier, bodies, index) => {
  const column = index % CLOTH_SEGMENTS
  const row = Math.floor(index / CLOTH_SEGMENTS)

  LINK_OFFSETS.forEach(([columnOffset, rowOffset]) => {
    const neighborColumn = column + columnOffset
    const neighborRow = row + rowOffset
    if (!isInsideGrid(neighborColumn, neighborRow)) return

    const length = SPACING * Math.hypot(columnOffset, rowOffset)
    const rope = rapier.JointData.rope(length, BODY_CENTER, BODY_CENTER)
    const neighbor = bodies[neighborRow * CLOTH_SEGMENTS + neighborColumn]
    world.createImpulseJoint(rope, bodies[index], neighbor, true)
  })
}

export const useClothParticles = () => {
  const { world, rapier } = useRapier()
  const particleCount = CLOTH_SEGMENTS * CLOTH_SEGMENTS
  const bodies = Array.from({ length: particleCount }, (_, index) =>
    createParticleBody(world.value, rapier.value, index)
  )
  bodies.forEach((_, index) => linkParticleToNeighbors(world.value, rapier.value, bodies, index))

  const dropCloth = () =>
    bodies.forEach((body, index) => {
      body.setTranslation(getRestPositionByIndex(index), true)
      body.setLinvel(ZERO_VELOCITY, true)
    })

  const setSolverIterations = (iterations) => {
    world.value.numSolverIterations = iterations
  }

  const copyParticlesToGeometry = (geometry) => {
    const positions = geometry.attributes.position
    bodies.forEach((body, index) => {
      const { x, y, z } = body.translation()
      positions.setXYZ(index, x, y, z)
    })
    positions.needsUpdate = true
    geometry.computeVertexNormals()
  }

  onUnmounted(() => bodies.forEach((body) => world.value?.removeRigidBody(body)))

  return { dropCloth, setSolverIterations, copyParticlesToGeometry }
}
