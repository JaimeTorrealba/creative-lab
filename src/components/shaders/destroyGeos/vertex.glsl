  attribute vec3 aRandom;
  uniform float uProgress;
    void main() {
      vec3 newPos = position;
      newPos.x += (aRandom.x * uv.x -0.5)* uProgress * 2.0;
      newPos.y += (aRandom.x * uv.y -0.5)* uProgress * 2.0;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( newPos, 1.0 );
    }