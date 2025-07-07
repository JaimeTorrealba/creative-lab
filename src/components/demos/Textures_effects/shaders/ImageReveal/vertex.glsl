uniform float uProgress;
varying vec2 vUv;
void main() {
  vec3 newPosition = position;

  // Calculate the distance to the center of our plane
  float distanceToCenter = distance(vec2(0.5), uv);

  // Wave effect
  float wave = (1.0 - uProgress) * sin(distanceToCenter * 20.0 - uProgress * 5.0);

  // Apply the wave effect to the position Z
  newPosition.z += wave;

  // FINAL POSITION
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

  // VARYINGS
    vUv = uv;
}