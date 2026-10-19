# Prompt History

## 2026-10-05

1. Create a new demo based on:
   https://developer.nvidia.com/gpugems/gpugems2/part-iii-high-quality-rendering/chapter-23-hair-animation-and-rendering-nalu-demo

   Focus only on the hair (not the fins). As always add some tweaks for the tweakpane instance.
   Please try to add tweaks to the shade of the hair, intensity, visible, etc.

   On the demo the character is underwater, let's replicate that, but important is to be able to
   move the head like dragging it

   *Clarifications answered during planning:* name `UnderwaterHair` (bucket T-Z); bare sphere
   rather than a character model; head stays where dropped; ~128 guide strands / ~1500 rendered.

2. Is this code close to the original implementation?
   https://developer.nvidia.com/gpugems/gpugems2/part-iii-high-quality-rendering/chapter-23-hair-animation-and-rendering-nalu-demo

   the movement of the hair looks very buggy, is just jumping like crazy. if you open a chrome
   instance can you record a small video?

   *Clarifications answered during planning:* go the whole way to the chapter — opacity shadow
   maps **and** Marschner lookup textures; offer ribbons **and** line primitives as a Tweakpane
   toggle; record Chrome video both before and after the fix.

## UnderwaterHair startup/drag jumpiness fix — 2026-10-19

1. My latest demo hair (you can check the code changes easily because they are all staged)

   is kind of working BUT the hair is jumping like crazy too sudden when the demo start or when
   you move the ball.... can you open a chrome instance and fix this
