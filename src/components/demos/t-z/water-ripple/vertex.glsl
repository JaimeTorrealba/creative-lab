uniform mat4 textureMatrix;
varying vec4 vUv;
varying vec2 vSurfaceUv;

		#include <common>
		#include <logdepthbuf_pars_vertex>

void main() {

    vUv = textureMatrix * vec4(position, 1.0);
	vSurfaceUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

			#include <logdepthbuf_vertex>
}