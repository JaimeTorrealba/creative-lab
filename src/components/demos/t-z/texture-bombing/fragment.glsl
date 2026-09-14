uniform sampler2D uTexture;
uniform float uCells;
uniform float uScale;
uniform float uDensity;
uniform float uRotation;

varying vec2 vUv;

  // ── hash helpers ──────────────────────────────────────────
float hash1(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
vec2 hash2(vec2 p) {
    return fract(sin(p * mat2(127.1, 311.7, 269.5, 183.3)) * 43758.5453);
}

  // ── 2-D rotation ─────────────────────────────────────────
vec2 rotate(vec2 uv, float angle) {
    float s = sin(angle), c = cos(angle);
    return mat2(c, -s, s, c) * uv;
}

void main() {
    vec2 cells = vUv * uCells;
    vec2 cellId = floor(cells);
    vec2 cellUv = fract(cells) - 0.5;   // -0.5 .. 0.5, centred

    vec4 color = vec4(0.0);

    // sample the current cell and its 8 neighbours so stamps near
    // cell borders bleed correctly into adjacent cells
    for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
            vec2 neighbour = vec2(float(x), float(y));
            vec2 id = cellId + neighbour;

        // per-cell randoms
            float rDensity = hash1(id);
            float rAngle = hash1(id + vec2(7.3, 2.1));
            vec2 rOffset = hash2(id + vec2(1.7, 9.2)) - 0.5;  // -0.5..0.5

        // skip this cell if below density threshold
            if(rDensity > uDensity)
                continue;

        // UV relative to this neighbour's centre
            vec2 localUv = cellUv - neighbour + rOffset * (1.0 - uScale);

        // optional random rotation
            localUv = rotate(localUv, rAngle * uRotation * 6.2831);

        // scale so stamp fits inside the cell
            localUv = localUv / uScale + 0.5;   // 0..1

        // discard if outside the stamp bounds
            if(localUv.x < 0.0 || localUv.x > 1.0 ||
                localUv.y < 0.0 || localUv.y > 1.0)
                continue;

            vec4 stamp = texture2D(uTexture, localUv);

        // alpha-composite front to back (higher rDensity = further back)
            color = mix(color, stamp, stamp.a * (1.0 - color.a));
        }
    }

    vec4 base = vec4(0.3, 0.3, 0.3, 1.0);
    gl_FragColor = mix(base, color, color.a);
}