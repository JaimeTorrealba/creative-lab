#include './turbulence.glsl';

uniform sampler2D uEdge;
uniform sampler2D uShade;
uniform mat2 uEdgeMatrix;
uniform mat2 uShadeMatrix;
uniform vec3 uInkColor;
uniform float uLineStrength;
uniform float uNoiseScale;
uniform float uOctaves;
uniform float uRepeat;
uniform float uGrain;
uniform float uSeed;

varying vec2 vUv;

const int MAX_REPEAT = 3;

// Sketchy drawings (GPU Gems 2, 15.3). The edge map and the shade map are drawn onto
// one screen-aligned quad, and their texture coordinates are translated by an offset
// vector taken from turbulence and weighted by a user-defined 2x2 matrix. Two
// different matrices means two different degrees of uncertainty, so the ink and the
// colour slide apart the way they do in a drawing made by hand.
void main() {
  vec2 p = vUv * uNoiseScale;

  float offsetS = turbulence(p, uOctaves, uSeed);
  float offsetT = turbulence(uNoiseScale - p, uOctaves, uSeed + 17.0);
  vec2 offset = vec2(offsetS, offsetT) - TURBULENCE_BIAS;

  vec3 paper = texture2D(uShade, vUv + uShadeMatrix * offset).rgb;

  // "Repeated edges" (15.3.3): read the same edge map again through a wider matrix to
  // get the doubled, searching outline of a pencil sketch. Each repeat is fainter.
  float ink = 0.0;
  for (int i = 0; i < MAX_REPEAT; i++) {
    if (float(i) >= uRepeat) break;
    float spread = 1.0 + float(i) * 0.85;
    float layer = texture2D(uEdge, vUv + uEdgeMatrix * offset * spread).r;
    ink = max(ink, layer / (1.0 + float(i)));
  }
  ink = clamp(ink * uLineStrength, 0.0, 1.0);

  // Paper tooth, over both the patches and the bare paper. Seeded at zero rather
  // than from uSeed: the ink is what boils, the sheet underneath stays put.
  float grain = turbulence(vUv * 220.0, 2.0, 0.0);
  paper -= grain * uGrain * 0.35;

  gl_FragColor = vec4(mix(paper, uInkColor, ink), 1.0);

  // Every buffer up to here is linear; this is the single encode on the way out.
  #include <colorspace_fragment>
}
