uniform sampler2D uGBuffer;
uniform vec2 uResolution;
uniform float uLineWidth;
uniform float uNormalThreshold;
uniform float uDepthThreshold;
uniform float uWeight;

varying vec2 vUv;

// Edge extraction (GPU Gems 2, 15.1): silhouette, border and crease edges all fall
// out of discontinuities in the normal buffer and the z-buffer, read by sampling
// neighbouring texels of one depth layer.
void tap(
  vec2 sampleUv,
  vec3 centerNormal,
  float centerDepth,
  inout float normalDelta,
  inout float depthDelta,
  inout float border
) {
  vec4 sampled = texture2D(uGBuffer, sampleUv);
  float depth = sampled.a;

  if ((centerDepth > 0.0) != (depth > 0.0)) {
    // One of the two taps is empty: this is a silhouette or border edge.
    border = 1.0;
  } else if (centerDepth > 0.0) {
    normalDelta = max(normalDelta, 1.0 - dot(centerNormal, sampled.rgb * 2.0 - 1.0));
    depthDelta = max(depthDelta, abs(centerDepth - depth));
  }
}

void main() {
  vec2 texel = uLineWidth / uResolution;

  vec4 center = texture2D(uGBuffer, vUv);
  vec3 centerNormal = center.rgb * 2.0 - 1.0;
  float centerDepth = center.a;

  float normalDelta = 0.0;
  float depthDelta = 0.0;
  float border = 0.0;

  // Four taps are enough here: the chapter only needs the discontinuity to exist,
  // never its direction.
  tap(vUv + vec2(texel.x, 0.0), centerNormal, centerDepth, normalDelta, depthDelta, border);
  tap(vUv - vec2(texel.x, 0.0), centerNormal, centerDepth, normalDelta, depthDelta, border);
  tap(vUv + vec2(0.0, texel.y), centerNormal, centerDepth, normalDelta, depthDelta, border);
  tap(vUv - vec2(0.0, texel.y), centerNormal, centerDepth, normalDelta, depthDelta, border);

  // Both ramps start at 60% of their threshold rather than at zero: without that
  // dead zone the gentle normal drift across a curved tooth would wash the whole
  // surface in faint grey instead of leaving it blank.
  float crease = smoothstep(uNormalThreshold * 0.6, uNormalThreshold, normalDelta);
  float depthEdge = smoothstep(uDepthThreshold * 0.6, uDepthThreshold, depthDelta);
  float edge = max(border, max(crease, depthEdge));

  gl_FragColor = vec4(vec3(edge * uWeight), 1.0);
}
