uniform sampler2D uEdge;
uniform vec3 uPaperColor;
uniform vec3 uLineColor;
uniform float uLineStrength;
uniform float uGrid;
uniform float uGridSpacing;

varying vec2 vUv;

// Derivative-free grid: distance to the nearest cell border, in pixels.
float gridLine(vec2 fragCoord, float spacing) {
  vec2 cell = fract(fragCoord / spacing);
  vec2 distanceToEdge = min(cell, 1.0 - cell) * spacing;
  return 1.0 - smoothstep(0.0, 1.0, min(distanceToEdge.x, distanceToEdge.y));
}

// Blueprint compositing (GPU Gems 2, 15.1): every depth layer's edge map has already
// been blended into uEdge using its edge intensity as the blending factor, so the
// interior line work of the occluded layers survives alongside the outer silhouette.
void main() {
  vec3 paper = uPaperColor;

  if (uGrid > 0.5) {
    float minor = gridLine(gl_FragCoord.xy, uGridSpacing);
    float major = gridLine(gl_FragCoord.xy, uGridSpacing * 5.0);
    paper = mix(paper, uLineColor, minor * 0.07 + major * 0.13);
  }

  float edge = clamp(texture2D(uEdge, vUv).r * uLineStrength, 0.0, 1.0);

  gl_FragColor = vec4(mix(paper, uLineColor, edge), 1.0);

  // Every buffer up to here is linear; this is the single encode on the way out.
  #include <colorspace_fragment>
}
