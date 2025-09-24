onmessage = ({ data: p }) => {
  function fbm(perlin, x, y, z, octaves, persistence, lacunarity) {
    let total = 0.0, frequency = 1.0, amplitude = 1.0, maxValue = 0.0;
    for (let i = 0; i < octaves; i++) {
      total += perlin.noise(x * frequency, y * frequency, z * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }
    return total / maxValue;
  }

  function createSeededRandom(seed) {
    return function () {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
  }

  class ImprovedNoise {
    constructor(seededRandom = Math.random) {
      const p = new Uint8Array(256);
      for (let i = 0; i < 256; i++) { p[i] = i; }
      for (let i = 255; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1));
        [p[i], p[j]] = [p[j], p[i]];
      }
      this.p = new Uint8Array(512);
      for (let i = 0; i < 256; i++) { this.p[i] = this.p[i + 256] = p[i]; }
    }
    noise(x, y, z) {
      const p = this.p;
      const xi = Math.floor(x) & 255; const yi = Math.floor(y) & 255; const zi = Math.floor(z) & 255;
      const xf = x - Math.floor(x); const yf = y - Math.floor(y); const zf = z - Math.floor(z);
      const u = this.fade(xf); const v = this.fade(yf); const w = this.fade(zf);
      const aaa = p[p[p[xi] + yi] + zi]; const aab = p[p[p[xi] + yi] + zi + 1];
      const aba = p[p[p[xi] + yi + 1] + zi]; const abb = p[p[p[xi] + yi + 1] + zi + 1];
      const baa = p[p[p[xi + 1] + yi] + zi]; const bab = p[p[p[xi + 1] + yi] + zi + 1];
      const bba = p[p[p[xi + 1] + yi + 1] + zi]; const bbb = p[p[p[xi + 1] + yi + 1] + zi + 1];
      return this.lerp(w, this.lerp(v, this.lerp(u, this.grad(p[aaa], xf, yf, zf), this.grad(p[baa], xf - 1, yf, zf)),
        this.lerp(u, this.grad(p[aba], xf, yf - 1, zf), this.grad(p[bba], xf - 1, yf - 1, zf))),
        this.lerp(v, this.lerp(u, this.grad(p[aab], xf, yf, zf - 1), this.grad(p[bab], xf - 1, yf, zf - 1)),
          this.lerp(u, this.grad(p[abb], xf, yf - 1, zf - 1), this.grad(p[bbb], xf - 1, yf - 1, zf - 1))));
    }
    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    lerp(t, a, b) { return a + t * (b - a); }
    grad(hash, x, y, z) {
      const h = hash & 15;
      const u = h < 8 ? x : y;
      const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
      return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
  }

  function smoothstep(edge0, edge1, x) {
    const t = Math.max(0.0, Math.min(1.0, (x - edge0) / (edge1 - edge0)));
    return t * t * (3.0 - 2.0 * t);
  }



  const size = p.textureSize
  const data = new Uint8Array(size * size * size)
  const seededRandom = createSeededRandom(p.seed)
  const perlin = new ImprovedNoise(seededRandom)
  let index = 0

  for (let z = 0; z < size; z++) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const nx = x / (size - 1)
        const ny = y / (size - 1)
        const nz = z / (size - 1)

        const base_x = nx * p.noiseScale + p.seed
        const base_y = ny * p.noiseScale + p.seed
        const base_z = nz * p.noiseScale + p.seed
        const scale = p.noiseScale
        const fbmArgs = [p.octaves, p.persistence, p.lacunarity]

        const n1 = fbm(perlin, base_x, base_y, base_z, ...fbmArgs)
        const n2 = fbm(perlin, base_x - scale, base_y, base_z, ...fbmArgs)
        const n3 = fbm(perlin, base_x, base_y - scale, base_z, ...fbmArgs)
        const n4 = fbm(perlin, base_x, base_y, base_z - scale, ...fbmArgs)
        const n5 = fbm(perlin, base_x - scale, base_y - scale, base_z, ...fbmArgs)
        const n6 = fbm(perlin, base_x - scale, base_y, base_z - scale, ...fbmArgs)
        const n7 = fbm(perlin, base_x, base_y - scale, base_z - scale, ...fbmArgs)
        const n8 = fbm(perlin, base_x - scale, base_y - scale, base_z - scale, ...fbmArgs)

        const wx = 1 - nx
        const wy = 1 - ny
        const wz = 1 - nz

        let noiseValue =
          n1 * wx * wy * wz +
          n2 * nx * wy * wz +
          n3 * wx * ny * wz +
          n4 * wx * wy * nz +
          n5 * nx * ny * wz +
          n6 * nx * wy * nz +
          n7 * wx * ny * nz +
          n8 * nx * ny * nz

        noiseValue = (noiseValue + 1.0) / 2.0
        const finalValue = Math.pow(noiseValue, p.noiseIntensity)
        const density = smoothstep(
          p.cloudCoverage - p.cloudSoftness,
          p.cloudCoverage + p.cloudSoftness,
          finalValue,
        )

        data[index++] = Math.floor(density * 255)
      }
    }
  }
  postMessage(data);
};