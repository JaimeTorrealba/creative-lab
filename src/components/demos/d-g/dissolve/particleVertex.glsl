uniform sampler2D uTexture;
uniform float uAlphaThreshold;
uniform float uBorderSize;
uniform float uTextureScale;
uniform float uTime;
uniform float uPixelRatio;
uniform float uParticleSize;
uniform float uParticleSpeed;
uniform float uParticleDistance;

attribute vec2 aUv;
attribute float aSeed;

varying float vFade;

void main() {
  // Same noise lookup as the mesh, so sparks only leave from the burning border
  float noise = texture2D(uTexture, aUv * uTextureScale).r;
  float onBorder = step(uAlphaThreshold, noise) * (1.0 - step(uAlphaThreshold + uBorderSize, noise));

  // Looping age instead of a simulation: each spark flies outward, wobbles and fades
  float age = fract(uTime * uParticleSpeed + aSeed);
  float swirl = aSeed * 40.0 + age * 6.0;
  vec3 drift = normalize(position) * age * uParticleDistance;
  drift += vec3(sin(swirl), cos(swirl * 0.8), sin(swirl * 1.3)) * 0.1 * age;
  drift.y += age * age * 0.3;

  vec4 viewPosition = modelViewMatrix * vec4(position + drift, 1.0);
  gl_Position = projectionMatrix * viewPosition;
  // Push off-border sparks past the near plane rather than relying on a zero point size
  if (onBorder < 0.5) gl_Position = vec4(0.0, 0.0, -2.0, 1.0);

  vFade = 1.0 - age;
  gl_PointSize = uParticleSize * uPixelRatio * vFade / -viewPosition.z;
}
