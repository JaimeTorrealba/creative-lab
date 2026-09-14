uniform sampler2D uMatCap;
varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vNormal;
void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  vec3 x = normalize(vec3(viewDir.z, 0.0, -viewDir.x));
  vec3 y = cross(viewDir, x);
  vec2 uv = vec2(dot(x, normal), dot(y, normal)) * 0.495 + 0.5;
  vec4 matcapColor = texture2D(uMatCap,uv);
  // gl_FragColor = vec4(vNormal, 1);
  gl_FragColor = matcapColor;
}
