void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec3 position = texture2D(uCurrentPosition, uv).xyz;
  vec3 velocity = texture2D(uCurrentVelocity, uv).xyz;

  gl_FragColor = vec4(position + velocity, 1.0);
}
