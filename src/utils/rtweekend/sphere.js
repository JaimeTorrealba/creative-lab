// sphere.h
const sphere_hit = (setMaterial) => /* wgsl */ `
fn sphere_hit(s: sphere, r: ray, ray_t: interval, rec: ptr<function, hit_record>) -> bool {
  let oc = s.center - r.orig;
  let a = length_squared(r.dir);
  let h = dot(r.dir, oc);
  let c = length_squared(oc) - s.radius * s.radius;

  let discriminant = h * h - a * c;
  if (discriminant < 0.0) {
    return false;
  }

  let sqrtd = sqrt(discriminant);

  // Find the nearest root that lies in the acceptable range.
  var root = (h - sqrtd) / a;
  if (!interval_surrounds(ray_t, root)) {
    root = (h + sqrtd) / a;
    if (!interval_surrounds(ray_t, root)) {
      return false;
    }
  }

  (*rec).t = root;
  (*rec).p = ray_at(r, (*rec).t);
  let outward_normal = ((*rec).p - s.center) / s.radius;
  set_face_normal(rec, r, outward_normal);${setMaterial ? '\n  (*rec).mat = s.mat;' : ''}

  return true;
}
`

export const sphere = /* wgsl */ `
struct sphere {
  center: point3,
  radius: f32,
}

fn make_sphere(center: point3, radius: f32) -> sphere {
  return sphere(center, max(0.0, radius));
}
${sphere_hit(false)}`

// Listings [sphere-material] + [sphere-ctor-material]
export const sphere_material = /* wgsl */ `
struct sphere {
  center: point3,
  radius: f32,
  mat: material,
}

fn make_sphere(center: point3, radius: f32, mat: material) -> sphere {
  return sphere(center, max(0.0, radius), mat);
}
${sphere_hit(true)}`
