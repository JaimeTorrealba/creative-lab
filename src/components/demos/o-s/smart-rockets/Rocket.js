import { Vector2 } from 'three'

export const TARGET_RADIUS = 12

export const createRocket = (startPosition, dna) => ({
  position: startPosition.clone(),
  velocity: new Vector2(),
  acceleration: new Vector2(),
  dna,
  fitness: 0,
  geneCounter: 0,
  hitTarget: false
})

const checkRocketHitTarget = (rocket, target) => {
  if (rocket.position.distanceTo(target) < TARGET_RADIUS) rocket.hitTarget = true
}

const updateRocketPhysics = (rocket) => {
  rocket.velocity.add(rocket.acceleration)
  rocket.position.add(rocket.velocity)
  rocket.acceleration.set(0, 0)
}

export const runRocket = (rocket, target) => {
  checkRocketHitTarget(rocket, target)
  if (rocket.hitTarget) return
  rocket.acceleration.add(rocket.dna.genes[rocket.geneCounter])
  rocket.geneCounter = (rocket.geneCounter + 1) % rocket.dna.genes.length
  updateRocketPhysics(rocket)
}

export const calculateRocketFitness = (rocket, target) => {
  // Clamped so a rocket sitting exactly on the target can't produce an infinite fitness
  const distance = Math.max(rocket.position.distanceTo(target), 1)
  rocket.fitness = 1 / (distance * distance)
}

export const getRocketHeading = (rocket) =>
  Math.atan2(rocket.velocity.y, rocket.velocity.x) - Math.PI / 2
