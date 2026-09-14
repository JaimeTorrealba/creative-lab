in vec3 vWorldPos;
in vec3 vNormal;
in vec3 vDu;
in vec3 vDv;
in vec2 vUv;
in float vLevel;
in float vHeight;

uniform sampler2D uSurface;
uniform float uDisplacementScale;
uniform float uMaxLevel;
uniform float uNormalMapping;
uniform int uDebugMode;
uniform vec3 uLightDir;
uniform vec3 uBaseColor;
uniform vec3 uWireColor;

out vec4 fragColor;

vec3 levelColor(float t) {
  vec3 c = mix(vec3(0.16, 0.28, 0.85), vec3(0.15, 0.80, 0.78), smoothstep(0.0, 0.34, t));
  c = mix(c, vec3(0.95, 0.80, 0.20), smoothstep(0.34, 0.67, t));
  return mix(c, vec3(0.93, 0.22, 0.16), smoothstep(0.67, 1.0, t));
}

void main() {
  vec3 n = normalize(vNormal);

  // Shading normal rebuilt from the displacement gradient (7.2.2). The displaced surface
  // derivatives are the undisplaced ones plus the height slope along the normal; doing it here
  // rather than on the vertices is what keeps the shading steady when a patch changes level.
  if (uNormalMapping > 0.5) {
    vec2 grad = texture(uSurface, vUv).rg * uDisplacementScale;
    n = normalize(cross(vDv + n * grad.y, vDu + n * grad.x));
  }

  if (uDebugMode == 4) {
    fragColor = vec4(uWireColor, 1.0);
    return;
  }
  if (uDebugMode == 2) {
    fragColor = vec4(n * 0.5 + 0.5, 1.0);
    return;
  }
  if (uDebugMode == 3) {
    fragColor = vec4(levelColor(vHeight), 1.0);
    return;
  }

  vec3 l = normalize(uLightDir);
  vec3 v = normalize(cameraPosition - vWorldPos);
  vec3 h = normalize(l + v);
  float diffuse = max(dot(n, l), 0.0);
  float specular = pow(max(dot(n, h), 0.0), 42.0) * 0.4;
  float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0) * 0.2;

  vec3 base = uDebugMode == 1 ? levelColor(vLevel / max(uMaxLevel, 1.0)) : uBaseColor;
  fragColor = vec4(base * (0.16 + 0.9 * diffuse) + vec3(specular + rim), 1.0);
}
