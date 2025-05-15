varying vec3 vColour;
varying vec4 vGrassData;

float inverseLerp(float v, float minValue, float maxValue) {
  return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
  float t = inverseLerp(v, inMin, inMax);
  return mix(outMin, outMax, t);
}

float hash(vec2 p)  // replace this by something better
{
  p = 50.0 * fract(p * 0.3183099 + vec2(0.71, 0.113));
  return -1.0 + 2.0 * fract(p.x * p.y * (p.x + p.y));
}

void main() {
  float grassX = vGrassData.x;
   vec3 baseColour = mix(
       vColour * 0.75, vColour, smoothstep(0.125, 0.0, abs(grassX)));
  vec3 colour = baseColour;
  gl_FragColor = vec4(colour, 1.0);
}