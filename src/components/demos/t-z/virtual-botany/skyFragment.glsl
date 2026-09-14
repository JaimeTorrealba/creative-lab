uniform vec3 uHorizonColor;
uniform vec3 uZenithColor;
uniform vec3 uSunColor;
uniform vec3 uSunDir;
uniform float uSunIntensity;

varying vec3 vViewDir;

void main() {
  vec3 dir = normalize(vViewDir);

  float h = smoothstep(-0.05, 0.55, dir.y);
  vec3 col = mix(uHorizonColor, uZenithColor, h);

  // stands in for the paper's alpha glow channel: the tight lobe pushes the sky well
  // past 1.0 around the sun so bloom halos it, the wide lobe just warms the surround
  float d = max(dot(dir, uSunDir), 0.0);
  col += uSunColor * (pow(d, 8.0) * uSunIntensity + pow(d, 2.0) * 0.35);

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
