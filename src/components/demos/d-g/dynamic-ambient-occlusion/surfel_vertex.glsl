in vec2 aSurfelUv;

uniform sampler2D uPos;
uniform sampler2D uAccess;
uniform float uProjectionScale;
uniform float uDiskScale;

out float vAccess;

void main() {
  vec4 element = textureLod(uPos, aSurfelUv, 0.0);

  vAccess = 0.0;

  // Padding slots hold zero area. Throw them outside the clip volume rather than branch downstream.
  if (element.w <= 0.0) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    return;
  }

  vAccess = textureLod(uAccess, aSurfelUv, 0.0).r;

  vec4 view = viewMatrix * vec4(element.xyz, 1.0);
  gl_Position = projectionMatrix * view;

  // An element is a disk of the area it was given, so its radius is sqrt(area / pi).
  float radius = sqrt(element.w / 3.14159265);
  gl_PointSize = max(1.0, uDiskScale * uProjectionScale * radius / max(-view.z, 0.001));
}
