import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise'
import alea from 'alea';

class ThreeScatter {
    constructor(base, mesh, count, options = {}) {
        this.base = base;
        this.mesh = mesh;
        this.count = count;
        this.scatterGroup = new THREE.Group();

        // options
        this.allRotation = options.allRotation ?? new THREE.Vector3(0, 0, 0);
        const prng = alea(options.seeds ?? Math.random());
        this.noise = createNoise3D(prng);

        //Internals TODO: delete
        this.multiplier = 5;


        this.sample()
    }
    sample() {
        for ( let i = 0; i < this.count; i ++ ) {
            const x = this.noise(i, 0, 0) * this.multiplier; // Adjust range based on your surface size
            const y = 0; // Needs to be replaced
            const z = this.noise(0, 0, i) * this.multiplier;

            const sampleMesh = this.mesh.clone();
            sampleMesh.position.set( x, y, z );

            this.scatterGroup.add( sampleMesh);
        }
        this.setRotationX();
        this.setRotationY();
        this.setRotationZ();

        return this.scatterGroup


    }
    setSeeds(seed) {
        this.noise = createNoise3D(alea(seed));
        this.scatterGroup.children.forEach((child,i) => {
            child.position.x = this.noise(i, 0, 0) * this.multiplier;
            //child.position.y = this.noise(i, 0, 0);
            child.position.z = this.noise(0, 0, i) * this.multiplier;
        })
    }
    setRotationX(rotation = this.allRotation.x, randomFn = Math.random) {
        this.scatterGroup.children.forEach((child) => {
            child.rotation.x = rotation * randomFn();
        })
    }
    setRotationY(rotation = this.allRotation.y, randomFn = Math.random) {
        this.scatterGroup.children.forEach((child) => {
            child.rotation.y = rotation * randomFn();
        })
    }
    setRotationZ(rotation = this.allRotation.z, randomFn = Math.random) {
        this.scatterGroup.children.forEach((child) => {
            child.rotation.z = rotation * randomFn();
        })
    }
    // same for scale
}

export { ThreeScatter };