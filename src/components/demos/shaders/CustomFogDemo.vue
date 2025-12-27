<script setup>
import { onMounted, shallowRef } from 'vue'
import { useLoop, useTres } from '@tresjs/core'
import { Pane } from 'tweakpane'
import {
  Color,
  Vector2,
  Object3D,
  PlaneGeometry,
  ConeGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
  Mesh,
  DoubleSide,
  InstancedMesh,
  PCFShadowMap,
  PCFSoftShadowMap,
} from 'three'
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js'

/* ---------- Height-Fog (module imports, no global THREE) ---------- */
class HeightFog {
  constructor(scene, options = {}) {
    this.scene = scene
    this.radius = options.radius ?? 500.0
    this.color = new Color(options.color ?? 0xE3EAF2)
    this.fogTop = options.fogTop ?? 4.0
    this.fogDepth = options.fogDepth ?? 6.0
    this.opacity = options.opacity ?? 0.8
    this.exponent = options.exponent ?? 1.2
    this.noiseScale = options.noiseScale ?? 0.08
    this.noiseStrength = options.noiseStrength ?? 0.12
    this.noiseOctaves = Math.max(1, Math.min(8, options.noiseOctaves ?? 4))
    this.windDir = new Vector2(options.windDirX ?? 0.0, options.windDirZ ?? 1.0).normalize()
    this.windSpeed = options.windSpeed ?? 0.8
    this.verticalBillow = options.verticalBillow ?? 0.35

    this.materials = new Set()
    this._time = 0

    this.patchScene()
  }

  patchScene() {
    this.scene.traverse((obj) => {
      if (obj.isMesh) this.patchMaterial(obj)
    })
  }

  patchMaterial(mesh) {
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (let mat of mats) {
      if (!mat || mat.userData._heightFogPatched) continue
      mat.userData._heightFogPatched = true
      mat.transparent = mat.transparent || false

      const orig = mat.onBeforeCompile
      mat.onBeforeCompile = (shader) => {
        if (orig) orig(shader)

        shader.uniforms.uFogRadius = { value: this.radius }
        shader.uniforms.uFogColor = { value: this.color.clone() }
        shader.uniforms.uFogTop = { value: this.fogTop }
        shader.uniforms.uFogDepth = { value: this.fogDepth }
        shader.uniforms.uFogOpacity = { value: this.opacity }
        shader.uniforms.uFogExponent = { value: this.exponent }

        shader.uniforms.uNoiseScale = { value: this.noiseScale }
        shader.uniforms.uNoiseStrength = { value: this.noiseStrength }
        shader.uniforms.uNoiseOctaves = { value: this.noiseOctaves }
        shader.uniforms.uWindDir = { value: new Vector2(this.windDir.x, this.windDir.y) }
        shader.uniforms.uWindSpeed = { value: this.windSpeed }
        shader.uniforms.uVerticalBillow = { value: this.verticalBillow }
        shader.uniforms.uTime = { value: this._time }

        mat.userData.heightFogUniforms = shader.uniforms

        shader.vertexShader = 'varying vec3 vWorldPos;\n' + shader.vertexShader
        shader.vertexShader = shader.vertexShader.replace(
          '#include <worldpos_vertex>',
          `#include <worldpos_vertex>
           #ifdef USE_INSTANCING
             vWorldPos = (modelMatrix * instanceMatrix * vec4(position, 1.0)).xyz;
           #else
             vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
           #endif`
        )

        const NOISE = `
        vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v){
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          vec3 ns = C.x * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ * ns.x + ns.yyyy;
          vec4 y = y_ * ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
          vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        float fbm_base(vec3 p, int octaves) {
          float value = 0.0;
          float amp = 0.5;
          float freq = 1.0;
          for (int i = 0; i < 6; i++) {
            if (i >= octaves) break;
            value += amp * snoise(p * freq);
            freq *= 2.0;
            amp *= 0.5;
          }
          return value;
        }

        float fbm01(vec3 p, int octaves) {
          return clamp(fbm_base(p, octaves) * 0.5 + 0.5, 0.0, 1.0);
        }
        `

        shader.fragmentShader = `
          varying vec3 vWorldPos;
          uniform float uFogRadius;
          uniform vec3 uFogColor;
          uniform float uFogTop;
          uniform float uFogDepth;
          uniform float uFogOpacity;
          uniform float uFogExponent;
          uniform float uNoiseScale;
          uniform float uNoiseStrength;
          uniform int uNoiseOctaves;
          uniform vec2 uWindDir;
          uniform float uWindSpeed;
          uniform float uVerticalBillow;
          uniform float uTime;
        \n` + NOISE + '\n' + shader.fragmentShader

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <fog_fragment>',
          `#include <fog_fragment>
        if (vWorldPos.y < uFogTop) {
          vec2 camXZ = cameraPosition.xz;
          vec2 posXZ = vWorldPos.xz;
          float distXZ = distance(camXZ, posXZ);
          if (uFogRadius > 0.0 && distXZ <= uFogRadius) {
            float normalized = clamp((uFogTop - vWorldPos.y) / max(0.0001, uFogDepth), 0.0, 1.0);
            float heightAtten = pow(normalized, uFogExponent);
            if (heightAtten > 0.0) {
              vec3 fbmSample = vWorldPos * uNoiseScale;
              vec3 windOffset = vec3(uWindDir.x, 0.0, uWindDir.y) * uWindSpeed * uTime * uNoiseScale;
              windOffset.y += sin(uTime * 0.07 + fbmSample.x * 0.5 + fbmSample.z * 0.5) * uVerticalBillow;
              fbmSample += windOffset;
              vec3 fbmSample2 = vWorldPos * uNoiseScale + vec3(-uWindDir.y, 0.0, uWindDir.x) * uWindSpeed * 0.7 * uTime * uNoiseScale;
              fbmSample2.y += sin(uTime * 0.09 + fbmSample2.x * 0.6 + fbmSample2.z * 0.6) * uVerticalBillow;
              float n01 = mix(fbm01(fbmSample, uNoiseOctaves), fbm01(fbmSample2, uNoiseOctaves), 0.5);
              float effectiveStrength = uNoiseStrength * 0.05;
              float noiseMod = mix(1.0 - effectiveStrength, 1.0 + effectiveStrength, n01);
              float radiusFactor = 1.0 - smoothstep(uFogRadius*0.7, uFogRadius, distXZ);
              float fogFactor = clamp(heightAtten * noiseMod * uFogOpacity * radiusFactor, 0.0, 1.0);
              gl_FragColor.rgb = mix(gl_FragColor.rgb, uFogColor * 0.92, fogFactor);
            }
          }
        }
          `
        )
      }

      mat.needsUpdate = true
      this.materials.add(mat)
    }
  }

  updateTime(t) {
    this._time = t
    for (let m of this.materials) {
      if (!m.userData || !m.userData.heightFogUniforms) continue
      const u = m.userData.heightFogUniforms
      if (u.uFogRadius) u.uFogRadius.value = this.radius
      if (u.uTime) u.uTime.value = t
      if (u.uFogColor) u.uFogColor.value.copy(this.color)
      if (u.uFogTop) u.uFogTop.value = this.fogTop
      if (u.uFogDepth) u.uFogDepth.value = this.fogDepth
      if (u.uFogOpacity) u.uFogOpacity.value = this.opacity
      if (u.uFogExponent) u.uFogExponent.value = this.exponent
      if (u.uNoiseScale) u.uNoiseScale.value = this.noiseScale
      if (u.uNoiseStrength) u.uNoiseStrength.value = this.noiseStrength
      if (u.uNoiseOctaves) u.uNoiseOctaves.value = this.noiseOctaves
      if (u.uWindDir) u.uWindDir.value.set(this.windDir.x, this.windDir.y)
      if (u.uWindSpeed) u.uWindSpeed.value = this.windSpeed
      if (u.uVerticalBillow) u.uVerticalBillow.value = this.verticalBillow
    }
  }

  setRadius(v) { this.radius = v }
  setFogTop(v){ this.fogTop = v }
  setFogDepth(v){ this.fogDepth = v }
  setColor(c){ this.color.set(c) }
  setOpacity(v){ this.opacity = v }
  setExponent(v){ this.exponent = v }
  setNoiseScale(v){ this.noiseScale = v }
  setNoiseStrength(v){ this.noiseStrength = v }
  setNoiseOctaves(v){ this.noiseOctaves = Math.max(1, Math.min(8, Math.floor(v))) }
  setWind(dirX, dirZ){ this.windDir.set(dirX, dirZ).normalize() }
  setWindSpeed(v){ this.windSpeed = v }
  setVerticalBillow(v){ this.verticalBillow = v }
}

/* ---------- Tres setup ---------- */
const { scene, renderer } = useTres()
const sunRef = shallowRef()

// Terrain
const SIZE = 200, SEG = 200, TERR_SCALE = 1.5
const inNoise = new ImprovedNoise()

function createTerrain() {
  const terrainGeo = new PlaneGeometry(SIZE, SIZE, SEG, SEG)
  terrainGeo.rotateX(-Math.PI / 2)
  const pos = terrainGeo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) / 12
    const z = pos.getZ(i) / 12
    const y = inNoise.noise(x, 0, z) * TERR_SCALE
    pos.setY(i, y)
  }
  terrainGeo.computeVertexNormals()
  const terrainMat = new MeshStandardMaterial({ color: 0x3f5a47, roughness: 1, side: DoubleSide })
  const terrain = new Mesh(terrainGeo, terrainMat)
  terrain.receiveShadow = true
  scene.value.add(terrain)
}

function getTerrainHeight(x, z) {
  return inNoise.noise(x / 12, 0, z / 12) * TERR_SCALE
}

/* ---------- Instanced Trees ---------- */
function createInstancedForest(numTrees = 700, radius = 110) {
  const coneGeo = new ConeGeometry(1, 2, 8)
  const trunkGeo = new CylinderGeometry(0.25, 0.25, 2, 8)
  const leavesMat = new MeshStandardMaterial({ color: 0x2c8b3a, roughness: 0.9 })
  const trunkMat = new MeshStandardMaterial({ color: 0x7b4f2b, roughness: 1.0 })

  const cones = [
    new InstancedMesh(coneGeo, leavesMat, numTrees),
    new InstancedMesh(coneGeo, leavesMat, numTrees),
    new InstancedMesh(coneGeo, leavesMat, numTrees),
  ]
  const trunks = new InstancedMesh(trunkGeo, trunkMat, numTrees)

  const dummy = new Object3D()
  for (let i = 0; i < numTrees; i++) {
    const r = Math.sqrt(Math.random()) * radius
    const theta = Math.random() * Math.PI * 2
    const x = Math.cos(theta) * r
    const z = Math.sin(theta) * r
    if (Math.sqrt(x * x + z * z) < 5) continue

    const terrainY = getTerrainHeight(x, z)
    const scale = 0.8 + Math.random() * 2.0

    const trunkScaleY = 1.2 * scale
    const trunkHeight = 2 * trunkScaleY
    dummy.position.set(x, terrainY + trunkHeight * 0.5, z)
    dummy.scale.set(0.8 * scale, trunkScaleY, 0.8 * scale)
    dummy.rotation.y = Math.random() * Math.PI * 2
    dummy.updateMatrix()
    trunks.setMatrixAt(i, dummy.matrix)

    let currentTop = terrainY + trunkHeight
    for (let level = 0; level < 3; level++) {
      const levelScale = scale * (1.4 - level * 0.28)
      const coneScaleY = levelScale * 1.0
      const coneHeight = 2 * coneScaleY
      const coneY = currentTop + coneHeight * 0.5
      dummy.position.set(x, coneY, z)
      dummy.scale.set(levelScale, coneScaleY, levelScale)
      dummy.rotation.y = (Math.random() - 0.5) * 0.4
      dummy.updateMatrix()
      cones[level].setMatrixAt(i, dummy.matrix)
      currentTop += coneHeight * 0.6
    }
  }

  cones.forEach((c) => {
    c.instanceMatrix.needsUpdate = true
    c.castShadow = true
    c.receiveShadow = true
    scene.value.add(c)
  })
  trunks.instanceMatrix.needsUpdate = true
  trunks.castShadow = true
  trunks.receiveShadow = true
  scene.value.add(trunks)
}

/* ---------- Fog + Controls ---------- */
let fog
function setupFogAndControls() {
  fog = new HeightFog(scene.value, {
    radius: 500.0,
    color: 0xE3EAF2,
    fogTop: 5.0,
    fogDepth: 5.0,
    opacity: 0.75,
    exponent: 1.2,
    noiseScale: 0.6,
    noiseStrength: 0.2,
    noiseOctaves: 5,
    windDirX: 0.5,
    windDirZ: 0.15,
    windSpeed: 1.0,
    verticalBillow: 0.5,
  })

  const pane = new Pane()
  const f = pane.addFolder({ title: 'Height FBM Fog' })
  f.addBinding({ value: fog.radius }, 'value', { min: 0, max: 500, step: 1, label: 'Fog Radius' }).on('change', ({ value }) => fog.setRadius(value))
  f.addBinding({ color: '#E3EAF2' }, 'color', { label: 'Fog Color' }).on('change', ({ value }) => fog.setColor(value))
  f.addBinding({ value: fog.fogTop }, 'value', { min: -10, max: 40, step: 0.1, label: 'Fog Top Y' }).on('change', ({ value }) => fog.setFogTop(value))
  f.addBinding({ value: fog.fogDepth }, 'value', { min: 0.1, max: 40, step: 0.1, label: 'Fog Depth' }).on('change', ({ value }) => fog.setFogDepth(value))
  f.addBinding({ value: fog.opacity }, 'value', { min: 0, max: 1, step: 0.01, label: 'Opacity' }).on('change', ({ value }) => fog.setOpacity(value))
  f.addBinding({ value: fog.exponent }, 'value', { min: 0.1, max: 6, step: 0.1, label: 'Exponent' }).on('change', ({ value }) => fog.setExponent(value))
  f.addBinding({ value: fog.noiseScale }, 'value', { min: 0.01, max: 0.6, step: 0.01, label: 'Noise Scale' }).on('change', ({ value }) => fog.setNoiseScale(value))
  f.addBinding({ value: fog.noiseStrength }, 'value', { min: 0, max: 1, step: 0.01, label: 'Noise Strength' }).on('change', ({ value }) => fog.setNoiseStrength(value))
  f.addBinding({ value: fog.noiseOctaves }, 'value', { min: 1, max: 8, step: 1, label: 'Noise Octaves' }).on('change', ({ value }) => fog.setNoiseOctaves(value))
  f.addBinding({ value: fog.windDir.x }, 'value', { min: -1, max: 1, step: 0.01, label: 'Wind Dir X' }).on('change', ({ value }) => fog.setWind(value, fog.windDir.y))
  f.addBinding({ value: fog.windDir.y }, 'value', { min: -1, max: 1, step: 0.01, label: 'Wind Dir Z' }).on('change', ({ value }) => fog.setWind(fog.windDir.x, value))
  f.addBinding({ value: fog.windSpeed }, 'value', { min: 0, max: 3, step: 0.01, label: 'Wind Speed' }).on('change', ({ value }) => fog.setWindSpeed(value))
  f.addBinding({ value: fog.verticalBillow }, 'value', { min: 0, max: 2, step: 0.01, label: 'Vertical Billow' }).on('change', ({ value }) => fog.setVerticalBillow(value))

  const shadowSettings = { quality: 'high' }
  f.addBinding(shadowSettings, 'quality', { options: { none: 'none', low: 'low', medium: 'medium', high: 'high' }, label: 'Shadow Quality' })
    .on('change', ({ value }) => updateShadowQuality(value))
}

function updateShadowQuality(quality) {
  const sun = sunRef.value
  if (!sun || !renderer.value) return
  let newSize
  switch (quality) {
    case 'none':
      sun.castShadow = false
      renderer.value.shadowMap.enabled = false
      renderer.value.shadowMap.needsUpdate = true
      return
    case 'low':
      renderer.value.shadowMap.enabled = true
      renderer.value.shadowMap.type = PCFShadowMap
      sun.castShadow = true
      newSize = 512
      break
    case 'medium':
      renderer.value.shadowMap.enabled = true
      renderer.value.shadowMap.type = PCFSoftShadowMap
      sun.castShadow = true
      newSize = 1024
      break
    case 'high':
      renderer.value.shadowMap.enabled = true
      renderer.value.shadowMap.type = PCFSoftShadowMap
      sun.castShadow = true
      newSize = 2048
      break
  }
  if (sun.shadow.mapSize.width !== newSize) {
    sun.shadow.map?.dispose?.()
    sun.shadow.map = null
    sun.shadow.mapSize.width = newSize
    sun.shadow.mapSize.height = newSize
    sun.shadow.needsUpdate = true
    renderer.value.shadowMap.needsUpdate = true
  } else {
    sun.shadow.needsUpdate = true
    renderer.value.shadowMap.needsUpdate = true
  }
}

onMounted(() => {
  // renderer defaults for nicer lighting/shadows
  if (renderer.value) {
    renderer.value.shadowMap.enabled = true
    renderer.value.shadowMap.type = PCFSoftShadowMap
  }

  // tune directional light shadow camera if available
  if (sunRef.value) {
    const s = sunRef.value
    s.castShadow = true
    s.shadow.autoUpdate = true
    s.shadow.camera.left = -100
    s.shadow.camera.right = 100
    s.shadow.camera.top = 100
    s.shadow.camera.bottom = -100
    s.shadow.camera.near = 0.1
    s.shadow.camera.far = 500
    s.shadow.mapSize.width = 2048
    s.shadow.mapSize.height = 2048
  }

  // content
  createTerrain()
  createInstancedForest(700, 110)

  // fog must patch after content too
  setupFogAndControls()
  fog.patchScene()

})

const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed }) => {
  if (fog) fog.updateTime(elapsed)
})
</script>
<template>
  <TresAmbientLight :intensity="0.6" color="#999999" />
  <TresDirectionalLight ref="sunRef" :position="[50, 100, 50]" :intensity="1" cast-shadow />
</template>
