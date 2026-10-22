// color.h — write_color() hands the bytes to write_pixel() instead of std::cout.

// Listing [write-color-clamped]
export const color = /* wgsl */ `
alias color = vec3f;

fn write_color(pixel_color: color) {
  let r = pixel_color.x;
  let g = pixel_color.y;
  let b = pixel_color.z;

  // Translate the [0,1] component values to the byte range [0,255].
  let intensity = interval(0.000, 0.999);
  let rbyte = i32(256 * interval_clamp(intensity, r));
  let gbyte = i32(256 * interval_clamp(intensity, g));
  let bbyte = i32(256 * interval_clamp(intensity, b));

  // Write out the pixel color components.
  write_pixel(rbyte, gbyte, bbyte);
}
`

// Listing [write-color-gamma]
export const color_gamma = /* wgsl */ `
alias color = vec3f;

fn linear_to_gamma(linear_component: f32) -> f32 {
  if (linear_component > 0) {
    return sqrt(linear_component);
  }

  return 0.0;
}

fn write_color(pixel_color: color) {
  var r = pixel_color.x;
  var g = pixel_color.y;
  var b = pixel_color.z;

  // Apply a linear to gamma transform for gamma 2
  r = linear_to_gamma(r);
  g = linear_to_gamma(g);
  b = linear_to_gamma(b);

  // Translate the [0,1] component values to the byte range [0,255].
  let intensity = interval(0.000, 0.999);
  let rbyte = i32(256 * interval_clamp(intensity, r));
  let gbyte = i32(256 * interval_clamp(intensity, g));
  let bbyte = i32(256 * interval_clamp(intensity, b));

  // Write out the pixel color components.
  write_pixel(rbyte, gbyte, bbyte);
}
`
