varying vec3 vPos;
uniform float uSliceStart;
uniform float uSliceArc;

void main() {
    float angle = atan(vPos.y, vPos.x); // always the y first, that's the order
    angle -= uSliceStart;
    angle = mod(angle, PI2);
    if(angle > 0.0 && angle < uSliceArc) {
        discard;
    }

    float csm_Slice;

    // csm_FragColor = vec4(vPos, 1.0);
}