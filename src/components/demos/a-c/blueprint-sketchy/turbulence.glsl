#include '../../../shaders/SHARED/noise2D.glsl';

// The uncertainty source of GPU Gems 2, 15.3. The chapter reads offsets out of a
// Perlin turbulence function — the sum of |noise| over octaves — and 15.3.2 samples
// it once forwards and once backwards so the s and t offsets stay uncorrelated.
// MAX_OCTAVES only bounds the loop; uOctaves picks how many actually run.
const int MAX_OCTAVES = 5;

// Mean of the series below, subtracted by the caller so the offset is zero-mean and
// the drawing wobbles instead of drifting off in one direction.
const float TURBULENCE_BIAS = 0.25;

float turbulence(vec2 p, float octaves, float seed) {
  float sum = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int i = 0; i < MAX_OCTAVES; i++) {
    if (float(i) >= octaves) break;
    sum += abs(snoise(p * frequency + vec2(seed))) * amplitude;
    frequency *= 2.0;
    amplitude *= 0.5;
  }

  return sum;
}
