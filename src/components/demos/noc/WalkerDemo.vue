<script setup>
import * as THREE from "three";
import { onMounted, shallowRef, reactive } from "vue";
import { Pane } from "tweakpane";

//TODO: add other random funtions like, noise and randomGaussian

const options = reactive({
  walkerCount: 150,
  directions: 4,
  randomFn: Math.random,
});

const pane = new Pane();
const wrapperRef = shallowRef(null);

class Walker {
  constructor() {
    const planeGeometry = new THREE.PlaneGeometry(1, 1);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: "#222" });
    this.mesh = new THREE.Mesh(planeGeometry, planeMaterial);
    this.mesh.rotation.set(-Math.PI / 2, 0, 0);
    this.mesh.position.y = 0.1;
  }

  move() {
    const lastChildren = wrapperRef.value.children;
    const lastMesh = lastChildren.at(-1);
    const lastPos = lastMesh?.position || new THREE.Vector3(0, 0, 0);

    // Copy last position to current mesh
    this.mesh.position.copy(lastPos);

    if (options.directions === 4) {
      const random = options.randomFn();
      if (random < 0.25) this.mesh.position.x += 1;
      else if (random < 0.5) this.mesh.position.x -= 1;
      else if (random < 0.75) this.mesh.position.z += 1;
      else this.mesh.position.z -= 1;
    }
    if (options.directions === 8) {
      const random = options.randomFn();
      if (random < 0.125) this.mesh.position.x += 1;
      else if (random < 0.25) {
        this.mesh.position.x += 1;
        this.mesh.position.z += 1;
      } else if (random < 0.375) this.mesh.position.z += 1;
      else if (random < 0.5) {
        this.mesh.position.x -= 1;
        this.mesh.position.z += 1;
      } else if (random < 0.625) this.mesh.position.x -= 1;
      else if (random < 0.75) {
        this.mesh.position.x -= 1;
        this.mesh.position.z -= 1;
      } else if (random < 0.875) this.mesh.position.z -= 1;
      else {
        this.mesh.position.x += 1;
        this.mesh.position.z -= 1;
      }
    }
    wrapperRef.value.add(this.mesh);
  }
}

const startWalkers = () => {
  for (let i = 0; i < options.walkerCount; i++) {
    const walker = new Walker();
    walker.move();
  }
};
const cleanWalkers = () => {
  if (wrapperRef.value) {
    wrapperRef.value.clear();
  }
};

onMounted(() => {
  startWalkers();
});

pane.addBinding(options, "walkerCount", {
  min: 10,
  max: 1000,
  step: 10,
});

pane.addBinding(options, "directions", {
  min: 4,
  max: 8,
  step: 4,
});

const btn = pane.addButton({ title: "Restart Walkers" });
btn.on("click", () => {
  cleanWalkers();
  startWalkers();
});
</script>
<template>
  <TresGroup ref="wrapperRef" />
  <TresGridHelper :position="[-0.5, 0, -0.5]" :args="[1000, 1000]" />
</template>
