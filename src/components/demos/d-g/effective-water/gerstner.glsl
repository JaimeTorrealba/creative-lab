uniform float uTime;
uniform vec4 uWaves[4];
uniform float uAmplitudeScale;

// GPU Gems ch.1 Gerstner wave: P += (D * Q/k * cos(f), A * sin(f)), f = k(D.p - ct)
// Steepness Q encodes amplitude as A = Q/k, keeping the Q*w*A <= 1 no-loop constraint
vec3 gerstnerWave(vec4 wave, vec3 p, inout vec3 tangent, inout vec3 binormal) {
  vec2 d = normalize(wave.xy);
  float steepness = wave.z * uAmplitudeScale;
  float wavelength = wave.w;
  float k = 6.28318530718 / wavelength;
  float c = sqrt(9.8 / k);
  float f = k * (dot(d, p.xy) - c * uTime);
  float a = steepness / k;

  float sinF = sin(f);
  float cosF = cos(f);

  tangent += vec3(-d.x * d.x * steepness * sinF, -d.x * d.y * steepness * sinF, d.x * steepness * cosF);
  binormal += vec3(-d.x * d.y * steepness * sinF, -d.y * d.y * steepness * sinF, d.y * steepness * cosF);

  return vec3(d.x * a * cosF, d.y * a * cosF, a * sinF);
}

// The four-wave sum with the analytic frame that comes with it. Shared with the ch.2 caustics
// pass, which has to refract against exactly the surface the water mesh draws — evaluating the
// field twice from two copies of this code would drift the two apart the moment one is edited.
vec3 gerstnerSum(vec3 p, out vec3 tangent, out vec3 binormal) {
  tangent = vec3(1.0, 0.0, 0.0);
  binormal = vec3(0.0, 1.0, 0.0);

  vec3 displaced = p;
  for (int i = 0; i < 4; i++) {
    displaced += gerstnerWave(uWaves[i], p, tangent, binormal);
  }

  return displaced;
}
