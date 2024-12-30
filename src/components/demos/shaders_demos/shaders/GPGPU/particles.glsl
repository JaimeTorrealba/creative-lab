#include ./simplexNoise4d.glsl

uniform float uTime;
uniform float uDelta;
uniform sampler2D uBase;
//debug
uniform float uFlowFieldInfluence;
uniform float uFlowFieldStrength;
uniform float uFlowFieldFrequency;

void main()
{
    float time = uTime * 0.1;
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 particle = texture(uParticles, uv);
    vec4 base = texture(uBase, uv);

    //dead
    if(particle.a >= 1.0){
        // this fix the change tab issue, with delta time
        particle.a = mod(particle.a, 1.0);
        particle.xyz = base.xyz;
    } 
    else { // alive

    float strength = simplexNoise4d(vec4(base.xyz *0.2, time + 1.0));
    float influece = (uFlowFieldInfluence -0.5) * -2.0;
    strength = smoothstep(influece, 1.0, strength);

    //flow field
    vec3 flowField = vec3(
        simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency, time)),
        simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency +1.0, time)),
        simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 2.0, time))
    );
    flowField = normalize(flowField);
    particle.xyz += flowField * uDelta * strength * uFlowFieldStrength;


    particle.a += uDelta * 0.3;
    }

    gl_FragColor = particle;
}