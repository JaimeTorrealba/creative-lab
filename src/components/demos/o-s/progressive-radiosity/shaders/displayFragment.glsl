// Bilinear reconstruction is done by hand, clamped to the polygon's own tile so neighbouring
// tiles in the atlas never bleed in (and float textures need no linear-filter extension).
uniform sampler2D uRadiosity;
uniform sampler2D uResidual;
uniform vec3 uAmbient;
uniform float uResidualGain;
uniform int uView;

varying vec2 vTexel;
flat varying vec4 vTileRect;
varying vec3 vAlbedo;

vec2 clampToTile(vec2 texel) {
  return clamp(texel, vTileRect.xy + 0.5, vTileRect.xy + vTileRect.zw - 0.5);
}

vec4 sampleNearest(sampler2D map) {
  return texelFetch(map, ivec2(clampToTile(vTexel)), 0);
}

vec4 sampleBilinear(sampler2D map) {
  ivec2 last = ivec2(vTileRect.xy + vTileRect.zw - 0.5);
  vec2 coord = clampToTile(vTexel) - 0.5;
  vec2 base = floor(coord);
  vec2 weight = coord - base;
  ivec2 low = ivec2(base);
  ivec2 high = min(low + 1, last);
  vec4 a = texelFetch(map, low, 0);
  vec4 b = texelFetch(map, ivec2(high.x, low.y), 0);
  vec4 c = texelFetch(map, ivec2(low.x, high.y), 0);
  vec4 d = texelFetch(map, high, 0);
  return mix(mix(a, b, weight.x), mix(c, d, weight.x), weight.y);
}

vec4 sampleSurface(sampler2D map) {
  return uView == 1 ? sampleNearest(map) : sampleBilinear(map);
}

void main() {
  vec3 color;
  if (uView == 2) {
    color = sampleBilinear(uResidual).rgb * uResidualGain;
  } else {
    color = sampleSurface(uRadiosity).rgb + vAlbedo * uAmbient;
    if (uView == 3) color = mix(color, vec3(2.0, 0.7, 0.15), sampleNearest(uResidual).a * 0.85);
  }
  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
