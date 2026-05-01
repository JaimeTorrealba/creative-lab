uniform sampler2D uHeightmap;
uniform float uDisplacement;

varying float vHeight;

void main() {
  vec2 uv = uv;
  float height = texture2D(uHeightmap, uv).r;
  vHeight = height;

  vec3 displaced = position + normal * height * uDisplacement;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
