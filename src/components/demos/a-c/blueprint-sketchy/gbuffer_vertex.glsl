varying vec3 vViewNormal;
varying float vViewDepth;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  vViewNormal = normalMatrix * normal;
  vViewDepth = -mvPosition.z;

  gl_Position = projectionMatrix * mvPosition;
}
