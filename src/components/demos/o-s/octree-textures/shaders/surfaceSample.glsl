// A leaf holds the 24-bit index of its texel in the per-leaf maps (37.4): the liquid state
// (r = height, g = wetness) and the paint (rgb = sRGB colour, a = coverage).
uniform sampler2D uState;
uniform sampler2D uPaintMap;
uniform int uTableWidth;
uniform bool uTrilinear;

struct SurfaceSample {
  vec4 paint;
  vec2 liquid;
};

ivec2 leafTexel(vec4 cell) {
  ivec3 bytes = ivec3(floor(cell.rgb * 255.0 + 0.5));
  int index = bytes.r + bytes.g * 256 + bytes.b * 65536;
  return ivec2(index % uTableWidth, index / uTableWidth);
}

// Paint is accumulated premultiplied so unpainted neighbours don't tint the edges of a stroke.
void accumulateLeaf(vec4 cell, float weight, inout vec4 paint, inout vec3 liquid) {
  if (cell.a < 0.9 || weight <= 0.0) return;
  ivec2 texel = leafTexel(cell);
  vec4 leafPaint = texelFetch(uPaintMap, texel, 0);
  paint += vec4(leafPaint.rgb * leafPaint.a, leafPaint.a) * weight;
  liquid += vec3(texelFetch(uState, texel, 0).rg, 1.0) * weight;
}

// Nearest: the one leaf holding M. Trilinear: its 8 neighbouring leaf centres, with empty ones
// dropped and the remaining weights renormalised.
SurfaceSample sampleSurface(vec3 objectPosition) {
  vec3 M = toOctreeSpace(objectPosition);
  vec4 paint = vec4(0.0);
  vec3 liquid = vec3(0.0);
  if (uTrilinear) {
    for (int corner = 0; corner < 8; corner++) {
      float weight;
      vec3 cornerPoint = octreeCornerPoint(M, corner, weight);
      accumulateLeaf(octreeLookup(cornerPoint), weight, paint, liquid);
    }
  } else {
    accumulateLeaf(octreeLookup(M), 1.0, paint, liquid);
  }
  float total = max(liquid.z, 1e-5);
  vec3 paintColor = paint.rgb / max(paint.a, 1e-5);
  return SurfaceSample(vec4(paintColor, paint.a / total), liquid.xy / total);
}
