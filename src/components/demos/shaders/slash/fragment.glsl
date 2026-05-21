uniform float uAppear;
uniform float uDisappear;
uniform float uTime;

varying vec2 vUv;

#include '../../../../shaders/SHARED/noise3D.glsl';

void main() {
    vec2 uv = vUv;

    // red color
    vec3 red = vec3(0.9, 0.0, 0.0);
    // yellow color
    vec3 yellow = vec3(0.9, 0.5, 0.0);
    vec3 color = mix(yellow, red, pow(uv.y, 4.0));

    // float strength = mod(vUv.y * 10.0, 1.0);
    // strength = smoothstep(0.5, 0.6, strength);

    // Add noise pattern to color
    float noise = snoise(vec3(uv * 5.0, uTime)) * 0.5 + 0.5;
    color = mix(color, vec3(noise), 0.3); // Blend noise with original color

    float alpha = 1.0;
    alpha *= smoothstep(0.5, 0.56, vUv.y);
    alpha *= smoothstep(1.0 - uAppear, 1.0 - uAppear + 0.01, vUv.x);
    alpha *= uDisappear;

    gl_FragColor = vec4(color, alpha);
}