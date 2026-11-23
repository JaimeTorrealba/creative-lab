// Visible points for the final gather (38.5.2): position, normal, colour, plus the first-pass
// solution so the composite can show the rough pass on its own.
layout(location = 0) out vec4 gPosition;
layout(location = 1) out vec4 gNormal;
layout(location = 2) out vec4 gAlbedo;
layout(location = 3) out vec4 gFirstPass;

in vec3 vWorldPosition;
in vec3 vNormal;
in vec3 vAlbedo;
in vec3 vFirstPass;
in float vEmission;

void main() {
  vec3 normal = normalize(vNormal);
  gPosition = vec4(vWorldPosition, 1.0);
  gNormal = vec4(normal, vEmission);
  gAlbedo = vec4(vAlbedo, 1.0);
  gFirstPass = vec4(vFirstPass, 1.0);
}
