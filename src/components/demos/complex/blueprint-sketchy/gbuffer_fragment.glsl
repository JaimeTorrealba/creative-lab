uniform sampler2D uPrevDepth;
uniform vec2 uResolution;
uniform float uPeel;
uniform float uNear;
uniform float uFar;

varying vec3 vViewNormal;
varying float vViewDepth;

// Depth peeling (GPU Gems 2, 15.1): the first pass is an ordinary depth test, and
// every pass after it also rejects anything at or in front of the layer already
// captured. Each pass therefore strips off exactly one more depth-ordered surface.
// The comparison is exact rather than tolerant: the previous layer's depth came
// out of the same rasteriser, so the winning fragment reproduces it bit for bit.
const float PEEL_BIAS = 1e-6;

void main() {
  if (uPeel > 0.5) {
    float previous = texture2D(uPrevDepth, gl_FragCoord.xy / uResolution).r;
    if (gl_FragCoord.z <= previous + PEEL_BIAS) discard;
  }

  vec3 normal = normalize(vViewNormal);
  // The peel material is double-sided so the far side of a closed hull becomes a
  // layer of its own; those fragments need their normal turned around.
  if (!gl_FrontFacing) normal = -normal;

  // Alpha carries linear view depth and doubles as a coverage flag, since the
  // target is cleared to zero. The floor keeps a fragment sitting exactly on the
  // near plane from reading as background.
  float depth = clamp((vViewDepth - uNear) / (uFar - uNear), 0.0, 1.0);

  gl_FragColor = vec4(normal * 0.5 + 0.5, 0.002 + depth * 0.998);
}
