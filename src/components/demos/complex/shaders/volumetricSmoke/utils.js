import * as THREE from 'three';

export function createSeededRandom(seed) {
    return function () {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export class ImprovedNoise {
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

export function fbm(perlin, x, y, z, octaves, persistence, lacunarity) {
    let total = 0.0, frequency = 1.0, amplitude = 1.0, maxValue = 0.0;
    for (let i = 0; i < octaves; i++) {
        total += perlin.noise(x * frequency, y * frequency, z * frequency) * amplitude;
        maxValue += amplitude;
        amplitude *= persistence;
        frequency *= lacunarity;
    }
    return total / maxValue;
}

export function smoothstep(edge0, edge1, x) {
    const t = Math.max(0.0, Math.min(1.0, (x - edge0) / (edge1 - edge0)));
    return t * t * (3.0 - 2.0 * t);
}

export function createNoiseGeneratorFromPermutation(permTable) {
    const fade = (t) => t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
    const lerp = (t, a, b) => a + t * (b - a);
    const grad = (hash, x, y, z) => {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    };

    return function noise(p) {
        const P = new THREE.Vector3(Math.floor(p.x), Math.floor(p.y), Math.floor(p.z));
        const p_fract = p.clone().sub(P);
        const f = new THREE.Vector3(fade(p_fract.x), fade(p_fract.y), fade(p_fract.z));
        const xi = P.x & 255, yi = P.y & 255, zi = P.z & 255;
        const A = permTable[xi], B = permTable[(xi + 1) & 255];
        const AA = permTable[(A + yi) & 255], BA = permTable[(B + yi) & 255];
        const AB = permTable[(A + yi + 1) & 255], BB = permTable[(B + yi + 1) & 255];
        const AAA = permTable[(AA + zi) & 255], BAA = permTable[(BA + zi) & 255];
        const ABA = permTable[(AB + zi) & 255], BBA = permTable[(BB + zi) & 255];
        const AAB = permTable[(AA + zi + 1) & 255], BAB = permTable[(BA + zi + 1) & 255];
        const ABB = permTable[(AB + zi + 1) & 255], BBB = permTable[(BB + zi + 1) & 255];
        const g1 = grad(AAA, p_fract.x, p_fract.y, p_fract.z), g2 = grad(BAA, p_fract.x - 1, p_fract.y, p_fract.z);
        const g3 = grad(ABA, p_fract.x, p_fract.y - 1, p_fract.z), g4 = grad(BBA, p_fract.x - 1, p_fract.y - 1, p_fract.z);
        const g5 = grad(AAB, p_fract.x, p_fract.y, p_fract.z - 1), g6 = grad(BAB, p_fract.x - 1, p_fract.y, p_fract.z - 1);
        const g7 = grad(ABB, p_fract.x, p_fract.y - 1, p_fract.z - 1), g8 = grad(BBB, p_fract.x - 1, p_fract.y - 1, p_fract.z - 1);
        return lerp(f.z, lerp(f.y, lerp(f.x, g1, g2), lerp(f.x, g3, g4)), lerp(f.y, lerp(f.x, g5, g6), lerp(f.x, g7, g8)));
    };
}

export class VolumetricMaskController {
    constructor() {
        // Default parameters to control the mask's shape
        this.parameters = {
            seed: 1,
            raio: 0.52,                 // Radius
            achatamentoCima: 0.7,       // Flatten Top
            achatamentoBaixo: 0.3,      // Flatten Bottom
            achatamentoXpos: 0.9,       // Flatten X positive
            achatamentoXneg: 0.9,       // Flatten X negative
            achatamentoZpos: 0.9,       // Flatten Z positive
            achatamentoZneg: 0.9,       // Flatten Z negative
            maskSoftness: 0.17,
            forcaRuido: 0.05,           // Noise Strength
            frequenciaRuido: 2.7,       // Noise Frequency

            // Parameters for the new detail noise
            seedDetalhe: 10,                // Detail Seed
            forcaRuidoDetalhe: 0.036,       // Detail Noise Strength
            frequenciaRuidoDetalhe: 10.5,   // Detail Noise Frequency

            visualizeMask: false
        };

        this.noiseTexture = null;
        this.noiseGenerator = null;
        this.detailNoiseTexture = null;
        this.detailNoiseGenerator = null;
        this.uniforms = {}; // Object that will hold the uniforms for the shader.

        this.regenerateNoise(); // Generate the initial noise and 3D texture for deformation.
        this._createUniforms(); // Create the uniforms to be passed to the shader.
    }

    _createSeededRandom(seed) {
        return function () {
            let t = seed += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }

    // Creates and populates the `uniforms` object with parameter values.
    _createUniforms() {
        this.uniforms = {
            u_mask_raio: { value: this.parameters.raio },
            u_mask_achatamentoCima: { value: this.parameters.achatamentoCima },
            u_mask_achatamentoBaixo: { value: this.parameters.achatamentoBaixo },
            u_mask_achatamentoXpos: { value: this.parameters.achatamentoXpos },
            u_mask_achatamentoXneg: { value: this.parameters.achatamentoXneg },
            u_mask_achatamentoZpos: { value: this.parameters.achatamentoZpos },
            u_mask_achatamentoZneg: { value: this.parameters.achatamentoZneg },
            u_mask_softness: { value: this.parameters.maskSoftness },
            u_mask_forcaRuido: { value: this.parameters.forcaRuido },
            u_mask_noiseMap: { value: this.noiseTexture },
            u_mask_forcaRuidoDetalhe: { value: this.parameters.forcaRuidoDetalhe },
            u_mask_noiseDetailMap: { value: this.detailNoiseTexture },
            u_mask_visualize: { value: this.parameters.visualizeMask }
        };
    }

    // Sets up the Perlin noise generator with a specific seed.
    setupNoiseGenerator() {
        const seededRandom = this._createSeededRandom(this.parameters.seed);
        const p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) { p[i] = i; }
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(seededRandom() * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }
        const permTable = new Uint8Array(512);
        for (let i = 0; i < 256; i++) { permTable[i] = permTable[i + 256] = p[i]; }
        this.noiseGenerator = createNoiseGeneratorFromPermutation(permTable);
    }

    // Generates the 3D texture used in the shader to deform the sphere.
    updateNoiseMaskTexture() {
        const noiseMaskSize = 128; // Resolution of the mask's noise texture.
        const noiseMaskData = new Uint8Array(noiseMaskSize * noiseMaskSize * noiseMaskSize);
        const directionVector = new THREE.Vector3();

        for (let z = 0; z < noiseMaskSize; z++) {
            for (let y = 0; y < noiseMaskSize; y++) {
                for (let x = 0; x < noiseMaskSize; x++) {
                    directionVector.set(
                        (x / (noiseMaskSize - 1)) * 2.0 - 1.0,
                        (y / (noiseMaskSize - 1)) * 2.0 - 1.0,
                        (z / (noiseMaskSize - 1)) * 2.0 - 1.0
                    );

                    if (directionVector.lengthSq() > 0) {
                        directionVector.normalize();
                        const noiseValue = this.noiseGenerator(directionVector.multiplyScalar(this.parameters.frequenciaRuido));
                        noiseMaskData[(z * noiseMaskSize * noiseMaskSize) + (y * noiseMaskSize) + x] = noiseValue * 128 + 128;
                    }
                }
            }
        }

        if (!this.noiseTexture) {
            this.noiseTexture = new THREE.Data3DTexture(noiseMaskData, noiseMaskSize, noiseMaskSize, noiseMaskSize);
            this.noiseTexture.format = THREE.RedFormat;
            this.noiseTexture.minFilter = THREE.LinearFilter;
            this.noiseTexture.magFilter = THREE.LinearFilter;
            this.noiseTexture.unpackAlignment = 1;
        } else {
            this.noiseTexture.image.data.set(noiseMaskData);
        }
        this.noiseTexture.needsUpdate = true;
    }

    // --- METHODS FOR DETAIL NOISE ---
    // These methods are copies of the main noise methods, but adapted
    // to use the "detail" parameters.

    setupDetailNoiseGenerator() {
        // Uses the "seedDetalhe" to create a different noise generator from the main one.
        const seededRandom = this._createSeededRandom(this.parameters.seedDetalhe);
        const p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) { p[i] = i; }
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(seededRandom() * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }
        const permTable = new Uint8Array(512);
        for (let i = 0; i < 256; i++) { permTable[i] = permTable[i + 256] = p[i]; }
        this.detailNoiseGenerator = createNoiseGeneratorFromPermutation(permTable);
    }

    updateDetailNoiseMaskTexture() {
        // Generates the 3D texture for details, using "frequenciaRuidoDetalhe".
        const noiseMaskSize = 128;
        const noiseMaskData = new Uint8Array(noiseMaskSize * noiseMaskSize * noiseMaskSize);
        const directionVector = new THREE.Vector3();

        for (let z = 0; z < noiseMaskSize; z++) {
            for (let y = 0; y < noiseMaskSize; y++) {
                for (let x = 0; x < noiseMaskSize; x++) {
                    directionVector.set(
                        (x / (noiseMaskSize - 1)) * 2.0 - 1.0,
                        (y / (noiseMaskSize - 1)) * 2.0 - 1.0,
                        (z / (noiseMaskSize - 1)) * 2.0 - 1.0
                    );

                    if (directionVector.lengthSq() > 0) {
                        directionVector.normalize();
                        // HERE is the main difference: uses the detail generator and frequency.
                        const noiseValue = this.detailNoiseGenerator(directionVector.multiplyScalar(this.parameters.frequenciaRuidoDetalhe));
                        noiseMaskData[(z * noiseMaskSize * noiseMaskSize) + (y * noiseMaskSize) + x] = noiseValue * 128 + 128;
                    }
                }
            }
        }

        // Create or update the detail texture.
        if (!this.detailNoiseTexture) {
            this.detailNoiseTexture = new THREE.Data3DTexture(noiseMaskData, noiseMaskSize, noiseMaskSize, noiseMaskSize);
            this.detailNoiseTexture.format = THREE.RedFormat;
            this.detailNoiseTexture.minFilter = THREE.LinearFilter;
            this.detailNoiseTexture.magFilter = THREE.LinearFilter;
            this.detailNoiseTexture.unpackAlignment = 1;
            // Important: pass the new texture to the uniform.
            if (this.uniforms.u_mask_noiseDetailMap) {
                this.uniforms.u_mask_noiseDetailMap.value = this.detailNoiseTexture;
            }
        } else {
            this.detailNoiseTexture.image.data.set(noiseMaskData);
        }
        this.detailNoiseTexture.needsUpdate = true;
    }

    // NEW: Specific function to regenerate only the detail noise.
    // This is more efficient as it doesn't recalculate the main noise unnecessarily.
    regenerateDetailNoise() {
        this.setupDetailNoiseGenerator();
        this.updateDetailNoiseMaskTexture();
    }

    // Public function to regenerate noise when seed or frequency changes.
    regenerateNoise() {
        // Main Noise
        this.setupNoiseGenerator();
        this.updateNoiseMaskTexture();

        // Also generate the detail noise.
        this.regenerateDetailNoise();
    }
}



