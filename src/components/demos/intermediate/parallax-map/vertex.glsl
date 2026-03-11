varying vec2 vUv;
varying vec3 vViewDir;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vNormal;

  // you might need tangent space basis if you want to use normal map etc.

void main() {
    vUv = uv;

    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    // view direction in tangent / view / whatever space
    vViewDir = normalize(cameraPosition - worldPos.xyz);

    vNormal = normalize(normalMatrix * normal);

    // if you have tangent + bitangent pass them too
    // vTangent, vBitangent...

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}