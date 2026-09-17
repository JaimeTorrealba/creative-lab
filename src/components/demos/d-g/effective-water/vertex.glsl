#include "./gerstner.glsl"

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vElevation;

void main() {
  vec3 tangent;
  vec3 binormal;
  vec3 displaced = gerstnerSum(position, tangent, binormal);

  vec3 localNormal = normalize(cross(tangent, binormal));
  vNormal = normalize((modelMatrix * vec4(localNormal, 0.0)).xyz);
  vElevation = displaced.z;

  vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
