import {
  CHUNK_COUNT,
  COUNTERS_PER_CHUNK,
  LOWEST_RESIDENT_LEVEL,
  REFERENCE_SLOT
} from './constants'

// The chapter's rule: the most detailed level whose share of the reference beats the threshold
export const getFirstVisibleLevel = (counts, threshold) => {
  const reference = counts[REFERENCE_SLOT]
  if (reference === 0) return LOWEST_RESIDENT_LEVEL
  for (let level = 0; level < LOWEST_RESIDENT_LEVEL; level++) {
    if (counts[level] / reference > threshold) return level
  }
  return LOWEST_RESIDENT_LEVEL
}

const getRoundRobinBatch = (cursor, batchSize) => {
  const length = Math.min(batchSize, CHUNK_COUNT)
  return Array.from({ length }, (_, offset) => (cursor + offset) % CHUNK_COUNT)
}

const sliceChunkCounts = (allCounts, chunkIndex) =>
  allCounts.slice(chunkIndex * COUNTERS_PER_CHUNK, (chunkIndex + 1) * COUNTERS_PER_CHUNK)

// One measurement in flight at a time; its readback latency is part of the amortization story
export const createMipStreaming = ({ terrain, measurement, params, onBatchMeasured }) => {
  const lastCountsByChunk = terrain.chunks.map(() => null)
  let cursor = 0
  let isMeasuring = false
  let isDisposed = false

  const applyChunkDecision = (chunk) => {
    const counts = lastCountsByChunk[chunk.chunkIndex]
    if (!counts) return
    terrain.setChunkFirstLevel(chunk, getFirstVisibleLevel(counts, params.threshold))
  }

  const measureNextBatchAsync = async (camera) => {
    const chunkIndices = getRoundRobinBatch(cursor, params.chunksPerCycle)
    cursor = (cursor + chunkIndices.length) % CHUNK_COUNT
    const allCounts = await measurement.measureChunksAsync(camera, chunkIndices)
    if (isDisposed) return
    chunkIndices.forEach((chunkIndex) => {
      lastCountsByChunk[chunkIndex] = sliceChunkCounts(allCounts, chunkIndex)
      applyChunkDecision(terrain.chunks[chunkIndex])
    })
    onBatchMeasured()
  }

  const update = (camera) => {
    if (isMeasuring || isDisposed) return
    isMeasuring = true
    measureNextBatchAsync(camera)
      .catch((error) => console.error(error))
      .finally(() => (isMeasuring = false))
  }

  const reapplyAllDecisions = () => terrain.chunks.forEach(applyChunkDecision)

  const getChunkCounts = (chunkIndex) => lastCountsByChunk[chunkIndex]

  const dispose = () => (isDisposed = true)

  return { update, reapplyAllDecisions, getChunkCounts, dispose }
}
