#include './gradientNoise.glsl';

uniform sampler2D uDiffuse;
uniform sampler2D uSurfaceBuffer;
uniform sampler2D uCloudTexture;
uniform vec2 uResolution;

uniform vec3 uLineColor;
uniform float uDiffuseWeight;
uniform float uNormalWeight;
uniform float uDiffuseWobble;
uniform float uNormalWobble;
uniform float uGrain;
uniform float uEdgeLow;
uniform float uEdgeHigh;
uniform int uView;

varying vec2 vUv;

const vec3 LUMA = vec3(0.299, 0.587, 0.114);

float lumaAt(sampler2D image, vec2 uv, vec2 offset) {
  return dot(texture2D(image, uv + offset / uResolution).rgb, LUMA);
}

// gl_FragCoord sits on pixel centres, so the noise lattice turns into a per-pixel
// hash: that speckle is what breaks normal-buffer edges into graphite grain.
float sampleValue(vec2 offset, float wobble, float grain) {
  vec2 diffuseUv = vUv + wobble * uDiffuseWobble;
  vec2 normalUv = vUv + wobble * uNormalWobble;

  float diffuse = lumaAt(uDiffuse, diffuseUv, offset) * uDiffuseWeight;
  float normal = lumaAt(uSurfaceBuffer, normalUv, offset) * uNormalWeight;
  return diffuse + normal * grain;
}

float sobel(float wobble, float grain) {
  float tl = sampleValue(vec2(-1.0, 1.0), wobble, grain);
  float tc = sampleValue(vec2(0.0, 1.0), wobble, grain);
  float tr = sampleValue(vec2(1.0, 1.0), wobble, grain);
  float ml = sampleValue(vec2(-1.0, 0.0), wobble, grain);
  float mr = sampleValue(vec2(1.0, 0.0), wobble, grain);
  float bl = sampleValue(vec2(-1.0, -1.0), wobble, grain);
  float bc = sampleValue(vec2(0.0, -1.0), wobble, grain);
  float br = sampleValue(vec2(1.0, -1.0), wobble, grain);

  float gx = (tr + 2.0 * mr + br) - (tl + 2.0 * ml + bl);
  float gy = (tl + 2.0 * tc + tr) - (bl + 2.0 * bc + br);
  return clamp(gx * gx + gy * gy, 0.0, 1.0);
}

void main() {
  // The cloud texture displaces the lookups by a smooth, low-frequency amount, which
  // is what makes the outlines drift off the geometry like a hand-drawn stroke.
  float wobble = texture2D(uCloudTexture, vUv).r - 0.5;
  float grain = (gradientNoise(gl_FragCoord.xy) * 2.0 - 1.0) * uGrain;

  float edge = smoothstep(uEdgeLow, uEdgeHigh, sobel(wobble, grain));
  float line = step(0.1, edge);

  vec3 color = texture2D(uDiffuse, vUv).rgb;
  #ifdef TONE_MAPPING
  color = toneMapping(color);
  #endif

  if (uView == 1) color = vec3(1.0);
  if (uView == 2) color = texture2D(uSurfaceBuffer, vUv).rgb;
  if (uView != 3) color = mix(color, uLineColor, line);

  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}
