uniform float uSize;
uniform float uTime;

attribute float aScale;
attribute vec3 aRandomness;

varying vec3 vColor;

void main() {

            //position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    float angelOffset = (1.0 / distanceToCenter) * uTime * 0.2;
    angle += angelOffset;

    modelPosition.x = cos(angle);
    modelPosition.y = sin(angle);

    modelPosition.xyz += aRandomness;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

            //size
            //random
    gl_PointSize = uSize * aScale;
            //atenuacion
    gl_PointSize *= (1.0 / -viewPosition.z);

    vColor = color;

}