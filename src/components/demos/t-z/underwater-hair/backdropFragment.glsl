uniform vec3 uWaterColor;
uniform vec3 uDeepColor;
uniform vec3 uLightColor;
uniform float uShaftIntensity;
uniform float uCausticIntensity;
uniform float uCausticSpeed;
uniform float uTime;

varying vec3 vLocalPos;

void main() {
  vec3 dir = normalize(vLocalPos);
  float h = dir.y;
  float t = uTime * uCausticSpeed;

  vec3 color = mix(uDeepColor, uWaterColor, smoothstep(-0.65, 0.85, h));

  // Light shafts: angular bands fanning down from the surface, three frequencies drifting
  // against each other so they never resolve into a repeating pattern.
  float angle = atan(dir.z, dir.x);
  float bands = sin(angle * 7.0 + t * 0.6);
  bands += 0.6 * sin(angle * 13.0 - t * 0.9);
  bands += 0.4 * sin(angle * 23.0 + t * 1.4);
  bands = pow(clamp(bands * 0.25 + 0.5, 0.0, 1.0), 3.0);
  float shaft = bands * smoothstep(-0.1, 0.9, h) * uShaftIntensity;

  // Shimmer on the underside of the surface, directly overhead.
  vec2 q = dir.xz / max(h, 0.15) * 2.0;
  float shimmer = sin(q.x * 3.0 + t) * sin(q.y * 3.0 - t * 1.3);
  shimmer = pow(clamp(shimmer * 0.5 + 0.5, 0.0, 1.0), 4.0);
  shimmer *= smoothstep(0.35, 1.0, h) * uCausticIntensity;

  color += uLightColor * (shaft + shimmer);

  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
