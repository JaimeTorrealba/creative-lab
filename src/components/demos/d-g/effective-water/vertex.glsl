uniform float uTime;
uniform vec4 uWaves[4];
uniform float uAmplitudeScale;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vElevation;

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

void main() {
  vec3 tangent = vec3(1.0, 0.0, 0.0);
  vec3 binormal = vec3(0.0, 1.0, 0.0);
  vec3 displaced = position;

  for (int i = 0; i < 4; i++) {
    displaced += gerstnerWave(uWaves[i], position, tangent, binormal);
  }

  vec3 localNormal = normalize(cross(tangent, binormal));
  vNormal = normalize((modelMatrix * vec4(localNormal, 0.0)).xyz);
  vElevation = displaced.z;

  vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
