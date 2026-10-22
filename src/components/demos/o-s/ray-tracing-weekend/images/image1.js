import { output } from '@/utils/renderComputeToImage'

// Listing [main-gradient]: the book's nested j/i loops become the dispatch grid.
const main_cc = /* wgsl */ `
@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  // Image

  let image_width = 256;
  let image_height = 256;

  // Render

  let i = i32(id.x);
  let j = i32(id.y);
  if (i >= image_width || j >= image_height) {
    return;
  }
  pixel_index = u32(j * image_width + i);

  let r = f32(i) / f32(image_width - 1);
  let g = f32(j) / f32(image_height - 1);
  let b = 0.0;

  let ir = i32(255.999 * r);
  let ig = i32(255.999 * g);
  let ib = i32(255.999 * b);

  write_pixel(ir, ig, ib);
}
`

export const image1 = {
  image_width: 256,
  image_height: 256,
  code: [output, main_cc].join('\n')
}
