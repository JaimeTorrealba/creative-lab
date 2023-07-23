precision mediump float;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
uniform float uTime;
uniform vec2 uHover;
uniform vec2 uResolution;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;

    // Time varying pixel color
  vec3 col = 0.5 + 0.5 * cos(uTime + uv.xyx + vec3(0, 2, 4));

  gl_FragColor = vec4(vec3(col), 1.0);
}