// 37.3 "Converting to a standard 2D texture": the triangles are drawn at their (u,v) instead of
// their (x,y,z), and each fragment looks the octree up with its 3D position.
varying vec3 vObjectPosition;

void main() {
  vObjectPosition = position;
  gl_Position = vec4(uv * 2.0 - 1.0, 0.0, 1.0);
}
