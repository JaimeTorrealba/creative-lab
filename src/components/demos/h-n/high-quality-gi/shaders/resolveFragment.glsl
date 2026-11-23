uniform sampler2D uHistory;

void main() {
  gl_FragColor = vec4(resolveIrradiance(texelFetch(uHistory, ivec2(gl_FragCoord.xy), 0)), 1.0);
}
