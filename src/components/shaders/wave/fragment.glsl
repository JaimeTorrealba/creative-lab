  uniform float uProgress;
  uniform vec2 uOrigin;
  varying vec2 vUv;
    void main() {
      vec2 origin = vec2(0.5);
      float dist = distance(vUv, uOrigin);
      float wave = fract(dist - uProgress);
      wave *= 1. - smoothstep(1.,2.,dist);
      wave *= 1. - step(uProgress, dist);
      gl_FragColor = vec4(vec3(wave), 1.0);
    }