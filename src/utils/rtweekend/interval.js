// interval.h
export const interval = /* wgsl */ `
struct interval {
  min: f32,
  max: f32,
}

fn interval_size(ival: interval) -> f32 {
  return ival.max - ival.min;
}

fn interval_contains(ival: interval, x: f32) -> bool {
  return ival.min <= x && x <= ival.max;
}

fn interval_surrounds(ival: interval, x: f32) -> bool {
  return ival.min < x && x < ival.max;
}

fn interval_clamp(ival: interval, x: f32) -> f32 {
  if (x < ival.min) { return ival.min; }
  if (x > ival.max) { return ival.max; }
  return x;
}

const interval_empty = interval(infinity, -infinity);
const interval_universe = interval(-infinity, infinity);
`
