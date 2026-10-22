// ray.h
export const ray = /* wgsl */ `
struct ray {
  orig: point3,
  dir: vec3f,
}

fn ray_at(r: ray, t: f32) -> point3 {
  return r.orig + t * r.dir;
}
`
