// interval.h + aabb.h ("Ray Tracing: The Next Week"), the parts the BVH build needs on the CPU.
// Constructor overloads get descriptive suffixes: aabb_from_points, aabb_from_boxes.

export const interval = (min, max) => ({ min, max })

export const interval_size = (ival) => ival.max - ival.min

// interval(const interval& a, const interval& b): the interval tightly enclosing both.
export const interval_from_intervals = (a, b) =>
  interval(a.min <= b.min ? a.min : b.min, a.max >= b.max ? a.max : b.max)

const interval_empty = interval(+Infinity, -Infinity)

export const aabb = (x, y, z) => ({ x, y, z })

export const aabb_from_points = (a, b) =>
  // Treat the two points a and b as extrema for the bounding box, so we don't require a
  // particular minimum/maximum coordinate order.
  aabb(
    a[0] <= b[0] ? interval(a[0], b[0]) : interval(b[0], a[0]),
    a[1] <= b[1] ? interval(a[1], b[1]) : interval(b[1], a[1]),
    a[2] <= b[2] ? interval(a[2], b[2]) : interval(b[2], a[2])
  )

export const aabb_from_boxes = (box0, box1) =>
  aabb(
    interval_from_intervals(box0.x, box1.x),
    interval_from_intervals(box0.y, box1.y),
    interval_from_intervals(box0.z, box1.z)
  )

export const aabb_axis_interval = (box, n) => {
  if (n === 1) return box.y
  if (n === 2) return box.z
  return box.x
}

export const aabb_longest_axis = (box) => {
  // Returns the index of the longest axis of the bounding box.
  if (interval_size(box.x) > interval_size(box.y)) {
    return interval_size(box.x) > interval_size(box.z) ? 0 : 2
  }
  return interval_size(box.y) > interval_size(box.z) ? 1 : 2
}

export const aabb_empty = aabb(interval_empty, interval_empty, interval_empty)
