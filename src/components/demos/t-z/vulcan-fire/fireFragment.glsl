precision highp sampler3D;

uniform sampler3D uFireVolume;
uniform vec3 uColorLow;
uniform vec3 uColorMid;
uniform vec3 uColorHigh;
uniform float uIntensity;

in vec2 vUv;
in float vLife;
in float vFrame;
in float vOpacity;

out vec4 fragColor;

void main() {
  // z coordinate plays the animation; wrapR = REPEAT loops it seamlessly
  float heat = texture(uFireVolume, vec3(vUv, vFrame)).r;
  heat *= smoothstep(0.0, 0.15, vLife);
  heat *= 1.0 - smoothstep(0.55, 1.0, vLife);

  vec3 col = mix(uColorLow, uColorMid, smoothstep(0.15, 0.55, heat));
  col = mix(col, uColorHigh, smoothstep(0.55, 0.9, heat));

  float alpha = heat * vOpacity;
  if (alpha < 0.01) discard;
  fragColor = vec4(col * uIntensity, alpha);
}
