// Item buffer: polygon id (+1, so 0 means empty) and distance to the shooter. Depth is written
// from the exact distance, the z projected apart from the curved xy.
uniform float uFar;

in vec3 vLocal;
flat in float vPolygonId;

layout(location = 0) out vec4 outItem;

void main() {
  float range = length(vLocal);
  if (vLocal.z <= range * 1e-4) discard;
  outItem = vec4(vPolygonId + 1.0, range, 0.0, 1.0);
  gl_FragDepth = range / uFar;
}
