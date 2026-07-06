varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;

#include <common>
#include <skinning_pars_vertex>

void main() {
  vUv = uv;
  #include <skinbase_vertex>
  #include <beginnormal_vertex>
  #include <skinnormal_vertex>
  #include <begin_vertex>
  #include <skinning_vertex>

  vec4 worldPos = modelMatrix * vec4(transformed, 1.0);
  vWorldPos = worldPos.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * objectNormal);
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
