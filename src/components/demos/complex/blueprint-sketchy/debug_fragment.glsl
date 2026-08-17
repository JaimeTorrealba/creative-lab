uniform sampler2D uEdge;
uniform sampler2D uShade;
uniform sampler2D uGBuffer;
uniform float uMode;

varying vec2 vUv;

// Shows the intermediate buffers the two composites are built from: the accumulated
// edge map, the shade map, and the normal / linear-depth halves of the G-buffer.
void main() {
  vec3 color;

  if (uMode < 1.5) {
    color = vec3(texture2D(uEdge, vUv).r);
  } else if (uMode < 2.5) {
    color = texture2D(uShade, vUv).rgb;
  } else if (uMode < 3.5) {
    vec4 gbuffer = texture2D(uGBuffer, vUv);
    color = gbuffer.a > 0.0 ? gbuffer.rgb : vec3(0.08);
  } else {
    color = vec3(texture2D(uGBuffer, vUv).a);
  }

  gl_FragColor = vec4(color, 1.0);

  #include <colorspace_fragment>
}
