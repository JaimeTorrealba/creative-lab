// Mean residual of every shooting block: the block-sized level of the residual mipmap.
uniform sampler2D uResidual;
uniform int uBlock;

void main() {
  ivec2 base = ivec2(gl_FragCoord.xy) * uBlock;
  vec3 sum = vec3(0.0);
  for (int y = 0; y < 8; y++) {
    if (y >= uBlock) break;
    for (int x = 0; x < 8; x++) {
      if (x >= uBlock) break;
      sum += texelFetch(uResidual, base + ivec2(x, y), 0).rgb;
    }
  }
  gl_FragColor = vec4(sum / float(uBlock * uBlock), 1.0);
}
