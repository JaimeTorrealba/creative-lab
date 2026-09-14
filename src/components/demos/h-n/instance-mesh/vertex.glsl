uniform float uTime;
varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vNormal;
attribute float aRandom;
void main() {
  vec4 modelPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
  // modelPosition.y += aRandom * sin(uTime + modelPosition.z * 10.0) * 0.1;
  modelPosition.y += aRandom * sin(uTime + 15.*aRandom) * 0.4;
  modelPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * modelPosition;
  vUv = uv;
  vViewPosition = -modelPosition.xyz;
  // normal
  vNormal = normalMatrix * mat3(instanceMatrix) * normal;
}
