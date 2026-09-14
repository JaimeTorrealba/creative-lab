uniform sampler2D uTexture;
uniform sampler2D uDepth;
uniform vec2 uMouse;
varying vec2 vUv;

void main(){
    vec4 depth = texture2D(uDepth, vUv);
    gl_FragColor = texture2D(uTexture, vUv + uMouse * depth.r);
}