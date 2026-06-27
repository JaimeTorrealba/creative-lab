<script setup>
import { reactive, shallowRef, watch, onUnmounted } from "vue";
import { useLoop, useTres } from "@tresjs/core";
import { Text3D } from "@tresjs/cientos";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Vector3, Triangle } from "three";
import { Pane } from "tweakpane";

const fontPath =
  "https://raw.githubusercontent.com/Tresjs/assets/main/fonts/FiraCodeRegular.json";

const meshRef = shallowRef();

const { camera } = useTres();

const vertices = reactive([]);
const faces = reactive([]);
const facesCentroid = reactive([]);
const edgesMidpoint = reactive([]);

watch(meshRef, (mesh) => {
  extractFaces(mesh.geometry);
  faces.forEach((face) => {
    facesCentroid.push(face.getMidpoint(new Vector3()).multiplyScalar(1.1));
  });

  const originalVertexCount = mesh.geometry.attributes.position.count;
  const mergedGeometry = mergeVertices(mesh.geometry, 2.5);
  const mergedVertexCount = mergedGeometry.attributes.position.count;
  console.log("Merged vertex count:", mergedVertexCount);
  console.log("Vertices removed:", originalVertexCount - mergedVertexCount);
  // Calculate vertex positions
  for (let i = 0; i < mergedVertexCount; i++) {
    const x = mesh.geometry.attributes.position.getX(i);
    const y = mesh.geometry.attributes.position.getY(i);
    const z = mesh.geometry.attributes.position.getZ(i);
    vertices.push(new Vector3(x, y, z).multiplyScalar(1.1));
  }
  extractEdges(mergedGeometry);
});

// Edges
const extractEdges = (geometry) => {
  const positionAttribute = geometry.getAttribute('position')
  const indexAttribute = geometry.index
  if (!indexAttribute) return
  const seen = new Set()
  const totalFaces = indexAttribute.count / 3
  for (let i = 0; i < totalFaces; i++) {
    const i0 = indexAttribute.getX(3 * i)
    const i1 = indexAttribute.getX(3 * i + 1)
    const i2 = indexAttribute.getX(3 * i + 2)
    for (const [a, b] of [[i0, i1], [i1, i2], [i0, i2]]) {
      const key = `${Math.min(a, b)}_${Math.max(a, b)}`
      if (!seen.has(key)) {
        seen.add(key)
        const va = new Vector3().fromBufferAttribute(positionAttribute, a)
        const vb = new Vector3().fromBufferAttribute(positionAttribute, b)
        edgesMidpoint.push(new Vector3().addVectors(va, vb).multiplyScalar(0.5).multiplyScalar(1.1))
      }
    }
  }
}

// Faces
const extractFaces = (geometry) => {
        const _face = new Triangle();
        const positionAttribute = geometry.getAttribute('position');
        const indexAttribute = geometry.index;
        const totalFaces = indexAttribute ? (indexAttribute.count / 3) : (positionAttribute.count / 3);
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

            faces.push(_face.clone());

        }
    }

const pane = new Pane();
const options = reactive({
  showVertexLabels: true,
  showFaceLabels: true,
  showEdgeLabels: true,
  wireframe: false,
});

pane.addBinding(options, "showVertexLabels");
pane.addBinding(options, "showFaceLabels");
pane.addBinding(options, "showEdgeLabels");
pane.addBinding(options, "wireframe");

onUnmounted(() => pane?.dispose())

const verticesRef = shallowRef();
const { onBeforeRender } = useLoop();

onBeforeRender(() => {
  if (verticesRef.value) {
    verticesRef.value.forEach((text3D) => {
      if (text3D.instance) {
        text3D.instance.lookAt(camera.value.position);
      }
    });
  }
});
</script>
<template>
  <TresMesh ref="meshRef">
    <TresBoxGeometry :args="[3, 3, 3]" />
    <TresMeshStandardMaterial :wireframe="options.wireframe" />
  </TresMesh>
  <Suspense>
    <Text3D
      ref="verticesRef"
      :visible="options.showLabels"
      v-for="(vertex, index) in vertices"
      :text="`V${index}`"
      :key="index"
      :position="vertex"
      :font="fontPath"
      :size="0.15"
    />
  </Suspense>
  <Suspense>
    <Text3D
      ref="verticesRef"
      :visible="options.showFaceLabels"
      v-for="(_, index) in facesCentroid"
      :text="`F${index}`"
      :key="index"
      :position="facesCentroid[index]"
      :font="fontPath"
      :size="0.15"
    />
  </Suspense>
  <Suspense>
    <Text3D
      ref="verticesRef"
      :visible="options.showEdgeLabels"
      v-for="(_, index) in edgesMidpoint"
      :text="`E${index}`"
      :key="index"
      :position="edgesMidpoint[index]"
      :font="fontPath"
      :size="0.15"
    />
  </Suspense>
</template>
