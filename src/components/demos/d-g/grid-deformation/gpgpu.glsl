uniform vec2 uMouse;
uniform vec2 uDeltaMouse;
uniform float uMouseMove;
uniform float uGridSize;
uniform float uRelaxation;
uniform float uDistance;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 cell = texture(uGrid, uv);

  float falloff = 1.0 - smoothstep(0.0, uDistance / uGridSize, distance(uv, uMouse));

  cell.rg += uDeltaMouse * falloff;
  cell.rg *= min(uRelaxation, uMouseMove);

  gl_FragColor = cell;
}
