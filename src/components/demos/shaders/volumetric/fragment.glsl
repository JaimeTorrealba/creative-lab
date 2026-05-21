uniform float sigma_a; // absorption coefficient
uniform float sphereRadius;
uniform vec3 camPos;
uniform vec3 sphereCenter;
varying vec3 vNormal;
varying vec3 vPosition;

// Ray-sphere intersection function
// Returns: x = tmin, y = tmax, z = hit (1.0 if hit, 0.0 if no hit)
vec3 raySphereIntersection(vec3 rayOrigin, vec3 rayDir, vec3 sphereCenter, float sphereRadius) {
  vec3 oc = rayOrigin - sphereCenter;
  
  float a = dot(rayDir, rayDir);
  float b = 2.0 * dot(oc, rayDir);
  float c = dot(oc, oc) - sphereRadius * sphereRadius;
  
  float discriminant = b * b - 4.0 * a * c;
  
  if (discriminant < 0.0) {
    return vec3(0.0, 0.0, 0.0); // No intersection
  }
  
  float sqrtDisc = sqrt(discriminant);
  float tmin = (-b - sqrtDisc) / (2.0 * a);
  float tmax = (-b + sqrtDisc) / (2.0 * a);
  
  return vec3(tmin, tmax, 1.0); // Hit detected
}

void main() {
  // Reconstruct view direction from fragment position
  vec3 rayOrigin = camPos;
  vec3 rayDir = normalize(vPosition - camPos);
  
  // Perform ray-sphere intersection
  vec3 intersection = raySphereIntersection(rayOrigin, rayDir, sphereCenter, sphereRadius);
  
  float hit = intersection.z;
  
  if (hit < 0.5) {
    // No intersection - return background
    discard;
  }
  
  float tmin = intersection.x;
  float tmax = intersection.y;
  
  // Clamp to positive values (only consider intersections in front of camera)
  tmin = max(tmin, 0.0);
  tmax = max(tmax, 0.0);
  
  // Distance traveled through the sphere
  float distance = tmax - tmin;
  
  // Apply Beer's law: T = e^(-sigma_a * distance)
  float T = exp(-sigma_a * distance);
  
  // Sphere color (cyan) - uniform scattering assumption
  vec3 sphere_color = vec3(0.2, 0.8, 1.0);
  
  // Apply transmission through volume
  vec3 transmitted_light = sphere_color * (1.0 - T);
  
  // Add basic lighting
  vec3 light = normalize(vNormal);
  transmitted_light += light * 0.2;
  
  // Output: sphere with volumetric transparency
  gl_FragColor = vec4(transmitted_light, 1.0 - T);
}