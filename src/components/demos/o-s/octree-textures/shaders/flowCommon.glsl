// Shared by both simulation passes. One texel = one octree leaf (the density map of 37.4).
uniform highp sampler2DArray uLeafTable;
uniform int uTableWidth;
uniform vec3 uGravity;
uniform float uGravityStrength;
uniform float uPressure;
uniform float uStick;
uniform float uFlow;

#define NEIGHBOUR_COUNT 26
#define POSITION_LAYER 7
#define NORMAL_LAYER 8

ivec2 leafTexel(int index) {
  return ivec2(index % uTableWidth, index / uTableWidth);
}

// Same order as neighbourOffset() in leafTables.js.
vec3 neighbourOffset(int k) {
  int n = k < 13 ? k : k + 1;
  return vec3(n % 3 - 1, (n / 3) % 3 - 1, n / 9 - 1);
}

int neighbourIndex(ivec2 texel, int k) {
  return int(texelFetch(uLeafTable, ivec3(texel, k / 4), 0)[k % 4]);
}

vec3 leafNormal(ivec2 texel) {
  return texelFetch(uLeafTable, ivec3(texel, NORMAL_LAYER), 0).xyz;
}

// Liquid above the sticking film moves toward a neighbour when gravity, projected on the surface
// at the source leaf, points that way, or when the neighbour holds less liquid (pressure).
float transferAmount(float sourceHeight, vec3 sourceNormal, vec3 offset, float targetHeight) {
  float offsetLength = length(offset);
  vec3 slope = uGravity - dot(uGravity, sourceNormal) * sourceNormal;
  float drive = uGravityStrength * dot(slope, offset / offsetLength) + uPressure * (sourceHeight - targetHeight);
  return uFlow * max(sourceHeight - uStick, 0.0) * max(drive, 0.0) / offsetLength;
}
