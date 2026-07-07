uniform sampler2D uSmokeTex;
uniform vec3 uSmokeColor;
uniform float uSmokeOpacity;

in vec2 vUv;
in float vLife;
in float vFrame;
in float vOpacity;

out vec4 fragColor;

void main() {
  vec4 tex = texture(uSmokeTex, vUv);
  float shape = tex.a * tex.r;

  // young puffs are lit by the fire below
  vec3 warm = uSmokeColor + vec3(0.35, 0.12, 0.0);
  vec3 col = mix(warm, uSmokeColor, smoothstep(0.0, 0.3, vLife));

  float alpha = shape * vOpacity * uSmokeOpacity;
  alpha *= smoothstep(0.0, 0.15, vLife);
  alpha *= 1.0 - smoothstep(0.5, 1.0, vLife);
  if (alpha < 0.01) discard;
  fragColor = vec4(col, alpha);
}
