// hittable.h — the abstract `hittable` class has no WGSL equivalent (no virtual dispatch):
// sphere is the only hittable, so hittable_list_hit calls sphere_hit directly.

const set_face_normal = /* wgsl */ `
fn set_face_normal(rec: ptr<function, hit_record>, r: ray, outward_normal: vec3f) {
  // Sets the hit record normal vector.
  // NOTE: the parameter \`outward_normal\` is assumed to have unit length.
  (*rec).front_face = dot(r.dir, outward_normal) < 0.0;
  if ((*rec).front_face) {
    (*rec).normal = outward_normal;
  } else {
    (*rec).normal = -outward_normal;
  }
}
`

export const hittable = /* wgsl */ `
struct hit_record {
  p: point3,
  normal: vec3f,
  t: f32,
  front_face: bool,
}
${set_face_normal}`

// Listing [hit-with-material]: shared_ptr<material> becomes a copy of the material struct.
export const hittable_material = /* wgsl */ `
struct hit_record {
  p: point3,
  normal: vec3f,
  mat: material,
  t: f32,
  front_face: bool,
}
${set_face_normal}`
