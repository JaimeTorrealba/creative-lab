varying vec2 vUv;
varying vec3 vNormal;

void main() {
    // add directional light effect
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.75));
    float lightIntensity = max(dot(normalize(vNormal), lightDir), 0.0);
    vec3 baseColor = vec3(0.6, 0.6, 0.6);
    vec3 color = baseColor * lightIntensity;
    gl_FragColor = vec4(color, 1.0);
}