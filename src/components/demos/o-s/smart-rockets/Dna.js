import { Vector2 } from 'three'

const createRandomGene = (maxForce) => {
  const angle = Math.random() * Math.PI * 2
  const magnitude = Math.random() * maxForce
  return new Vector2(Math.cos(angle), Math.sin(angle)).multiplyScalar(magnitude)
}

export const createRandomDna = (lifeSpan, maxForce) => ({
  maxForce,
  genes: Array.from({ length: lifeSpan }, () => createRandomGene(maxForce))
})

export const crossoverDna = (dnaA, dnaB) => {
  const midpoint = Math.floor(Math.random() * dnaA.genes.length)
  const genes = dnaA.genes.map((gene, index) => (index > midpoint ? gene : dnaB.genes[index]))
  return { maxForce: dnaA.maxForce, genes }
}

export const mutateDna = (dna, mutationRate) => {
  dna.genes.forEach((_, index) => {
    if (Math.random() < mutationRate) dna.genes[index] = createRandomGene(dna.maxForce)
  })
}
