export const HEIGHT_URL = '/textures/world-creator/height.jpg'
export const GROUND_URL = '/textures/floor_rocks/Ground_Wet_Rocks_001_basecolor.jpg'

export const CHUNKS_PER_SIDE = 8
export const CHUNK_COUNT = CHUNKS_PER_SIDE * CHUNKS_PER_SIDE
export const CHUNK_SIZE = 8
export const CHUNK_SEGMENTS = 32
export const TERRAIN_SIZE = CHUNKS_PER_SIDE * CHUNK_SIZE
export const HEIGHT_SCALE = 12
export const TILE_WORLD_SIZE = 4

// Real and calibration textures must share size, wrap and filtering so the GPU picks the same mip
export const TEXTURE_ANISOTROPY = 4

// Like the chapter, only the top four levels are measured; anything coarser counts as level 3
export const MEASURED_LEVELS = 4
export const LOWEST_RESIDENT_LEVEL = MEASURED_LEVELS - 1
// One counter per measured level plus the reference count (every visible pixel) in the last slot
export const COUNTERS_PER_CHUNK = MEASURED_LEVELS + 1
export const REFERENCE_SLOT = MEASURED_LEVELS

// Calibration alpha per mip level (bytes); levels past the measured ones stay at 0
export const LEVEL_ALPHAS = [255, 191, 128, 64, 0]
export const LEVEL_COLORS = ['#ff453a', '#ffd60a', '#32d74b', '#0a84ff', '#5e5ce6']
