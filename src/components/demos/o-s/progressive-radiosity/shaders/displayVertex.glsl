attribute vec2 surfaceUv;
attribute vec4 tileRect;
attribute vec3 albedo;

varying vec2 vTexel;
flat varying vec4 vTileRect;
varying vec3 vAlbedo;

void main() {
  vTexel = tileRect.xy + surfaceUv * tileRect.zw;
  vTileRect = tileRect;
  vAlbedo = albedo;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
