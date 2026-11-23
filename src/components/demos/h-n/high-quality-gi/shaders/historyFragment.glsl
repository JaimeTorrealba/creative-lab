uniform sampler2D uPrevious;
uniform sampler2D uFrame;
uniform float uDecay;

void main() {
  ivec2 texel = ivec2(gl_FragCoord.xy);
  gl_FragColor = texelFetch(uPrevious, texel, 0) * uDecay + texelFetch(uFrame, texel, 0);
}
