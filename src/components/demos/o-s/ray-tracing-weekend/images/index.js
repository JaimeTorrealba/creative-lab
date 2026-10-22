import { image1 } from './image1'
import { image2 } from './image2'
import { image3 } from './image3'
import { image4 } from './image4'
import { image5 } from './image5'
import { image7 } from './image7'
import { image9 } from './image9'
import { image10 } from './image10'
import { image13 } from './image13'
import { image14 } from './image14'
import { image16 } from './image16'
import { image17 } from './image17'
import { image18 } from './image18'
import { image20 } from './image20'
import { image21 } from './image21'
import { image22 } from './image22'
import { image23 } from './image23'

const BOOK_URL = 'https://raytracing.github.io/books/RayTracingInOneWeekend.html'

export const IMAGES = [
  {
    id: 1,
    title: 'First PPM image',
    link: `${BOOK_URL}#outputanimage/creatinganimagefile`,
    description:
      'No rays yet: red grows left to right and green grows top to bottom, written pixel by pixel just like the PPM loop.',
    image: image1
  },
  {
    id: 2,
    title: 'A blue-to-white gradient depending on ray Y coordinate',
    link: `${BOOK_URL}#rays,asimplecamera,andbackground/sendingraysintothescene`,
    description:
      'A camera at the origin sends one ray per pixel; ray_color lerps white to sky blue using the unit direction’s y.',
    image: image2
  },
  {
    id: 3,
    title: 'A simple red sphere',
    link: `${BOOK_URL}#addingasphere/creatingourfirstraytracedimage`,
    description:
      'hit_sphere solves the ray–sphere quadratic; any ray with a non-negative discriminant is painted red.',
    image: image3
  },
  {
    id: 4,
    title: 'A sphere colored according to its normal vectors',
    link: `${BOOK_URL}#surfacenormalsandmultipleobjects/shadingwithsurfacenormals`,
    description:
      'hit_sphere now returns the nearest t, and the unit surface normal at that point is mapped from [-1,1] to an RGB color.',
    image: image4
  },
  {
    id: 5,
    title: 'Resulting render of normals-colored sphere with ground',
    link: `${BOOK_URL}#surfacenormalsandmultipleobjects/commonconstantsandutilityfunctions`,
    description:
      'The hittable abstraction: a hittable_list holds the small sphere plus a huge one acting as ground, and keeps the closest hit.',
    image: image5
  },
  {
    id: 7,
    title: 'First render of a diffuse sphere',
    link: `${BOOK_URL}#diffusematerials/asimplediffusematerial`,
    description:
      'Each hit bounces in a random direction on the normal’s hemisphere and keeps 50% of the color. The rings are shadow acne (fixed in Image 9); f32 shows it as rings instead of grain.',
    image: image7
  },
  {
    id: 9,
    title: 'Diffuse sphere with no shadow acne',
    link: `${BOOK_URL}#diffusematerials/fixingshadowacne`,
    description:
      'Hits closer than t = 0.001 are ignored, so a bounced ray can no longer re-hit the surface it starts on.',
    image: image9
  },
  {
    id: 10,
    title: 'Correct rendering of Lambertian spheres',
    link: `${BOOK_URL}#diffusematerials/truelambertianreflection`,
    description:
      'Bouncing towards normal + random_unit_vector() favours directions near the normal: deeper shadows, and both spheres pick up the sky’s blue.',
    image: image10
  },
  {
    id: 13,
    title: 'Shiny metal',
    link: `${BOOK_URL}#metal/ascenewithmetalspheres`,
    description:
      'The material class: lambertian scatters diffusely, metal mirrors the ray with reflect(). A blue diffuse sphere between two polished metal ones.',
    image: image13
  },
  {
    id: 14,
    title: 'Fuzzed metal',
    link: `${BOOK_URL}#metal/fuzzyreflection`,
    description:
      'metal gets a fuzz radius that nudges the reflected direction by fuzz × random_unit_vector(): 0.3 on the left, 1.0 on the right.',
    image: image14
  },
  {
    id: 16,
    title: 'Glass sphere that always refracts',
    link: `${BOOK_URL}#dielectrics/snell'slaw`,
    description:
      'A dielectric that always refracts with Snell’s law. The glass sphere (index 1.5) on the left shows the world upside down.',
    image: image16
  },
  {
    id: 17,
    title: 'Air bubble sometimes refracts, sometimes reflects',
    link: `${BOOK_URL}#dielectrics/totalinternalreflection`,
    description:
      'An air bubble in water (index 1.00 / 1.33): when Snell’s law has no solution the ray must reflect, so glancing rays bounce off.',
    image: image17
  },
  {
    id: 18,
    title: 'A hollow glass sphere',
    link: `${BOOK_URL}#dielectrics/modelingahollowglasssphere`,
    description:
      'Schlick’s approximation adds angle-dependent reflection, and a 0.4 air bubble makes the glass hollow. The listing sets the right sphere’s fuzz to 0.0; the book’s picture still uses 1.0.',
    image: image18
  },
  {
    id: 20,
    title: 'A distant view',
    link: `${BOOK_URL}#positionablecamera/positioningandorientingthecamera`,
    description:
      'The camera gets a vertical field of view, and lookfrom, lookat and vup build its u, v, w frame: the hollow-glass scene seen from (-2, 2, 1) at 90°.',
    image: image20
  },
  {
    id: 21,
    title: 'Zooming in',
    link: `${BOOK_URL}#positionablecamera/positioningandorientingthecamera`,
    description: 'The same viewpoint with vfov narrowed to 20°.',
    image: image21
  },
  {
    id: 22,
    title: 'Spheres with depth-of-field',
    link: `${BOOK_URL}#defocusblur/generatingsamplerays`,
    description:
      'Rays start on a defocus disk around lookfrom (defocus_angle 10°) and converge at focus_dist 3.4, so only the centre sphere is sharp.',
    image: image22
  },
  {
    id: 23,
    title: 'Final scene',
    link: `${BOOK_URL}#wherenext?/afinalrender`,
    description:
      'The cover: random diffuse, metal and glass spheres around three big ones, 1200×675 at 500 samples per pixel, refining as it renders. The random sequence isn’t std::rand, so the layout differs from the book’s.',
    image: image23
  }
]
