uniform float uSize;
uniform float uProgress;
varying vec2 vTextCoods;
attribute vec3 initPos;

void main() {
  #include <begin_vertex>

  transformed = initPos + ((position - initPos) * uProgress);

  #include <project_vertex>

  gl_PointSize = uSize;
  vTextCoods = position.xy;
}