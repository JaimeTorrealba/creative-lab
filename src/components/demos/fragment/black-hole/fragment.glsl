precision highp float;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_mass;
uniform float u_time;
uniform float u_clickedTime;

varying vec2 vUv;

vec2 screenToUv(vec2 pos) {
  return vec2(pos.x / u_resolution.x, pos.y / u_resolution.y);
}

void main() {
  // Base UV and target center from mouse
  vec2 uv = vUv;
  vec2 center = screenToUv(u_mouse);

  // Direction from center and distance
  vec2 dir = uv - center;
  float dist = length(dir);

  // Gravitational lensing strength (mass scaled by distance)
  float lens = u_mass / (dist + 0.0005);

  // Swirl amount grows while mouse is pressed
  float swirl = u_clickedTime * 0.15;

  // Add a subtle time-based ripple
  float ripple = 0.02 * sin(10.0 * dist - (u_time * 1.5));

  // Rotate direction (swirl) that weakens with distance
  float angle = swirl / (1.0 + dist * 8.0);
  float s = sin(angle);
  float c = cos(angle);
  vec2 rotated = vec2(c * dir.x - s * dir.y, s * dir.x + c * dir.y);

  // Displacement toward/around center
  vec2 offset = normalize(rotated) * (lens  + ripple);

  vec2 uv2 = uv + offset;
  uv2 = clamp(uv2, vec2(0.0), vec2(1.0));

  vec4 color = texture2D(u_texture, uv2);

  // Simple vignette for aesthetics
  float vignette = smoothstep(0.9, 0.4, dist);
  color.rgb *= vignette;

  gl_FragColor = color;
}
