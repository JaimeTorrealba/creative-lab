varying vec3 vLocalPos;

void main() {
    // Pass object-space vertex position to the fragment shader
    vLocalPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}