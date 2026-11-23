// Shared by the depth-layer pass and the camera G-buffer: both need world position, normal,
// albedo and the first-pass irradiance interpolated from the vertex the point belongs to.
attribute vec3 albedo;
attribute float emission;
attribute vec2 pointUv;

uniform sampler2D uVertexIrradiance;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vAlbedo;
varying vec3 vFirstPass;
varying float vEmission;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vAlbedo = albedo;
  vEmission = emission;
  vFirstPass = texture(uVertexIrradiance, pointUv).rgb;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
