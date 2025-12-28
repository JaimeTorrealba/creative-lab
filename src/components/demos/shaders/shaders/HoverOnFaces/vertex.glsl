uniform vec2 mousePos;
uniform float hoverRadius;
uniform float hoverStrength;
varying vec2 vUv;
varying vec3 vNormal;


void main() {
    vec3 newPos = position;
    float dist = distance(uv, mousePos);
    float influence = 1.0 - smoothstep(0.0, hoverRadius, dist);
    newPos *= (1.0 + hoverStrength * influence);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    vUv = uv;
    vNormal = normal;
}