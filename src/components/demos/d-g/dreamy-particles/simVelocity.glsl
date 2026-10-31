uniform sampler2D uOriginalPosition;
uniform vec3 uMouse;
uniform float uMouseSpeed;
uniform float uMouseRadius;
uniform float uMouseStrength;
uniform float uForce;
uniform float uAttraction;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec3 position = texture2D(uCurrentPosition, uv).xyz;
  vec3 original = texture2D(uOriginalPosition, uv).xyz;
  vec3 velocity = texture2D(uCurrentVelocity, uv).xyz;

  velocity *= uForce;

  vec3 toOriginal = original - position;
  float originalDistance = length(toOriginal);
  if (originalDistance > 0.001) {
    velocity += normalize(toOriginal) * originalDistance * uAttraction;
  }

  float mouseDistance = distance(position, uMouse);
  if (mouseDistance < uMouseRadius) {
    vec3 pushDirection = normalize(position - uMouse);
    velocity += pushDirection * (1.0 - mouseDistance / uMouseRadius) * uMouseStrength * uMouseSpeed;
  }

  gl_FragColor = vec4(velocity, 1.0);
}
