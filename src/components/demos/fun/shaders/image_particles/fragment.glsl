uniform sampler2D uTexture;
uniform float uLines;
uniform float uColumns;
varying vec2 vTextCoods;


float circle(vec2 uv, float border){
    float radius = 0.5;
    float dist = distance(uv, vec2(0.5));
    return smoothstep(0.0, border, dist);
}

void main() {
    vec2 uv = gl_PointCoord;
    uv.y *= -1.;
    uv /= vec2(uColumns, uLines );

    float texOffsetU = vTextCoods.x / uColumns;
    float texOffsetV = vTextCoods.y / uLines;

    uv += vec2(texOffsetU, texOffsetV);
    uv += vec2(0.5);
    vec4 texture = texture2D(uTexture, uv);
    
    gl_FragColor = texture;
    if(gl_FragColor.r < 0.1){
         discard;
        }
    gl_FragColor.a *= circle(gl_PointCoord, 0.2);
}