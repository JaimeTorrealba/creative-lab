uniform sampler2D uDiffuseMap;
uniform sampler2D uNormalMap;
uniform sampler2D uHeightMap;
uniform float uHeightScale;
uniform vec3 uViewPos; // kept for consistency

varying vec2 vUv;
varying vec3 vViewDir;
varying vec3 vNormal;

// Relief / per-pixel displacement style parallax (uniform step + small binary refine)
vec2 reliefParallax(vec2 uv, vec3 viewDir) {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(viewDir);
    float ndotv = max(dot(N, V), 0.0);

    // More steps for shallow angles
    float numSteps = mix(20.0, 80.0, 1.0 - ndotv);
    float stepDepth = 1.0 / numSteps;
    vec2 totalShift = V.xy * uHeightScale;
    vec2 delta = totalShift / numSteps;

    float depth = 0.0;
    vec2 uvCurr = uv;
    float height = texture2D(uHeightMap, uvCurr).r;

    // March until we pass height field
    for (int i = 0; i < 90; i++) { // upper bound > max steps
        if (depth >= height || depth >= 1.0) break;
        uvCurr -= delta;
        depth += stepDepth;
        height = texture2D(uHeightMap, uvCurr).r;
    }

    // Previous position before overshoot
    vec2 uvPrev = uvCurr + delta;
    float depthPrev = depth - stepDepth;

    // Binary refine (few iterations)
    vec2 a = uvPrev; float aDepth = depthPrev; float aHeight = texture2D(uHeightMap, a).r;
    vec2 b = uvCurr; float bDepth = depth;     float bHeight = texture2D(uHeightMap, b).r;

    for (int i = 0; i < 5; i++) {
        vec2 mid = (a + b) * 0.5;
        float midHeight = texture2D(uHeightMap, mid).r;
        float midDepth = (aDepth + bDepth) * 0.5;
        if (midDepth < midHeight) { // still above surface -> advance
            a = mid; aDepth = midDepth; aHeight = midHeight;
        } else {
            b = mid; bDepth = midDepth; bHeight = midHeight;
        }
    }

    return (a + b) * 0.5;
}

void main() {
    vec3 viewDir = normalize(vViewDir);
    vec2 uvParallax = reliefParallax(vUv, viewDir);
    uvParallax = clamp(uvParallax, 0.001, 0.999);

    vec3 albedo = texture2D(uDiffuseMap, uvParallax).rgb;
    vec3 normalTex = texture2D(uNormalMap, uvParallax).rgb * 2.0 - 1.0;
    normalTex = normalize(normalTex);

    float diffuse = max(dot(normalTex, normalize(vNormal)), 0.0);
    vec3 color = albedo * (0.2 + 0.8 * diffuse);

    gl_FragColor = vec4(color, 1.0);
}