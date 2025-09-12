  // The camera position in world space.
uniform vec3 cameraPos;

        // Data passed from the Vertex to the Fragment Shader.
out vec3 vOrigin;    // The ray's starting point (camera position in the object's local space).
out vec3 vDirection; // The direction of the ray from the camera to the current vertex.

void main() {
            // Transform the vertex position to model-view space.
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

            // Calculate the ray origin by transforming the world camera position into the local space of the cloud container.
    vOrigin = vec3(inverse(modelMatrix) * vec4(cameraPos, 1.0)).xyz;

            // The ray direction is simply the vector from the camera (vOrigin) to the vertex (position).
    vDirection = position - vOrigin;

            // Final vertex position in clip space.
    gl_Position = projectionMatrix * mvPosition;
}