uniform float uTime;
void main() {
    csm_Position = position;
    csm_Position.y += sin(position.x * 5. - uTime) * 0.1;
    csm_Position.x += cos(position.y * 5. - uTime) * 0.1;
}