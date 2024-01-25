uniform sampler2D difftexture;
uniform vec4 resolution;
varying vec2 vUv;
uniform vec2 uHover;

vec4 chromaticAberration(vec2 uv) {
    return vec4(texture2D(difftexture, vec2(uv.x +0.5 , uv.y +0.5)).x, texture2D(difftexture, uv).y, texture2D(difftexture, uv).z, 1.0);
}

float sdfCircle(vec2 p, float r) {
    return length(p)  - r;
}

void main() {
    vec2 pixelCoords = (vUv - 0.5) * resolution.xx;

    vec3 sample1 = texture2D(difftexture, vUv).rgb;
    vec3 sample2 = chromaticAberration(vUv).rgb;
    vec3 colour = sample1;

    float size = smoothstep(0.0, 15.0, 3.0) * length(resolution.xy) * 0.5;
    float d = sdfCircle(pixelCoords - uHover, size);

    colour = mix(sample2, colour, smoothstep(0.0, 1.0, d));

    gl_FragColor = vec4(colour, 1.0);
}