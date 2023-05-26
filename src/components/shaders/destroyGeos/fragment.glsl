
  uniform float uProgress;
    void main() {
      gl_FragColor = vec4(0.3,0.3,0.3, 1.0 - uProgress);
    }