in float vAccess;

out vec4 fragColor;

void main() {
  vec2 offset = gl_PointCoord - 0.5;
  if (dot(offset, offset) > 0.25) discard;

  fragColor = vec4(vec3(clamp(vAccess, 0.0, 1.0)), 1.0);
}
