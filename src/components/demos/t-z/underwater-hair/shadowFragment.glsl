// 16 opacity-shadow slices in one pass. GPU Gems 2 ch. 23 §23.4 needed four MRT passes to fill
// 16 channels; three's RenderTarget `count` gives four RGBA attachments at once.
precision highp float;

uniform float uStrandOpacity;

in float vDepth01;

layout(location = 0) out vec4 gSlice0;
layout(location = 1) out vec4 gSlice1;
layout(location = 2) out vec4 gSlice2;
layout(location = 3) out vec4 gSlice3;

// A fragment contributes to every slice at or behind it - the paper's "output 0 if z_hair > z_i".
// Additive blending across overlapping strands turns that into the density integral.
vec4 sliceBlock(float d, float base, float op) {
  return vec4(
    d <= base + 1.0 ? op : 0.0,
    d <= base + 2.0 ? op : 0.0,
    d <= base + 3.0 ? op : 0.0,
    d <= base + 4.0 ? op : 0.0
  );
}

void main() {
  float d = vDepth01 * 16.0;
  gSlice0 = sliceBlock(d, 0.0, uStrandOpacity);
  gSlice1 = sliceBlock(d, 4.0, uStrandOpacity);
  gSlice2 = sliceBlock(d, 8.0, uStrandOpacity);
  gSlice3 = sliceBlock(d, 12.0, uStrandOpacity);
}
