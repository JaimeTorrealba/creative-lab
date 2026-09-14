in vec2 aSurfelUv;

uniform sampler2D uAccess;
uniform sampler2D uIndirect;

out vec3 vNormal;
out vec3 vBentNormal;
out vec3 vIndirect;
out float vAccess;

// Accessibility is solved per element, which is per welded vertex, so it arrives here as a vertex
// fetch and gets interpolated across the triangle exactly as the chapter shades it. No derivatives
// exist in a vertex shader, hence textureLod rather than texture.
void main() {
  vec4 access = textureLod(uAccess, aSurfelUv, 0.0);
  vAccess = access.r;
  vBentNormal = access.gba;
  vIndirect = textureLod(uIndirect, aSurfelUv, 0.0).rgb;

  vec4 world = modelMatrix * vec4(position, 1.0);
  vNormal = mat3(modelMatrix) * normal;

  gl_Position = projectionMatrix * viewMatrix * world;
}
