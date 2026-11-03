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

2. [@HairDemo.mp4](file:///C:/Users/Jaime/Downloads/HairDemo.mp4) change the name and add it to
   the thumbnails

## Ray Tracing in One Weekend — offline WebGPU images — 2026-10-22 16:24

1. ok we're going to start a new series of demos based on the famouse book
   https://raytracing.github.io/books/RayTracingInOneWeekend.htm

   The first demo is a bit special because we're going to create several images (I think images
   is best than canvases but you can choose otherwise) offline. you need to do this without using
   tres.js or threejs just plain webGPU.

   in a column based layout starting from the image (or canvas) generate we put the title, link
   and a small description of the generated image. ALL the code is on the book please do not come
   with your own custom code, try to keep the architecture and funtions names as in the book,
   create a file under `/utils` for the utility funtions that the book uses, of course use js or
   ts.

   For this first offline demo I want the results of: Image 1 (First PPM image), Image 2 (A
   blue-to-white gradient depending on ray Y coordinate), Image 3 (A simple red sphere), Image 4
   (A sphere colored according to its normal vectors), Image 5 (Resulting render of
   normals-colored sphere with ground) and Image 7 (First render of a diffuse sphere)

   *Clarifications answered during planning:* run on the GPU as WGSL compute; name
   `RayTracingWeekend` (bucket O-S).

2. Approve the plan

## Ray Tracing in One Weekend — all book images + real-time final scene — 2026-10-22 21:04

1. ON the last session, we replicate in web tech "some" images of the famouse book of "Ray Tracing
   in One Weekend" (check the last prompt history) I think instead we can replicate ALL the
   images, do that for me please

2. I make a small mistake we can delete the images #6, #8, #11 #12, #15

3. Now comes the fun, create another demo, entirely based on the book series, most focus on the
   last image, the final render, and make it real time. for now the only thing that needs to move
   is the camera with the WASD keys to make the camera moves, the mouse we can use pointerLock API
   to move the lookAt, and the keys Q to go up and E to go down. do not use threejs

## Ray tracing demos cleanup and real-time accumulation fix — 2026-10-22 22:30

1. let's make some cleaning here. first we can remove the `/raytracing` demo is useless now.

   second the image, from the `/raytracingweekend` we can remove the Image 19: A wide-angle view.

   Third the real time demo `/raytracingweekendrealtime` at any point the scene get stop, it
   always look like is sampling (or in movement even I'm not moving the camera) do we need a max
   sampling? Let's rename the "defocus" for "depth of field"

2. /verify

3. Let's add stat.js to the realtime demo please

4. wait what? sorry do you install a new pkg?? no no let' use something we already have installed,
   I think maybe we can use the current tweakpane to read the FPS?

5. ok put this one on the raytracing thumbnail [pasted screenshot of the RayTracingWeekend gallery]
   And this one on the ray tracing real-time thumbnail (change the name accordengly for both)
   [@raytracing.mp4](file:///C:/Users/Jaime/Downloads/raytracing.mp4)

## Volume rendering demo planning — 2026-10-23 10:00

1. I want to create a new demo based on:
   https://observablehq.com/@mroehlig/3d-volume-rendering-with-webgl-three-js-solution is
   basically a volume texture rendering, can you answer these questions before implementation?

   what type of data does this need to work?

   Can it work with any data?

   Can you create the data

2. I would like the "pawpawsaurus" from the Klacansky's "Open SciVis Datasets", can you create a
   new demo based on it please and the code provided on the article before, if possible make it
   with webGPU and threejs (or tres.js)

## Untagged demos cleanup, new tags and GratingDiffraction WebGPU port — 2026-10-23 11:00

1. Can you search on this repo, for the demos that are untagged, make some suggestions about
   possible new tags, put them on an existing tag, list them here (only name) and/or to be deleted
   (unworked or too old)

2. Thanks let's delete: AudioAnalyser, CSM, InstanceMesh and InstanceMesh2, TwoScenes, VueXYZ,
   Bubble, Glass, Glow, ActionLines, MouseReveal

   Let's add the tags suggested here
   Fragment: ShaderStar
   Basic: RandomMovement, MultiCamera, StencilMask, InfiniteTube
   WebGPU: GaussianSplat

   Let's add a new tags
   Geometry: DestroyGeometry, Ribbon, FollowPath, Minecraft, Voxel
   Image FX: Dissolve, ImageReveal, MultiLayer, VideoFromImages

   Let's migrate GratingDiffraction to webGPU (try improving the overall look and feel) and add it
   to webGPU tag

3. [@VolumeTexture.mp4](file:///C:/Users/Jaime/Downloads/VolumeTexture.mp4) Add it to the
   thumbnail, btw change the name of the demo it should be "VolumeTexture"

4. Can you stage only the file that this demo touched please

## Mipmap Level Measurement demo planning (GPU Gems 2 ch. 28) — 2026-10-28 00:00

1. Let's discuss about what would be the best way to implement this as a demos:
   https://developer.nvidia.com/gpugems/gpugems2/part-iii-high-quality-rendering/chapter-28-mipmap-level-measurement
   (before coding come with the grilling skill) I got the idea but not the actual implementation

2. ask in prompt checking the answer not in text....

3. Explain the tweakpanel to me I barely understand it

4. [@MipmapMeasurement.mp4](file:///C:/Users/Jaime/Downloads/MipmapMeasurement.mp4) Add the video to the thumbanil

## GridDeformation GPGPU demo — 2026-10-31 12:00

1. Create a new demo basedOn: https://github.com/J0SUKE/grid-deformation-effect

   this use gpgpu, fot eh deformation, add a new tag called "gpgpu". use one of the existing image
   on the repo. do it with tres.js and do not forget to add some tweakpanel

2. small one there is an old demo call gpgpuFlowField add it the new gpgpu tag please

3. [@Jaime bboy JT; 31 Oct, 20 23.mp4](file:///C:/Users/Jaime/Downloads/Jaime%20bboy%20JT;%2031%20Oct,%2020%2023.mp4)
   This is the video thumbnail of the new gridDeformation (remember to match the name)

## DreamyParticles GPGPU demo — 2026-10-31 21:00

1. Create a new demo based on: https://github.com/DGFX/codrops-dreamy-particles

   use a model we got already, gpgpu tag

## Voxel demo fix (port of Codrops voxel art tutorial) — 2026-10-31 20:15

1. I got a voxel demo already that convert object on voxels, but is not working quite well can you
   check the original example and fix it?

   https://github.com/uuuulala/Threejs-voxel-art-tutorial/

2. Remove the models, use primitives or models we got already on the repo

## Dissolve demos: augment with edge particles + bloom (not a port) — 2026-10-31 20:30

1. I got some dissolve demos already, one wit webgl and one with webGPU. but they are not as polish
   as this, mine dont' have particles or post processing. can you add them

   https://github.com/JatinChopra/emissive-dissolve-effect

2. I'm really sorry this is my bad prompt . you copy and paste all the code. no no I don't need it
   to be exact. I have a demo running and the idea wasnot replace it but to augment it adding the
   particles and the post processing. can you go back bring the earth, remove all the assets that
   you added and just augmenting this please

## PencilLines post-processing demo — 2026-10-31 22:00

1. Create a new demo based on: https://github.com/mayacoda/pencil-lines

2. beautiful only low the strengh of the motion bloom at 0.2 please

3. [@Jaime bboy JT; 31 Oct, 20 35.mp4](file:///C:/Users/Jaime/Downloads/Jaime%20bboy%20JT;%2031%20Oct,%2020%2035.mp4)
   This is the thumbnail

2. [@Jaime bboy JT; 31 Oct, 20 37.mp4](file:///C:/Users/Jaime/Downloads/Jaime%20bboy%20JT;%2031%20Oct,%2020%2037.mp4)
   This is the thumbnail

## Divine Fire overlay-mesh burning effect demo — 2026-11-03 12:00

1. Can you see, read and undertand this tech? before any coding just tell me what you see, how you
   would implement it in threejs
   https://simonschreibt.de/gat/divine-fire/

2. ok create a new demo, apply this effect in a rehusable way so we can create a scene with 4
   meshes, a box a sphere a jaimeAvatar and an ant

   Put the in a 2 by 2 layout on the z axis

   for the trigger use the tweakpane, in conjuntion with any other property you find usefull here

3. [@DivideFire.mp4](file:///C:/Users/Jaime/Downloads/DivideFire.mp4) thumbnail
