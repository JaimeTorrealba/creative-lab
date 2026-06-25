varying vec3 vViewDir;
varying vec2 vUv;

void main(){
  vUv = uv;
  vViewDir = position - ((inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
