varying vec2 vUv;
uniform float uTime;
uniform float uGain;
uniform float uScale;
uniform int uOctaves;

#include '../../../shaders/SHARED/noise2D.glsl';

float fbm( in vec2 x, in float H )
{    
    float t = 0.0;
    for( int i=0; i<uOctaves; i++ )
    {
        float f = pow( 2.0, float(i) );
        float a = pow( f, -H );
        t += a*snoise(f*x);
    }
    return t;
}

void main() {
    // 
    float n = fbm(vUv * uScale + uTime * 0.1, uGain);
    gl_FragColor = vec4(vec3(n), 1.0);
}