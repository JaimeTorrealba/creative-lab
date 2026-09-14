uniform sampler2D uHeightMap;
uniform float uHeightScale;

varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
  vUv = uv;
  float height = texture2D(uHeightMap, uv).r;
  vec3 displaced = position + normal * height * uHeightScale;
  vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
  vWorldPos = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
