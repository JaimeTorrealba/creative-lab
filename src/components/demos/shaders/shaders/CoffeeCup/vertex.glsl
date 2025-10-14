varying vec2 vUv;
uniform sampler2D uPerlin;
uniform float uTime;

vec2 rotated2D(vec2 value, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    mat2 m = mat2(c, -s, s, c);
    return m * value;
}

void main() {
    vec3 newPosition = position;
    //random position of the perlin for ROTATION
    float perlin = texture(uPerlin, vec2(0.5, uv.y *0.2 - uTime * 0.005)).r;
    float angle = perlin * 10.0;
    newPosition.xz = rotated2D(position.xz, angle);

    // wind effect
    vec2 windOffset = vec2(
        texture(uPerlin, vec2(0.25, uTime * 0.01)).r -0.5,
        texture(uPerlin, vec2(0.75, uTime * 0.01)).r -0.5
        );
    windOffset.x *= pow(uv.y, 3.0) * 10.0;
    windOffset.y *= pow(uv.y, 3.0) * 10.0;
    newPosition.xz += windOffset;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    vUv = uv;
}