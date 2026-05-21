uniform float uTime;
varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vNormal;
uniform float aRandom;

#include <instanced_pars_vertex>
#include <color_pars_vertex>

void main() {
  #include <color_vertex>
  #include <instanced_vertex>
  vec4 modelPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
  modelPosition.y += aRandom * sin(uTime + 15.*aRandom) * 0.4;
  modelPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * modelPosition;
  vUv = uv;
  vViewPosition = -modelPosition.xyz;
  // normal
  vNormal = normalMatrix * mat3(instanceMatrix) * normal;
}
