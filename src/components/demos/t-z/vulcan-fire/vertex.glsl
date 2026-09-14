in vec3 aOffset;
in float aScale;
in float aRotation;
in float aLife;
in float aFrameOffset;
in float aOpacity;
in vec2 aFlip;

uniform float uTime;
uniform float uPlaybackSpeed;

out vec2 vUv;
out float vLife;
out float vFrame;
out float vOpacity;

void main() {
  vUv = vec2(
    aFlip.x > 0.0 ? uv.x : 1.0 - uv.x,
    aFlip.y > 0.0 ? uv.y : 1.0 - uv.y
  );
  vLife = aLife;
  vOpacity = aOpacity;
  vFrame = uTime * uPlaybackSpeed + aFrameOffset;

  float c = cos(aRotation);
  float s = sin(aRotation);
  vec2 corner = mat2(c, s, -s, c) * (position.xy * aScale);

  // screen-aligned billboard: offset the quad corner in view space
  vec4 mvPosition = modelViewMatrix * vec4(aOffset, 1.0);
  mvPosition.xy += corner;
  gl_Position = projectionMatrix * mvPosition;
}
