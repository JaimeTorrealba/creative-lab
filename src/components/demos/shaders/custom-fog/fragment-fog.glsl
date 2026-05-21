if (vWorldPos.y < uFogTop) {
  vec2 camXZ = cameraPosition.xz;
  vec2 posXZ = vWorldPos.xz;
  float distXZ = distance(camXZ, posXZ);
  if (uFogRadius > 0.0 && distXZ <= uFogRadius) {
    float normalized = clamp((uFogTop - vWorldPos.y) / max(0.0001, uFogDepth), 0.0, 1.0);
    float heightAtten = pow(normalized, uFogExponent);
    if (heightAtten > 0.0) {
      vec3 fbmSample = vWorldPos * uNoiseScale;
      vec3 windOffset = vec3(uWindDir.x, 0.0, uWindDir.y) * uWindSpeed * uTime * uNoiseScale;
      windOffset.y += sin(uTime * 0.07 + fbmSample.x * 0.5 + fbmSample.z * 0.5) * uVerticalBillow;
      fbmSample += windOffset;
      vec3 fbmSample2 = vWorldPos * uNoiseScale + vec3(-uWindDir.y, 0.0, uWindDir.x) * uWindSpeed * 0.7 * uTime * uNoiseScale;
      fbmSample2.y += sin(uTime * 0.09 + fbmSample2.x * 0.6 + fbmSample2.z * 0.6) * uVerticalBillow;
      float n01 = mix(fbm01(fbmSample, uNoiseOctaves), fbm01(fbmSample2, uNoiseOctaves), 0.5);
      float effectiveStrength = uNoiseStrength * 0.05;
      float noiseMod = mix(1.0 - effectiveStrength, 1.0 + effectiveStrength, n01);
      float radiusFactor = 1.0 - smoothstep(uFogRadius*0.7, uFogRadius, distXZ);
      float fogFactor = clamp(heightAtten * noiseMod * uFogOpacity * radiusFactor, 0.0, 1.0);
      gl_FragColor.rgb = mix(gl_FragColor.rgb, uFogColor * 0.92, fogFactor);
    }
  }
}
