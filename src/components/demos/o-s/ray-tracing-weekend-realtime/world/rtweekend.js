// rtweekend.h / vec3.h helpers on the CPU. random_double() uses the same PCG hash as the WGSL
// port (src/utils/rtweekend/rtweekend.js), so the scene matches the offline Image 23.

let rng_state = 0

export const pcg_hash = (input) => {
  const state = (Math.imul(input, 747796405) + 2891336453) >>> 0
  const word = Math.imul(((state >>> ((state >>> 28) + 4)) ^ state) >>> 0, 277803737) >>> 0
  return ((word >>> 22) ^ word) >>> 0
}

export const seed_random = (seed) => {
  rng_state = pcg_hash(seed)
}

export const random_double = () => {
  // Returns a random real in [0,1).
  rng_state = pcg_hash(rng_state)
  return (rng_state >>> 8) / 16777216
}

export const random_double_range = (min, max) => min + (max - min) * random_double()

// vec3 / point3 / color are plain [x, y, z] arrays.
export const vec3 = (x, y, z) => [x, y, z]

export const vec3_add = (u, v) => [u[0] + v[0], u[1] + v[1], u[2] + v[2]]

export const vec3_sub = (u, v) => [u[0] - v[0], u[1] - v[1], u[2] - v[2]]

export const vec3_mul = (u, v) => [u[0] * v[0], u[1] * v[1], u[2] * v[2]]

export const vec3_length = (v) => Math.hypot(v[0], v[1], v[2])

export const vec3_random = () => [random_double(), random_double(), random_double()]

export const vec3_random_range = (min, max) => [
  random_double_range(min, max),
  random_double_range(min, max),
  random_double_range(min, max)
]
