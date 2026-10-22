// vec3.h — WGSL's vec3f already provides the operators, dot(), cross() and length().
export const vec3 = /* wgsl */ `
// point3 is just an alias for vec3, but useful for geometric clarity in the code.
alias point3 = vec3f;

fn length_squared(v: vec3f) -> f32 {
  return v.x * v.x + v.y * v.y + v.z * v.z;
}

fn near_zero(v: vec3f) -> bool {
  // Return true if the vector is close to zero in all dimensions.
  let s = 1e-8;
  return (abs(v.x) < s) && (abs(v.y) < s) && (abs(v.z) < s);
}

fn vec3_random() -> vec3f {
  return vec3f(random_double(), random_double(), random_double());
}

fn vec3_random_range(min: f32, max: f32) -> vec3f {
  return vec3f(random_double_range(min, max), random_double_range(min, max), random_double_range(min, max));
}

// Vector Utility Functions

fn unit_vector(v: vec3f) -> vec3f {
  return v / length(v);
}

fn random_in_unit_disk() -> vec3f {
  loop {
    let p = vec3f(random_double_range(-1.0, 1.0), random_double_range(-1.0, 1.0), 0);
    if (length_squared(p) < 1.0) {
      return p;
    }
  }
  // Unreachable; naga rejects a function that only returns from inside an endless loop.
  return vec3f(0, 0, 0);
}

fn random_unit_vector() -> vec3f {
  loop {
    let p = vec3_random_range(-1.0, 1.0);
    let lensq = length_squared(p);
    // The book rejects lensq <= 1e-160 (double); 1e-37 is the f32 equivalent.
    if (1e-37 < lensq && lensq <= 1.0) {
      return p / sqrt(lensq);
    }
  }
  // Unreachable; naga rejects a function that only returns from inside an endless loop.
  return vec3f(0, 1, 0);
}

fn random_on_hemisphere(normal: vec3f) -> vec3f {
  let on_unit_sphere = random_unit_vector();
  if (dot(on_unit_sphere, normal) > 0.0) { // In the same hemisphere as the normal
    return on_unit_sphere;
  } else {
    return -on_unit_sphere;
  }
}

// reflect/refract shadow the WGSL built-ins: the book's refract() differs from the built-in
// one under total internal reflection, which Image 16 depends on.
fn reflect(v: vec3f, n: vec3f) -> vec3f {
  return v - 2 * dot(v, n) * n;
}

fn refract(uv: vec3f, n: vec3f, etai_over_etat: f32) -> vec3f {
  let cos_theta = min(dot(-uv, n), 1.0);
  let r_out_perp = etai_over_etat * (uv + cos_theta * n);
  let r_out_parallel = -sqrt(abs(1.0 - length_squared(r_out_perp))) * n;
  return r_out_perp + r_out_parallel;
}
`
