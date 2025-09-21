precision mediump float;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
uniform float uTime;
uniform vec2 uHover;
uniform vec2 uResolution;

void main() {
  vec2 uv = (gl_FragCoord.xy * 2. - uResolution.xy) / uResolution.xy;
  vec2 q = gl_FragCoord.xy / uResolution.xy;
  vec2 p = -1.0 + 2.0 * q;
  p.x *= uResolution.y / uResolution.x;

  float r = sqrt(dot(p, p));
  float a = atan(p.y, p.x);
  float d = 0.0;

  if(r < 0.8) {
    d = length(uv);
    d = sin(d * 8.) / 8.;
    d = abs(d);
    d = smoothstep(0.04, 0.05, d);
  }
  
  vec3 col = vec3(0.77 * d, 0.72 * d, 0.81 * d);

  gl_FragColor = vec4(col, 1.0);
}