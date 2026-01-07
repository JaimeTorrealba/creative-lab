uniform vec3 uContactPoint;
uniform vec3 uContactNormal;
uniform float uContactStrength;
uniform float uContactIntensity;

varying vec3 vWorldPos;
varying vec3 vWorldNormal;

void main() {
      // Fresnel factor: high at grazing angles (edges), low at center
    vec3 V = normalize(cameraPosition - vWorldPos);
    float ndotv = clamp(abs(dot(normalize(vWorldNormal), V)), 0.0, 1.0);
    float fresnel = pow(1.0 - ndotv, 3.0);

      // Distance-based spot around contact point with soft falloff
    float d = length(vWorldPos - uContactPoint);
    float Rmax = 3.0;
    float r = Rmax * uContactStrength;
    float feather = 0.15;
    float inner = max(0.0, r - feather);
    float spot = 1.0 - smoothstep(inner, r, d);

      // Only show when contact is active
    float _active = step(0.001, uContactStrength);
    float mask = spot * _active;

      // Localized ring around contact radius: high only near boundary
    float ringWidth = 0.20;
    float boundary = smoothstep(r - ringWidth, r, d) * (1.0 - smoothstep(r, r + ringWidth, d));
    float contactRing = pow(boundary, 1.5) * _active; // sharpen ring

      // Second fresnel: angle-based, gated by contact ring
    float fresnelContact = fresnel * contactRing;

      // Color: base rim + brighter contact rim of same hue
    vec3 rimColor = vec3(0.4, 0.7, 1.0) * fresnel;
      // Boost contact ring brightness via uniform
    vec3 contactRimColor = vec3(0.6, 0.9, 1.0) * fresnelContact * uContactIntensity;
    vec3 color = rimColor + contactRimColor;

      // Alpha uses max of base fresnel and contact fresnel ring
    float alpha = clamp(max(fresnel, fresnelContact), 0.0, 1.0);
    gl_FragColor = vec4(color, alpha);
}