// bvh.h ("Ray Tracing: The Next Week"). The tree is built on the CPU and uploaded flattened:
// a child index >= 0 is another bvh_node, a negative one is the sphere at world.objects[~child].
export const BVH_STACK_SIZE = 32

export const bvh = /* wgsl */ `
struct bvh_node {
  bbox: aabb,
  left: i32,
  right: i32,
}

@group(0) @binding(4) var<storage, read> bvh_nodes: array<bvh_node>;

// The book's bvh_node::hit recurses: test the box, then left, then right with the interval
// shrunk to the left hit. WGSL has no recursion, so this walks the tree with a stack; popping
// left before right and shrinking closest_so_far after every hit gives the same closest hit.
fn bvh_node_hit(r: ray, ray_t: interval, rec: ptr<function, hit_record>) -> bool {
  var stack: array<i32, ${BVH_STACK_SIZE}>;
  var stack_size = 1;
  stack[0] = 0; // The root node.

  var temp_rec: hit_record;
  var hit_anything = false;
  var closest_so_far = ray_t.max;

  while (stack_size > 0) {
    stack_size--;
    let child = stack[stack_size];

    if (child < 0) {
      let object = world.objects[~child];
      if (sphere_hit(object, r, interval(ray_t.min, closest_so_far), &temp_rec)) {
        hit_anything = true;
        closest_so_far = temp_rec.t;
        *rec = temp_rec;
      }
      continue;
    }

    let node = bvh_nodes[child];
    if (!aabb_hit(node.bbox, r, interval(ray_t.min, closest_so_far))) {
      continue;
    }
    stack[stack_size] = node.right;
    stack[stack_size + 1] = node.left;
    stack_size += 2;
  }

  return hit_anything;
}
`
