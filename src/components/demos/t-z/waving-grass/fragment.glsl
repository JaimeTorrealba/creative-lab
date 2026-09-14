uniform sampler2D uMap;
uniform float uAlphaCut;
uniform vec3 uSunColor;
uniform vec3 uAmbientColor;
uniform float uFadeStart;
uniform float uFadeEnd;

varying vec2 vUv;
varying float vSway;
varying float vDist;

void main() {
  vec4 tex = texture2D(uMap, vUv);

  // alpha testing instead of blending: no sorting needed, depth writes stay on
  float fade = smoothstep(uFadeStart, uFadeEnd, vDist);
  if (tex.a * (1.0 - fade) < uAlphaCut) discard;

  // darker towards the roots, leaning blades catch a bit more sun
  float light = mix(0.55, 1.0, vUv.y);
  vec3 color = tex.rgb * (uAmbientColor + uSunColor * light);
  color *= 1.0 + 0.25 * vSway;

  gl_FragColor = vec4(color, 1.0);
}
