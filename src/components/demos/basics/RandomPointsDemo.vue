<script setup>
import { shallowRef, watch } from 'vue'
import { Vector3, BufferGeometry } from 'three'
import PoissonDiskSampling from 'poisson-disk-sampling'
import Delaunator from 'delaunator'

const planeRef = shallowRef(null)
const SIZE = 5

watch(planeRef, (plane) => {
    const p = new PoissonDiskSampling({
      shape: [SIZE, SIZE],
      minDistance: 0.1,
      maxDistance: 0.3,
      tries: 10
    })
    const points = p.fill()

    const points3D = points.map((p) => {
      return new Vector3(p[0], 0, p[1])
    })

    const indexDelaunay = Delaunator.from(points.map((p) => [p[0], p[1]]))

    const geometry = new BufferGeometry().setFromPoints(points3D)

    let meshIndex = []
    for (let i = 0; i < indexDelaunay.triangles.length; i += 3) {
      meshIndex.push(indexDelaunay.triangles[i])
      meshIndex.push(indexDelaunay.triangles[i + 1])
      meshIndex.push(indexDelaunay.triangles[i + 2])
    }

    geometry.setIndex(meshIndex)
    geometry.center()

    plane.geometry.dispose()
    plane.geometry = geometry

})
</script>
<template>
    <TresMesh ref="planeRef" :position="[0,0, 0]">
        <TresPlaneGeometry :args="[10, 10, 50, 50]" />
        <TresShaderMaterial wireframe />
      </TresMesh>
</template>