attribute vec3 aCenter;
attribute vec2 aRandom;

uniform float uTime;
uniform float uWindStrength;
uniform float uWindSpeed;
uniform vec2 uWindDir;
uniform float uWaveLength;
uniform float uGustiness;

varying vec2 vUv;
varying float vSway;
varying float vDist;

void main() {
  float t = uTime * uWindSpeed;

  // GPU Gems "per grass object" animation: the wave phase depends on the
  // cluster center, not the vertex, so quads lean without texture distortion
  float wave = dot(uWindDir, aCenter.xz) * uWaveLength + aRandom.x;
  float wind = sin(t + wave)
    + uGustiness * (0.6 * sin(t * 2.33 + wave * 1.7) + 0.3 * sin(t * 4.1 + aRandom.x * 3.0));

  // uv.y = 0 at the roots, so only the upper vertices move
  float sway = wind * uWindStrength * aRandom.y * uv.y;

  vec3 pos = position;
  pos.xz += uWindDir * sway;
  pos.y -= sway * sway * 0.4;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  vUv = uv;
  vSway = sway;
  vDist = -mvPosition.z;

  gl_Position = projectionMatrix * mvPosition;
}
