// hittable_list.h — std::vector<shared_ptr<hittable>> becomes a fixed-size array in a storage
// buffer. A `build_world` entry point fills it once (the book's world setup in main()), then
// every pixel invocation reads it. 500 fits the final scene's 22×22 grid plus 4 spheres.
export const HITTABLE_LIST_CAPACITY = 500
// A u32 count padded to 16 bytes, then spheres of at most 64 bytes each (sphere_material).
export const HITTABLE_LIST_BYTE_SIZE = 16 + HITTABLE_LIST_CAPACITY * 64

// The book passes `world` around by reference; WGSL can't portably pass storage pointers,
// so the hittable_list functions use this module-scope binding instead.
const hittable_list_storage = /* wgsl */ `
struct hittable_list {
  size: u32,
  objects: array<sphere, ${HITTABLE_LIST_CAPACITY}>,
}

@group(0) @binding(3) var<storage, read_write> world: hittable_list;
`

export const hittable_list = /* wgsl */ `
${hittable_list_storage}
fn hittable_list_clear() {
  world.size = 0u;
}

fn hittable_list_add(object: sphere) {
  world.objects[world.size] = object;
  world.size += 1u;
}

fn hittable_list_hit(r: ray, ray_t: interval, rec: ptr<function, hit_record>) -> bool {
  var temp_rec: hit_record;
  var hit_anything = false;
  var closest_so_far = ray_t.max;

  for (var k = 0u; k < world.size; k++) {
    let object = world.objects[k];
    if (sphere_hit(object, r, interval(ray_t.min, closest_so_far), &temp_rec)) {
      hit_anything = true;
      closest_so_far = temp_rec.t;
      *rec = temp_rec;
    }
  }

  return hit_anything;
}
`

// Listing [random-spheres-bvh]: `world = hittable_list(make_shared<bvh_node>(world))`. The list
// then holds only the BVH root, so hitting the list is hitting the root. The spheres stay in
// world.objects for the BVH leaves to point at.
export const hittable_list_bvh = /* wgsl */ `
${hittable_list_storage}
fn hittable_list_hit(r: ray, ray_t: interval, rec: ptr<function, hit_record>) -> bool {
  return bvh_node_hit(r, ray_t, rec);
}
`
