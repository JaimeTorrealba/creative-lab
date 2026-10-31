uniform sampler2D uPositionTexture;
uniform float uParticleSize;

varying vec2 vUv;

void main() {
  vUv = uv;

  vec3 simulatedPosition = texture2D(uPositionTexture, uv).xyz;
  vec4 mvPosition = modelViewMatrix * vec4(simulatedPosition, 1.0);

  gl_PointSize = uParticleSize / -mvPosition.z;
  gl_Position = projectionMatrix * mvPosition;
}
