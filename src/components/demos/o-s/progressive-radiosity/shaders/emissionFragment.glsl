layout(location = 0) out vec4 outRadiosity;
layout(location = 1) out vec4 outResidual;

in vec3 vEmission;

void main() {
  outRadiosity = vec4(vEmission, 1.0);
  outResidual = vec4(vEmission, 0.0);
}
