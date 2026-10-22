// material.h — WGSL has no virtual dispatch, so the abstract `material` class becomes one
// tagged struct (fields unused by a kind are ignored) and material_scatter() switches on it.
// make_shared<lambertian>(...) becomes make_lambertian(...), and so on.

const material_struct = /* wgsl */ `
const MATERIAL_LAMBERTIAN = 0u;
const MATERIAL_METAL = 1u;
const MATERIAL_DIELECTRIC = 2u;

struct material {
  kind: u32,
  albedo: color,
  fuzz: f32,
  // Refractive index in vacuum or air, or the ratio of the material's refractive index over
  // the refractive index of the enclosing media
  refraction_index: f32,
}
`

// Listing [material-initial]: the dispatcher for lambertian + metal (Metal chapter).
export const material = /* wgsl */ `
${material_struct}
fn material_scatter(mat: material, r_in: ray, rec: hit_record, attenuation: ptr<function, color>, scattered: ptr<function, ray>) -> bool {
  if (mat.kind == MATERIAL_LAMBERTIAN) {
    return lambertian_scatter(mat, r_in, rec, attenuation, scattered);
  }
  if (mat.kind == MATERIAL_METAL) {
    return metal_scatter(mat, r_in, rec, attenuation, scattered);
  }
  return false;
}
`

// The same dispatcher once the dielectric class exists (Dielectrics chapter).
export const material_with_dielectric = /* wgsl */ `
${material_struct}
fn material_scatter(mat: material, r_in: ray, rec: hit_record, attenuation: ptr<function, color>, scattered: ptr<function, ray>) -> bool {
  if (mat.kind == MATERIAL_LAMBERTIAN) {
    return lambertian_scatter(mat, r_in, rec, attenuation, scattered);
  }
  if (mat.kind == MATERIAL_METAL) {
    return metal_scatter(mat, r_in, rec, attenuation, scattered);
  }
  if (mat.kind == MATERIAL_DIELECTRIC) {
    return dielectric_scatter(mat, r_in, rec, attenuation, scattered);
  }
  return false;
}
`

// Listing [lambertian-catch-zero]
export const lambertian = /* wgsl */ `
fn make_lambertian(albedo: color) -> material {
  return material(MATERIAL_LAMBERTIAN, albedo, 0.0, 0.0);
}

fn lambertian_scatter(mat: material, r_in: ray, rec: hit_record, attenuation: ptr<function, color>, scattered: ptr<function, ray>) -> bool {
  var scatter_direction = rec.normal + random_unit_vector();

  // Catch degenerate scatter direction
  if (near_zero(scatter_direction)) {
    scatter_direction = rec.normal;
  }

  *scattered = ray(rec.p, scatter_direction);
  *attenuation = mat.albedo;
  return true;
}
`

// Listing [metal-material]
export const metal = /* wgsl */ `
fn make_metal(albedo: color) -> material {
  return material(MATERIAL_METAL, albedo, 0.0, 0.0);
}

fn metal_scatter(mat: material, r_in: ray, rec: hit_record, attenuation: ptr<function, color>, scattered: ptr<function, ray>) -> bool {
  let reflected = reflect(r_in.dir, rec.normal);
  *scattered = ray(rec.p, reflected);
  *attenuation = mat.albedo;
  return true;
}
`

// Listing [metal-fuzz]
export const metal_fuzz = /* wgsl */ `
fn make_metal(albedo: color, fuzz: f32) -> material {
  return material(MATERIAL_METAL, albedo, select(1.0, fuzz, fuzz < 1), 0.0);
}

fn metal_scatter(mat: material, r_in: ray, rec: hit_record, attenuation: ptr<function, color>, scattered: ptr<function, ray>) -> bool {
  var reflected = reflect(r_in.dir, rec.normal);
  reflected = unit_vector(reflected) + (mat.fuzz * random_unit_vector());
  *scattered = ray(rec.p, reflected);
  *attenuation = mat.albedo;
  return (dot((*scattered).dir, rec.normal) > 0);
}
`

const make_dielectric = /* wgsl */ `
fn make_dielectric(refraction_index: f32) -> material {
  return material(MATERIAL_DIELECTRIC, color(0, 0, 0), 0.0, refraction_index);
}
`

// Listing [dielectric-always-refract]
export const dielectric_always_refract = /* wgsl */ `
${make_dielectric}
fn dielectric_scatter(mat: material, r_in: ray, rec: hit_record, attenuation: ptr<function, color>, scattered: ptr<function, ray>) -> bool {
  *attenuation = color(1.0, 1.0, 1.0);
  let ri = select(mat.refraction_index, 1.0 / mat.refraction_index, rec.front_face);

  let unit_direction = unit_vector(r_in.dir);
  let refracted = refract(unit_direction, rec.normal, ri);

  *scattered = ray(rec.p, refracted);
  return true;
}
`

// Listing [dielectric-with-refraction]
export const dielectric_reflect = /* wgsl */ `
${make_dielectric}
fn dielectric_scatter(mat: material, r_in: ray, rec: hit_record, attenuation: ptr<function, color>, scattered: ptr<function, ray>) -> bool {
  *attenuation = color(1.0, 1.0, 1.0);
  let ri = select(mat.refraction_index, 1.0 / mat.refraction_index, rec.front_face);

  let unit_direction = unit_vector(r_in.dir);
  let cos_theta = min(dot(-unit_direction, rec.normal), 1.0);
  let sin_theta = sqrt(1.0 - cos_theta * cos_theta);

  let cannot_refract = ri * sin_theta > 1.0;
  var direction: vec3f;

  if (cannot_refract) {
    direction = reflect(unit_direction, rec.normal);
  } else {
    direction = refract(unit_direction, rec.normal, ri);
  }

  *scattered = ray(rec.p, direction);
  return true;
}
`

// Listing [glass]
export const dielectric = /* wgsl */ `
${make_dielectric}
fn dielectric_scatter(mat: material, r_in: ray, rec: hit_record, attenuation: ptr<function, color>, scattered: ptr<function, ray>) -> bool {
  *attenuation = color(1.0, 1.0, 1.0);
  let ri = select(mat.refraction_index, 1.0 / mat.refraction_index, rec.front_face);

  let unit_direction = unit_vector(r_in.dir);
  let cos_theta = min(dot(-unit_direction, rec.normal), 1.0);
  let sin_theta = sqrt(1.0 - cos_theta * cos_theta);

  let cannot_refract = ri * sin_theta > 1.0;
  var direction: vec3f;

  if (cannot_refract || dielectric_reflectance(cos_theta, ri) > random_double()) {
    direction = reflect(unit_direction, rec.normal);
  } else {
    direction = refract(unit_direction, rec.normal, ri);
  }

  *scattered = ray(rec.p, direction);
  return true;
}

fn dielectric_reflectance(cosine: f32, refraction_index: f32) -> f32 {
  // Use Schlick's approximation for reflectance.
  var r0 = (1 - refraction_index) / (1 + refraction_index);
  r0 = r0 * r0;
  return r0 + (1 - r0) * pow((1 - cosine), 5.0);
}
`
