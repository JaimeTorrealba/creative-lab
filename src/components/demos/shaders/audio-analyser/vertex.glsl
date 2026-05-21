varying vec2 vUv;

uniform float uTime;
uniform float uFrequency;

#include '../../../../shaders/SHARED/noise3D.glsl;

void main() {
    float noise = 2.5 * snoise(position + uTime);
    float displacement = (uFrequency / 30.0) * (noise / 10.0);
    vec3 newPosition = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    vUv = uv;
}