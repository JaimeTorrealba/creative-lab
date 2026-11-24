// Octree texture lookup of GPU Gems 2 ch. 37 (Example 37-1).
uniform highp sampler3D uOctreePool;
uniform int uOctreeDepth;
uniform float uOctreeScale;
uniform vec3 uOctreeOffset;

#define OCTREE_MAX_DEPTH 12

vec3 toOctreeSpace(vec3 objectPosition) {
  return objectPosition * uOctreeScale + uOctreeOffset;
}

// Walks the indirection grids from the root at (0,0,0). At depth d the point's cell inside the
// current grid is floor(2 * frac(M * 2^d)); texelFetch replaces the normalised coordinates and
// the 1/S scale of the listing. Alpha flags: > 0.9 data, < 0.1 empty, otherwise a child grid.
vec4 octreeLookup(vec3 M) {
  if (any(lessThan(M, vec3(0.0))) || any(greaterThanEqual(M, vec3(1.0)))) return vec4(0.0);
  ivec3 grid = ivec3(0);
  vec3 MND = M;
  for (int depth = 0; depth < OCTREE_MAX_DEPTH; depth++) {
    if (depth >= uOctreeDepth) break;
    ivec3 cell = ivec3(floor(fract(MND) * 2.0));
    vec4 I = texelFetch(uOctreePool, grid * 2 + cell, 0);
    if (I.a > 0.9) return I;
    if (I.a < 0.1) return vec4(0.0);
    grid = ivec3(floor(0.5 + I.rgb * 255.0));
    MND *= 2.0;
  }
  return vec4(0.0);
}

// 37.3 "Linear interpolation": the 8 leaf centres around M and their trilinear weights. The
// caller looks each one up and drops the empty ones.
vec3 octreeCornerPoint(vec3 M, int corner, out float weight) {
  float resolution = exp2(float(uOctreeDepth));
  vec3 p = M * resolution - 0.5;
  vec3 base = floor(p);
  vec3 f = p - base;
  vec3 o = vec3(corner & 1, (corner >> 1) & 1, corner >> 2);
  vec3 w = mix(1.0 - f, f, o);
  weight = w.x * w.y * w.z;
  return (base + o + 0.5) / resolution;
}
