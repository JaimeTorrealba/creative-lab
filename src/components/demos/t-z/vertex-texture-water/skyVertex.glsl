out vec3 vViewDir;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);

  // direction from the eye, not from the dome centre, so the sky reads as infinitely distant
  // instead of sliding around as the camera orbits inside the sphere
  vViewDir = worldPos.xyz - cameraPosition;

  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
