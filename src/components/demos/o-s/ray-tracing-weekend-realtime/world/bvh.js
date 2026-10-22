// bvh.h ("Ray Tracing: The Next Week"), Listings [bvh-node] + [object-span-bbox], building the
// tree on the CPU. A node is { bbox, left, right }; a leaf child is the sphere itself.
import { aabb_empty, aabb_from_boxes, aabb_axis_interval, aabb_longest_axis } from './aabb'

const box_compare = (a, b, axis_index) => {
  const a_axis_interval = aabb_axis_interval(a.bbox, axis_index)
  const b_axis_interval = aabb_axis_interval(b.bbox, axis_index)
  return a_axis_interval.min < b_axis_interval.min
}

// std::sort(begin + start, begin + end, comparator) on a sub-range of `objects`.
const sort_span = (objects, start, end, axis) => {
  const span = objects
    .slice(start, end)
    .sort((a, b) => (box_compare(a, b, axis) ? -1 : box_compare(b, a, axis) ? 1 : 0))
  objects.splice(start, span.length, ...span)
}

const make_bvh_node_span = (objects, start, end) => {
  // Build the bounding box of the span of source objects.
  let bbox = aabb_empty
  for (let object_index = start; object_index < end; object_index++) {
    bbox = aabb_from_boxes(bbox, objects[object_index].bbox)
  }

  const axis = aabb_longest_axis(bbox)
  const object_span = end - start
  let left
  let right

  if (object_span === 1) {
    left = right = objects[start]
  } else if (object_span === 2) {
    left = objects[start]
    right = objects[start + 1]
  } else {
    sort_span(objects, start, end, axis)

    const mid = start + Math.floor(object_span / 2)
    left = make_bvh_node_span(objects, start, mid)
    right = make_bvh_node_span(objects, mid, end)
  }

  return { bbox, left, right }
}

// bvh_node(hittable_list list): sorts a copy, so `list.objects` keeps its order.
export const make_bvh_node = (list) =>
  make_bvh_node_span([...list.objects], 0, list.objects.length)
