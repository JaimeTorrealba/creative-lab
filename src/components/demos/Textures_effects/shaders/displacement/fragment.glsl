precision mediump float;
#define GLSLIFY 1

uniform float u_time;
uniform vec2 u_mouse;
uniform float uMouseInfluence;
uniform float uGlow;
uniform float uMouseArea;
uniform vec2 u_resolution;
uniform sampler2D u_texture;
varying vec2 v_uv;

vec2 distort(vec2 uv, vec2 center, float strength, float frequency) {
    vec2 dir = uv - center;
    float dist = length(dir);
    float distortion = sin(dist * frequency - u_time * 0.5) * strength;
    distortion *= smoothstep(0.5, 0.0, dist);
    return uv + dir * distortion;
}

// chromatic aberration removed

float noise(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float smoothNoise(vec2 st) {
    vec2 ipos = floor(st);
    vec2 fpos = fract(st);
    
    fpos = fpos * fpos * (3.0 - 2.0 * fpos);
    
    float bl = noise(ipos);
    float br = noise(ipos + vec2(1.0, 0.0));
    float tl = noise(ipos + vec2(0.0, 1.0));
    float tr = noise(ipos + vec2(1.0, 1.0));
    
    float b = mix(bl, br, fpos.x);
    float t = mix(tl, tr, fpos.x);
    
    return mix(b, t, fpos.y);
}

void main() {
    // Adjust for aspect ratio
    vec2 uv = v_uv;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 normalizedUV = vec2(uv.x * aspect, uv.y);
    vec2 normalizedMouse = vec2(u_mouse.x * aspect, u_mouse.y);
    
    // Base distortion centered around mouse
    float mouseInfluence = 1.0 - smoothstep(0.0, 0.3, length(normalizedUV - normalizedMouse) * uMouseArea);
    float distortStrength = 0.05 + mouseInfluence * uMouseInfluence;
    float distortFreq = 10.0 + 5.0 * sin(u_time * 0.2);
    
    // Add some noise for more interesting distortion
    vec2 noiseCoord = normalizedUV * 3.0 + u_time * 0.1;
    float noiseVal = smoothNoise(noiseCoord) * 0.02;
    
    // Apply distortion
    vec2 distortedUV = distort(uv, u_mouse, distortStrength + noiseVal, distortFreq);
    
    // Sample texture directly
    vec3 color = texture2D(u_texture, distortedUV).rgb;
    
    // Add a subtle pulsing glow around mouse
    float pulse = 0.5 + 0.5 * sin(u_time * 2.0);
    float glow = smoothstep(0.3 + 0.1 * pulse, 0.0, length(normalizedUV - normalizedMouse) * uGlow);
    color += vec3(0.1, 0.05, 0.2) * glow;
    
    gl_FragColor = vec4(color, 1.0);
    
    #include <colorspace_fragment>
}