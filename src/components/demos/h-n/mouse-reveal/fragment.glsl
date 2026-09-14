  varying vec2 vUv;
  uniform vec2 hover;

    void main(){
      vec2 newVuv = vec2(vUv.x, vUv.y / 2.);
      vec2 newHover = vec2(hover.x, hover.y / 2.);
      float strength = distance(newVuv, newHover) * 10.;
      gl_FragColor = vec4(0., 0., 0., strength);
    }