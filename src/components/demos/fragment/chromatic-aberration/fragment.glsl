uniform sampler2D difftexture;
uniform float red;
uniform float blue;
uniform float green;

varying vec2 vUv;

vec4 chromaticAberration(vec2 uv) {
    return vec4(
        texture2D(difftexture, vec2(uv.x + red , uv.y +red)).x, texture2D(difftexture, vec2(uv.x + green , uv.y +green)).y,
        texture2D(difftexture, vec2(uv.x + blue , uv.y +blue)).z, 1.0);
}

void main() {
    vec3 ca = chromaticAberration(vUv).rgb;

    gl_FragColor = vec4(ca, 1.0);
}