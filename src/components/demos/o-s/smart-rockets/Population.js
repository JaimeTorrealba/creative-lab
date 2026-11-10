import { createRandomDna, crossoverDna, mutateDna } from './Dna'
import { createRocket, runRocket, calculateRocketFitness } from './Rocket'

export const createPopulation = ({ populationSize, lifeSpan, maxForce, startPosition }) => ({
  startPosition,
  generations: 0,
  rockets: Array.from({ length: populationSize }, () =>
    createRocket(startPosition, createRandomDna(lifeSpan, maxForce))
  )
})

export const livePopulation = (population, target) => {
  population.rockets.forEach((rocket) => runRocket(rocket, target))
}

const normalizePopulationFitness = (rockets) => {
  const totalFitness = rockets.reduce((sum, rocket) => sum + rocket.fitness, 0)
  rockets.forEach((rocket) => {
    rocket.fitness /= totalFitness
  })
}

// Walks the normalized fitness "wheel": fitter rockets cover more of [0, 1)
const pickWeightedDna = (rockets) => {
  let index = 0
  let remaining = Math.random()
  while (remaining > 0 && index < rockets.length) {
    remaining -= rockets[index].fitness
    index++
  }
  return rockets[Math.max(index - 1, 0)].dna
}

const createChildRocket = (population, mutationRate) => {
  const { rockets, startPosition } = population
  const childDna = crossoverDna(pickWeightedDna(rockets), pickWeightedDna(rockets))
  mutateDna(childDna, mutationRate)
  return createRocket(startPosition, childDna)
}

export const evolvePopulation = (population, target, mutationRate) => {
  population.rockets.forEach((rocket) => calculateRocketFitness(rocket, target))
  normalizePopulationFitness(population.rockets)
  population.rockets = population.rockets.map(() => createChildRocket(population, mutationRate))
  population.generations++
}

export const countRocketsOnTarget = (population) =>
  population.rockets.filter((rocket) => rocket.hitTarget).length
