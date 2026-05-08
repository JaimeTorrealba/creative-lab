  uniform vec3 uLightDir;

  varying vec3 vLocalPos;
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;

  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(vViewDir);
    vec3 L = normalize(uLightDir);
    vec3 H = normalize(L + V);

    // Tangential direction at this point on the disc (perpendicular to radial)
    vec2 radial = normalize(vLocalPos.xy);
    vec2 tangent = vec2(-radial.y, radial.x);

    // Project half-vector onto tangent — this is what drives the angular sweep
    float t = dot(H.xy, tangent);   // -1..1, creates the pie-slice sweep
    // Small radial modulation for track-density realism
    float r = length(vLocalPos.xy); // inner ~0.18, outer ~1.2
    float phase = t * 2.5 + r * 0.4;

    float hue = fract(phase);
    vec3 rainbow = hsv2rgb(vec3(hue, 1.0, 1.0));

    // Metallic silver base — diffuse shading
    float diff = max(dot(N, L), 0.0);
    vec3 base = vec3(0.55 + diff * 0.3);

    // Tight specular highlight
    float spec = pow(max(dot(N, H), 0.0), 256.0);

    // Rainbow tints the silver rather than replacing it; kept subtle
    vec3 color = base * mix(vec3(1.0), rainbow, 0.35) + spec * 1.3;

    gl_FragColor = vec4(color, 1.0);
  }