  uniform float uTime;
  uniform vec2 uOrigin;
  uniform sampler2D uTexture;
  varying vec2 vUv;

    void main() {
      float dist = distance(vUv, uOrigin.xx + vec2(0.03));
      float wave = fract(dist - uTime * 0.75);
      wave *= 1. - smoothstep(1.,3.,dist * 25.);
      wave *= 1. - step(uTime, dist);
      gl_FragColor = texture2D(uTexture, vUv);
      gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.9, 0.9, 1.0), wave * 0.75);
    }