// Draws a polygon over its own tile of the atlas: one fragment per radiosity texel, carrying the
// texel's world position and normal.
in vec2 atlasCoord;
in vec3 albedo;
in vec3 emission;
in float polygonId;

out vec3 vWorldPosition;
out vec3 vNormal;
out vec3 vAlbedo;
out vec3 vEmission;
flat out float vPolygonId;

void main() {
  vWorldPosition = position;
  vNormal = normal;
  vAlbedo = albedo;
  vEmission = emission;
  vPolygonId = polygonId;
  gl_Position = vec4(atlasCoord, 0.0, 1.0);
}
