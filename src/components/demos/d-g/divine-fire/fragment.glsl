#include '../../../shaders/SHARED/noise3D.glsl';

uniform float uTime;
uniform float uIntensity;
uniform float uErosion;
uniform float uSoftness;
uniform float uFresnelPower;
uniform float uTextureScale;
uniform float uScrollSpeed;
uniform float uDistortion;
uniform float uDistortionSpeed;
uniform float uBrightness;
uniform float uDebugMask;
uniform vec3 uColorCore;
uniform vec3 uColorMid;
uniform vec3 uColorDeep;

varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying float vMask;

float fireFbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 3; i++) {
    value += amplitude * snoise(p);
    p *= 2.03;
    amplitude *= 0.5;
  }
  return value * 0.5 + 0.5;
}

// Plays the role of the fire texture: scrolls up, its UVs warped by a slower noise
float sampleFire(vec2 plane) {
  vec2 uv = plane * uTextureScale;
  vec2 distortUv = uv * 0.8 - vec2(0.0, uTime * uDistortionSpeed);
  vec2 distortion = vec2(
    snoise(vec3(distortUv, 1.7)),
    snoise(vec3(distortUv, 9.3))
  );
  uv += distortion * uDistortion;
  uv.y = uv.y * 0.5 - uTime * uScrollSpeed;
  return fireFbm(vec3(uv, uTime * 0.15));
}

// Duo-planar: XY and ZY projections only, top faces are eroded away anyway
float sampleFireDuoPlanar(vec3 position, vec3 normal) {
  vec2 weights = abs(normal.xz) + 0.001;
  weights /= weights.x + weights.y;
  return sampleFire(position.zy) * weights.x + sampleFire(position.xy) * weights.y;
}

void main() {
  vec3 normal = normalize(vWorldNormal);

  if (uDebugMask > 0.5) {
    gl_FragColor = vec4(vec3(vMask), 1.0);
    return;
  }

  float fire = sampleFireDuoPlanar(vWorldPosition, normal);

  float heat = fire - vMask * uErosion - (1.0 - uIntensity);
  float alpha = smoothstep(0.0, uSoftness, heat);

  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
  float fresnel = pow(abs(dot(normal, viewDirection)), uFresnelPower);
  alpha *= fresnel;

  float colorRamp = clamp(heat * 1.6, 0.0, 1.0);
  vec3 color = mix(uColorDeep, uColorMid, smoothstep(0.0, 0.5, colorRamp));
  color = mix(color, uColorCore, smoothstep(0.5, 1.0, colorRamp));

  gl_FragColor = vec4(color * uBrightness, alpha);
  #include <colorspace_fragment>
}
