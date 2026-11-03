#include <common>
#include <skinning_pars_vertex>
#include '../../../shaders/SHARED/noise3D.glsl';

uniform float uTime;
uniform float uIntensity;
uniform float uHeight;
uniform float uInflate;
uniform float uTongueScale;
uniform float uTongueSpeed;
uniform float uTongueVariation;

varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying float vMask;

void main() {
  #include <beginnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <begin_vertex>
  #include <skinning_vertex>

  vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
  vec3 worldNormal = normalize(mat3(modelMatrix) * objectNormal);

  // Up-facing vertices get pushed up, side/down-facing ones stay put, so the triangles
  // between them stretch into vertical sheets: those sheets are the flames.
  float mask = clamp(worldNormal.y, 0.0, 1.0);

  float tongueNoise = snoise(vec3(worldPosition.xz * uTongueScale, uTime * uTongueSpeed));
  float tongue = mix(1.0, tongueNoise * 0.5 + 0.5, uTongueVariation);

  worldPosition.xyz += worldNormal * uInflate;
  worldPosition.y += mask * uHeight * tongue * uIntensity;

  vWorldPosition = worldPosition.xyz;
  vWorldNormal = worldNormal;
  vMask = mask;

  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
