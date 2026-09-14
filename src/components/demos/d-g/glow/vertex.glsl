uniform vec3 viewVector;
uniform float c;
uniform float power;
varying float intensity;
void main() {
    vec3 vNormal = normalize( normalMatrix * normal );
	vec3 vNormel = normalize( normalMatrix * viewVector );
	intensity = pow( c - dot(vNormal, vNormel), power );
	
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}