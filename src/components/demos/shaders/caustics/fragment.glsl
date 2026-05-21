uniform float uTime;
uniform sampler2D uTexture;
uniform vec3 uColor;

varying vec2 vUv;

#include '../../../../shaders/SHARED/noise3D.glsl;
void main() {
  vec4 texColor = texture2D(uTexture, vUv);

  float clausticsSpeed = 1.0;
  float clausticsScale = 10.0;
  float clausticsOffset = 0.75;
  float intensity = 0.3;
  float thickness = 0.4;

  float t = clausticsSpeed * uTime;
  float noise = abs(snoise(vec3(vUv.xy * clausticsScale, t)));
  float noise2 = abs(snoise(vec3(vUv.yx * clausticsScale, -t)));
  float caustics = clausticsOffset - (noise + noise2) / 2.0;
  caustics = smoothstep(0.5 - thickness, 0.5 + thickness, caustics);
  caustics = clamp(intensity * caustics, 0.0, 1.0);

  vec3 color = texColor.rgb + caustics * uColor;
  gl_FragColor = vec4(color, 1.0);
}