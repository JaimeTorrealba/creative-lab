uniform vec3 color;
uniform sampler2D tDiffuse;
uniform sampler2D tDudv;
uniform float time;
uniform float waveStrength;
uniform float waveSpeed;
uniform float rippleRadius;
uniform float rippleFeather;

varying vec4 vUv;
varying vec2 vSurfaceUv;

float ripple(vec2 uv, vec2 center, float time) {
    float d = length(uv - center);
    float wave = sin(58.0 * d - time * 4.8);
    wave = sign(wave) * pow(abs(wave), 2.4);
    float decay = exp(-3.0 * d);
    return wave * decay;
}

		#include <logdepthbuf_pars_fragment>

void main() {


    			#include <logdepthbuf_fragment>
        vec2 center = vec2(0.5, 0.5);
        float distToCenter = length(vSurfaceUv - center);
        float rippleMask = 1.0 - smoothstep(rippleRadius, rippleRadius + rippleFeather, distToCenter);

        vec2 dudv = texture2D(tDudv, vec2(vSurfaceUv.x + time * waveSpeed, vSurfaceUv.y)).rg;
        dudv = (dudv * 2.0 - 1.0) * waveStrength;

        float rippleWave = ripple(vSurfaceUv, center, time) * waveStrength * 1.35;
        vec2 distortion = (dudv + vec2(rippleWave)) * rippleMask;

			// new uv coords

    vec4 uv = vec4(vUv);
    uv.xy += distortion;

    vec4 base = texture2DProj(tDiffuse, uv);
    gl_FragColor = vec4(mix(base.rgb, color, 0.5), 1.0);
			#include <tonemapping_fragment>
			#include <colorspace_fragment>

}