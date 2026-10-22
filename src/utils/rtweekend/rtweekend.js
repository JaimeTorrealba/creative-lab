// rtweekend.h
export const rtweekend = /* wgsl */ `
// Constants

const infinity = 0x1.fffffep+127f;
const pi = 3.1415926535897932385;

// Utility Functions

fn degrees_to_radians(degrees: f32) -> f32 {
  return degrees * pi / 180.0;
}

// Not from the book: WGSL has no std::rand / std::mt19937, so random_double() uses a PCG hash.
var<private> rng_state: u32;

fn pcg_hash(input: u32) -> u32 {
  let state = input * 747796405u + 2891336453u;
  let word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
  return (word >> 22u) ^ word;
}

fn seed_random(seed: u32) {
  rng_state = pcg_hash(seed);
}

fn random_double() -> f32 {
  // Returns a random real in [0,1).
  rng_state = pcg_hash(rng_state);
  return f32(rng_state >> 8u) / 16777216.0;
}

fn random_double_range(min: f32, max: f32) -> f32 {
  // Returns a random real in [min,max).
  return min + (max - min) * random_double();
}
`
