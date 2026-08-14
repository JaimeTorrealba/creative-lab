precision highp sampler3D;

uniform sampler2D uDiffuseMap;
uniform sampler2D uNormalMap;
uniform sampler3D uDistanceMap;
uniform vec3 uNormalizationFactor;
uniform int uIterations;

in vec3 vTexCoord;
in vec3 vTanEyeVec;
in vec3 vTanLightVec;

out vec4 fragColor;

// Per-pixel displacement with distance functions (GPU Gems 2, chapter 8). No search and no
// binary refinement: each distance-map read says how far the ray can travel before it can
// possibly hit the surface, so the stride adapts on its own — long through empty space,
// short near the surface. Solid voxels store 0, which is what brings the ray to a stop.
void main() {
    // Normalized against a distance expressed in pixels, hence the factor.
    vec3 offset = normalize(vTanEyeVec) * uNormalizationFactor;

    vec3 texCoord = vTexCoord;
    for (int i = 0; i < uIterations; i++) {
        float dist = texture(uDistanceMap, texCoord).r;
        texCoord += dist * offset;
    }

    // Derivatives of the unperturbed coordinates: the displaced ones are discontinuous and
    // would pick the wrong mip along those seams.
    vec2 dx = dFdx(vTexCoord.xy);
    vec2 dy = dFdy(vTexCoord.xy);

    vec3 tanNormal = normalize(2.0 * textureGrad(uNormalMap, texCoord.xy, dx, dy).rgb - 1.0);
    float diffuse = max(dot(tanNormal, normalize(vTanLightVec)), 0.0);

    vec3 albedo = textureGrad(uDiffuseMap, texCoord.xy, dx, dy).rgb;
    fragColor = vec4(albedo * (0.2 + 0.8 * diffuse), 1.0);

    // The tonemapping_fragment and colorspace_fragment chunks the other four include write
    // through gl_FragColor, which a GLSL3 shader does not have. These are the same two calls
    // those chunks make; linearToOutputTexel is injected into every fragment shader.
    #if defined( TONE_MAPPING )
        fragColor.rgb = toneMapping(fragColor.rgb);
    #endif
    fragColor = linearToOutputTexel(fragColor);
}
