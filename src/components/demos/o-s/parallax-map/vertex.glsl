attribute vec4 tangent;

uniform vec3 uLightPos;

varying vec2 vUv;
varying vec3 vViewDir;
varying vec3 vTanLightVec;

void main() {
    vUv = uv;

    // Tangent frame straight from the geometry rather than assumed from the plane's
    // orientation. computeTangents() puts the handedness in tangent.w.
    mat3 model = mat3(modelMatrix);
    vec3 N = normalize(model * normal);
    vec3 T = normalize(model * tangent.xyz);
    vec3 B = normalize(cross(N, T) * tangent.w);

    vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;

    // Tangent space, which is what makes viewDir.xy a real uv offset and viewDir.z the N dot V
    // the fragment shaders use to pick their step counts.
    vec3 eyeVec = cameraPosition - worldPos;
    vViewDir = vec3(dot(T, eyeVec), dot(B, eyeVec), dot(N, eyeVec));

    vec3 lightVec = uLightPos - worldPos;
    vTanLightVec = vec3(dot(T, lightVec), dot(B, lightVec), dot(N, lightVec));

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
