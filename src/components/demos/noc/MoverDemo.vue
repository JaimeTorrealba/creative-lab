<script setup>
import { useLoop } from "@tresjs/core";
import { useMouse, useWindowSize } from "@vueuse/core";
import { Vector2 } from "three";
import { shallowRef, reactive } from "vue";
import { Pane } from "tweakpane";

const { width, height } = useWindowSize();
const { x, y } = useMouse();
const sphereRef = shallowRef(null);

function clampVector(vector, min, max) {
  vector.x = Math.max(min, Math.min(max, vector.x));
  vector.y = Math.max(min, Math.min(max, vector.y));
  vector.z = Math.max(min, Math.min(max, vector.z)); // if 3D
  return vector;
}

class BasicMover {
  constructor() {
    this.position = new Vector2(
      Math.random() * width.value,
      Math.random() * height.value
    );
    this.velocity = new Vector2((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
    this.worldPosition = new Vector2();
  }
  update() {
    this.position.add(this.velocity);
    this.updateWorldPosition();
  }
  checkEdges() {
    // Wrap within screen-space bounds [0, width] and [0, height]
    if (this.position.x > width.value) {
      this.position.x = 0;
    } else if (this.position.x < 0) {
      this.position.x = width.value;
    }
    if (this.position.y > height.value) {
      this.position.y = 0;
    } else if (this.position.y < 0) {
      this.position.y = height.value;
    }
  }

  // Convert screen space [0..width],[0..height] to centered Three.js world space
  updateWorldPosition() {
    const centeredX = this.position.x - width.value / 2;
    const centeredY = height.value / 2 - this.position.y; // flip Y so +Y is up
    this.worldPosition.set(centeredX, centeredY);
  }
}
class SimpleAccMover extends BasicMover {
  constructor() {
    super();
    this.acceleration = new Vector2(0.001, 0.001);
  }
  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.updateWorldPosition();
  }
}
class RandomAccMover extends BasicMover {
  constructor() {
    super();
    this.acceleration = new Vector2(0, 0);
  }
  update() {
    this.velocity.add(new Vector2(Math.random() - 0.5, Math.random() - 0.5));
    clampVector(this.velocity, -5, 5);
    this.position.add(this.velocity);
    this.updateWorldPosition();
  }
}
class FollowingMouseMover extends BasicMover {
  constructor() {
    super();
    this.acceleration = new Vector2(0, 0);
    this.mousePos = new Vector2(x.value, y.value);
  }
  update() {
    this.mousePos.set(x.value, y.value);
    this.position.lerp(this.mousePos, 0.05);
    this.updateWorldPosition();
  }
}
class MouseDirectionMover extends BasicMover {
  constructor() {
    super();
    this.acceleration = new Vector2(0, 0);
    this.mousePos = new Vector2(x.value, y.value);
  }
  update() {
    this.mousePos.set(x.value, y.value);
    const direction = this.mousePos.clone().sub(this.position).normalize();
    this.velocity.add(direction.multiplyScalar(0.5));
    clampVector(this.velocity, -5, 5);
    this.position.add(this.velocity);
    this.updateWorldPosition();
  }
}

let mover = new BasicMover();

const options = reactive({
  moverType: "BasicMover",
});

const pane = new Pane();

pane
  .addBinding(options, "moverType", {
    options: {
      "Basic Mover": "BasicMover",
      "Simple Acc Mover": "SimpleAccMover",
      "Random Acc Mover": "RandomAccMover",
      "Following Mouse Mover": "FollowingMouseMover",
      "Mouse Direction Mover": "MouseDirectionMover",
    },
    label: "Mover Type",
  })
  .on("change", () => {
    // Reset mover when type changes
    mover = new moverClasses[options.moverType]();
  });

const moverClasses = {
  BasicMover,
  SimpleAccMover,
  RandomAccMover,
  MouseDirectionMover,
  FollowingMouseMover,
};

const { onBeforeRender } = useLoop();

onBeforeRender(() => {
  mover.update();
  mover.checkEdges();
  if (sphereRef.value) {
    sphereRef.value.position.x = mover.worldPosition.x;
    sphereRef.value.position.y = mover.worldPosition.y;
  }
});
</script>
<template>
  <TresMesh ref="sphereRef">
    <TresSphereGeometry :args="[150, 48]" />
    <TresMeshLambertMaterial :color="'#f7f7f7'" :shininess="100" />
  </TresMesh>
</template>
