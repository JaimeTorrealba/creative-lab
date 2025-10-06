uniform sampler2D uDiffuseMap;
uniform sampler2D uNormalMap;
uniform sampler2D uHeightMap;
uniform float uHeightScale;
uniform vec3 uViewPos; // (not used directly but kept for consistency)

varying vec2 vUv;
varying vec3 vViewDir; // view dir in whatever space vertex provided
varying vec3 vNormal;

// Parallax Occlusion Mapping (layered + small binary refinement)
vec2 parallaxOcclusion(vec2 uv, vec3 viewDir) {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(viewDir);
    float ndotv = max(dot(N, V), 0.0);
    float numLayers = mix(16.0, 48.0, 1.0 - ndotv); // more layers at grazing angles
    float layerDepth = 1.0 / numLayers;
    float currentLayerDepth = 0.0;

    vec2 P = V.xy * uHeightScale;      // total UV shift
    vec2 deltaUV = P / numLayers;      // per-layer shift

    vec2 uvCurr = uv;
    float height = texture2D(uHeightMap, uvCurr).r;

    // Coarse search
    while(currentLayerDepth < height && currentLayerDepth < 1.0) {
        uvCurr -= deltaUV;
        currentLayerDepth += layerDepth;
        height = texture2D(uHeightMap, uvCurr).r;
    }

    // Previous UV before overshoot
    vec2 uvPrev = uvCurr + deltaUV;

    // Binary refinement (fixed small iteration count)
    vec2 a = uvPrev;
    vec2 b = uvCurr;
    float depthA = currentLayerDepth - layerDepth; // depth at a
    for(int i = 0; i < 5; i++) {
        vec2 mid = (a + b) * 0.5;
        float heightMid = texture2D(uHeightMap, mid).r;
        float depthMid = (depthA + currentLayerDepth) * 0.5; // linear interp of depth
        if (depthMid < heightMid) {
            b = mid;
            currentLayerDepth = depthMid;
        } else {
            a = mid;
            depthA = depthMid;
        }
    }
    return (a + b) * 0.5;
}

void main() {
    vec3 viewDir = normalize(vViewDir);
    vec2 uvParallax = parallaxOcclusion(vUv, viewDir);
    uvParallax = clamp(uvParallax, 0.001, 0.999);

    vec3 albedo = texture2D(uDiffuseMap, uvParallax).rgb;
    vec3 normalTex = texture2D(uNormalMap, uvParallax).rgb * 2.0 - 1.0;
    normalTex = normalize(normalTex);

    float diffuse = max(dot(normalTex, normalize(vNormal)), 0.0);
    vec3 color = albedo * (0.2 + 0.8 * diffuse);

    gl_FragColor = vec4(color, 1.0);
}
