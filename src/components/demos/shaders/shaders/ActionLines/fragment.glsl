uniform sampler2D uTexture;
uniform float uTime;
uniform float uNumLines;
uniform float uRadios;
uniform float uNoiseRadios;

varying vec2 vUv;

#define PI 3.14159265359

vec2 toPolar(vec2 uv) {
  vec2 p = uv - 0.5;        // [0,1] → [-0.5,0.5], center at 0
//   p.x *= uResolution.x / uResolution.y;  // correct for aspect ratio
  float r = length(p);        // radius
  float a = atan(p.y , p.x );   // angle [-PI, PI]
  a = (a + PI ) / (2.0 * PI );  // normalize to [0,1]
  return vec2(a, r);
}

void main() {

    vec2 polarUV = toPolar(vUv);
    // Use angle (x) to sample the texture - creates radial lines
    // Rotate the angle over time
    float angle = (polarUV.x * uNumLines) + uTime;
    vec4 noise = texture2D(uTexture, vec2(angle, polarUV.x ));
    noise.x = step(0.5, noise.x);
    noise.y = step(0.5, noise.x);
    noise.z = step(0.5, noise.x);
    
    // Add noise to radius for irregular circle
    float radiusNoise = texture2D(uTexture, vec2(polarUV.x * 3.0 + uTime * 0.5, uTime * 0.2)).r;
    float noisyRadius = uRadios + (radiusNoise - 0.5) * uNoiseRadios; // Adjust 0.1 for noise intensity
    noise.w *= smoothstep(noisyRadius, noisyRadius + 0.025, polarUV.y);

    gl_FragColor = vec4(vec3(0.0), noise.w * (noise.x));
}