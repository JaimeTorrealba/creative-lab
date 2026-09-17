uniform vec2 uResolution;
uniform float uSize;
uniform float uHeight;
uniform vec3 uColorA;
uniform vec3 uColorB;
attribute float aSize;

varying vec3 vColor;

void main()
{
    // Positions already carry the skinned deformation, read back on the CPU
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    // Point size
    gl_PointSize = aSize * uSize * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    // Varyings
    vColor = mix(uColorA, uColorB, smoothstep(0.0, uHeight, modelPosition.y));
}
