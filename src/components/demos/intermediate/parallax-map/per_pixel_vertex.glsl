in vec4 tangent;

uniform float uInvBumpDepth;
uniform vec3 uLightPos;

out vec3 vTexCoord;
out vec3 vTanEyeVec;
out vec3 vTanLightVec;

void main() {
    // The ray enters at the top of the volume and marches down toward z = 0.
    vTexCoord = vec3(uv, 1.0);

    // Tangent frame straight from the geometry rather than assumed from the plane's
    // orientation. computeTangents() puts the handedness in tangent.w.
    mat3 model = mat3(modelMatrix);
    vec3 N = normalize(model * normal);
    vec3 T = normalize(model * tangent.xyz);
    vec3 B = normalize(cross(N, T) * tangent.w);

    vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;

    // View vector into tangent space, with the slope scaled by the bump depth. The chapter
    // adds the offset to the texture coordinate, so this has to point from the eye into the
    // surface, not toward the eye — its Cg tangent frame differs in handedness from this
    // one. The other four shaders march along -viewDir for the same reason.
    vec3 viewVec = worldPos - cameraPosition;
    vTanEyeVec = vec3(dot(T, viewVec), dot(B, viewVec), uInvBumpDepth * dot(N, viewVec));

    vec3 lightVec = uLightPos - worldPos;
    vTanLightVec = vec3(dot(T, lightVec), dot(B, lightVec), dot(N, lightVec));

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
