uniform sampler2D uTexture;
uniform sampler2D uGrid;
uniform float uAspect;
uniform float uDisplacement;
uniform float uRgbShift;
uniform float uShowGrid;

varying vec2 vUv;

// The grid is square; crop it to the plane's aspect so cells stay square
vec2 getGridUv(vec2 uv) {
  vec2 ratio = vec2(min(uAspect, 1.0), min(1.0 / uAspect, 1.0));
  return uv * ratio + (1.0 - ratio) * 0.5;
}

void main() {
  vec2 offset = texture2D(uGrid, getGridUv(vUv)).rg;
  vec2 uv = vUv - offset * uDisplacement;

  float strength = clamp(length(offset), 0.0, 2.0);
  vec2 shift = offset * uRgbShift;
  float red = texture2D(uTexture, uv + shift * (1.0 + strength * 0.25)).r;
  float green = texture2D(uTexture, uv + shift * (1.0 + strength * 2.0)).g;
  float blue = texture2D(uTexture, uv + shift * (1.0 + strength * 1.5)).b;

  vec3 gridMap = vec3(offset * 0.5 + 0.5, 0.5);
  gl_FragColor = vec4(mix(vec3(red, green, blue), gridMap, uShowGrid), 1.0);
}
