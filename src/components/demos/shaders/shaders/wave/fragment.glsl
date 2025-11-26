  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uOrigin;
  uniform float uFrequency;
  uniform float uSpeed;
  uniform float uFadeStart;
  uniform float uFadeEnd;

  varying vec2 vUv;
    void main() {
      vec2 uv = vUv;
      uv -= 0.5;
      uv.x *= uResolution.x / uResolution.y;
      uv += 0.5;
      
      float dist = distance(uv, uOrigin);
      float wave = fract(dist * uFrequency - uTime * uSpeed);
      wave *= 1. - smoothstep(uFadeStart, uFadeEnd, dist);
      wave *= 1. - step(uTime * uSpeed, dist * uFrequency);
      gl_FragColor = vec4(vec3(wave), 1.0);
    }