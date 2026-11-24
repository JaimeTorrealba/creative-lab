// Albedo of the donut in linear space, shared by the live view and the texture export.
uniform vec3 uDoughColor;
uniform vec3 uLiquidColor;
uniform float uLiquidOpacity;
uniform float uFilmThickness;

float hashCorner(vec3 cell) {
  return fract(sin(dot(cell, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
}

float valueNoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  vec2 e = vec2(0.0, 1.0);
  return mix(
    mix(mix(hashCorner(i), hashCorner(i + e.yxx), f.x), mix(hashCorner(i + e.xyx), hashCorner(i + e.yyx), f.x), f.y),
    mix(mix(hashCorner(i + e.xxy), hashCorner(i + e.yxy), f.x), mix(hashCorner(i + e.xyy), hashCorner(i + e.yyy), f.x), f.y),
    f.z
  );
}

vec3 srgbToLinear(vec3 color) {
  return mix(color / 12.92, pow((color + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), color));
}

vec3 linearToSrgb(vec3 color) {
  return mix(color * 12.92, 1.055 * pow(color, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), color));
}

float liquidCover(SurfaceSample surface) {
  return smoothstep(0.0, uFilmThickness, surface.liquid.x) * uLiquidOpacity;
}

// Dough (with a little crumb noise), then paint over it, darkened where wet, then the liquid.
vec3 surfaceAlbedo(vec3 objectPosition, SurfaceSample surface) {
  float crumb = valueNoise(objectPosition * 18.0) * 0.6 + valueNoise(objectPosition * 47.0) * 0.4;
  vec3 dough = uDoughColor * mix(0.82, 1.08, crumb);
  vec3 painted = mix(dough, srgbToLinear(surface.paint.rgb), surface.paint.a);
  painted *= mix(1.0, 0.62, surface.liquid.y);
  return mix(painted, uLiquidColor, liquidCover(surface));
}
