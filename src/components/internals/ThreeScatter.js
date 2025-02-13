import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise'
import alea from 'alea';

/*
Base: geometry to scatter on
Mesh: mesh or meshes to scatter
Count: number of meshes to scatter
Options:
    precision: number of decimal places to round the random point to
    default random function: for faces? 0 - 1 range
*/

class ThreeScatter {
    constructor(base, mesh, count, options = {}) {
        this.base = base;
        this.mesh = mesh;
        this.count = count;
        this.scatterGroup = new THREE.Group();

        // options
        this.precision = options.precision ?? 2;

        const prng = alea(0, 1);
        this.noise = createNoise2D(prng);

        //internals
        this.faces = []; // global

        this.sample()
    }
    #generateRandomPointInTriangle(index) {
        const randomTriangle = this.faces[Math.floor(Math.random() * this.faces.length)];
        let r1 = Math.abs(+this.noise(index, 0).toFixed(this.precision));
        let r2 = Math.abs(+this.noise(0, index).toFixed(this.precision));
        if (r1 + r2 > 1) {
            r1 = 1 - r1;
            r2 = 1 - r2;
        }

        const v1 = randomTriangle.a;
        const v2 = randomTriangle.b;
        const v3 = randomTriangle.c;

        const randomPoint = {
            x: (1 - r1 - r2) * v1.x + r1 * v2.x + r2 * v3.x,
            y: (1 - r1 - r2) * v1.y + r1 * v2.y + r2 * v3.y,
            z: (1 - r1 - r2) * v1.z + r1 * v2.z + r2 * v3.z,
        };
        return randomPoint;
    }
    sample() {
        const _face = new THREE.Triangle(); // internal
        const positionAttribute = this.base.getAttribute('position'); // should be global
        const indexAttribute = this.base.index; // should be global
        const totalFaces = indexAttribute ? (indexAttribute.count / 3) : (positionAttribute.count / 3);

        // Extract faces from base model
        for (let i = 0; i < totalFaces; i++) {

            let i0 = 3 * i;
            let i1 = 3 * i + 1;
            let i2 = 3 * i + 2;

            if (indexAttribute) {

                i0 = indexAttribute.getX(i0);
                i1 = indexAttribute.getX(i1);
                i2 = indexAttribute.getX(i2);

            }

            _face.a.fromBufferAttribute(positionAttribute, i0);
            _face.b.fromBufferAttribute(positionAttribute, i1);
            _face.c.fromBufferAttribute(positionAttribute, i2);

            this.faces.push(_face.clone());

        }

        for (let i = 0; i < this.count; i++) {
            const randomPoint = this.#generateRandomPointInTriangle(i);

            let sampleMesh;
            if (Array.isArray(this.mesh)) {
                // This logic should change to add % of distribution
                const _i = i % this.mesh.length;
                sampleMesh = this.mesh[_i].clone();
            } else {
                sampleMesh = this.mesh.clone();
            }

            sampleMesh.position.set(randomPoint.x, randomPoint.y, randomPoint.z);

            this.scatterGroup.add(sampleMesh);
        }

        return this.scatterGroup


    }
    setSeeds(seed = 1) {
        this.noise = createNoise2D(alea(seed));
        this.scatterGroup.children.forEach((child, i) => {
            const randomPoint = this.#generateRandomPointInTriangle(i);
            child.position.set(randomPoint.x, randomPoint.y, randomPoint.z);
        })
    }
    setRotationX(rotation = 0, randomFn = () => 1) {
        this.scatterGroup.children.forEach((child) => {
            child.rotation.x = rotation * randomFn();
        })
    }
    setRotationY(rotation = 0, randomFn = () => 1) {
        this.scatterGroup.children.forEach((child) => {
            child.rotation.y = rotation * randomFn();
        })
    }
    setRotationZ(rotation = 0, randomFn = () => 1) {
        this.scatterGroup.children.forEach((child) => {
            child.rotation.z = rotation * randomFn();
        })
    }
    setScale(scale = 1, randomFn = () => 1) {
        this.scatterGroup.children.forEach((child) => {
            const randomNumber = scale * randomFn();
            child.scale.x = randomNumber;
            child.scale.y = randomNumber;
            child.scale.z = randomNumber;
        })
    }
}

export { ThreeScatter };