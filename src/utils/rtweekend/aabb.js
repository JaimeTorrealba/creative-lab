// aabb.h ("Ray Tracing: The Next Week") — the box is three intervals, like the book's.
export const aabb = /* wgsl */ `
struct aabb {
  x: interval,
  y: interval,
  z: interval,
}

fn aabb_axis_interval(box: aabb, n: i32) -> interval {
  if (n == 1) { return box.y; }
  if (n == 2) { return box.z; }
  return box.x;
}

fn aabb_hit(box: aabb, r: ray, ray_t_in: interval) -> bool {
  let ray_orig = r.orig;
  let ray_dir = r.dir;
  var ray_t = ray_t_in;

  for (var axis = 0; axis < 3; axis++) {
    let ax = aabb_axis_interval(box, axis);
    let adinv = 1.0 / ray_dir[axis];

    let t0 = (ax.min - ray_orig[axis]) * adinv;
    let t1 = (ax.max - ray_orig[axis]) * adinv;

    if (t0 < t1) {
      if (t0 > ray_t.min) { ray_t.min = t0; }
      if (t1 < ray_t.max) { ray_t.max = t1; }
    } else {
      if (t1 > ray_t.min) { ray_t.min = t1; }
      if (t0 < ray_t.max) { ray_t.max = t0; }
    }

    if (ray_t.max <= ray_t.min) {
      return false;
    }
  }
  return true;
}
`
