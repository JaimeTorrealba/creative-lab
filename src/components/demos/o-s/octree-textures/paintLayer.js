import { DataTexture, NearestFilter, RGBAFormat, UnsignedByteType, Vector3 } from 'three'
import { findLeafAtPoint, forEachLeafInSphere } from './octree'

export const hexToSrgbBytes = (hex) => {
  const packed = parseInt(hex.replace('#', ''), 16)
  return [(packed >> 16) & 255, (packed >> 8) & 255, packed & 255]
}

const smoothstep = (edge0, edge1, x) => {
  const t = Math.min(Math.max((x - edge0) / Math.max(edge1 - edge0, 1e-6), 0), 1)
  return t * t * (3 - 2 * t)
}

const createPaintTexture = (width, height) => {
  const texture = new DataTexture(new Uint8Array(width * height * 4), width, height, RGBAFormat, UnsignedByteType)
  texture.minFilter = NearestFilter
  texture.magFilter = NearestFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}

// Paint lives next to the liquid: one RGBA texel per leaf, at the leaf's index (37.4 layout).
// rgb = sRGB colour, a = coverage over the dough. The CPU keeps float copies (the "CPU copy of
// the tree" of 37.3) so soft brushes don't stall on 8-bit rounding.
export const createPaintLayer = ({ tree, tables, frame, previous }) => {
  const texture = createPaintTexture(tables.width, tables.height)
  const bytes = texture.image.data
  const colors = new Float32Array(tree.leafCount * 4)
  const scratch = new Vector3()
  let dirty = true

  const writeTexel = (leafId) => {
    for (let channel = 0; channel < 4; channel++) {
      const value = colors[leafId * 4 + channel]
      bytes[leafId * 4 + channel] = Math.round(channel === 3 ? value * 255 : value)
    }
    dirty = true
  }

  // After a resolution change each new leaf copies the old leaf that contains its centre.
  const inheritPaint = () => {
    for (let leafId = 0; leafId < tree.leafCount; leafId++) {
      scratch.fromArray(tree.leafCoords, leafId * 3).addScalar(0.5).divideScalar(tree.resolution)
      const oldLeaf = findLeafAtPoint(previous.tree, scratch)
      if (oldLeaf < 0) continue
      colors.set(previous.colors.subarray(oldLeaf * 4, oldLeaf * 4 + 4), leafId * 4)
      writeTexel(leafId)
    }
  }

  // One dab of the spherical brush of 37.3: each leaf in the sphere moves toward the paint with
  // a weight that falls off from the centre. Erasing fades the coverage back to the dough.
  const paintDab = (localPoint, { radius, opacity, hardness, color, erase }) => {
    const center = frame.toOctreeSpace(localPoint, scratch)
    const octreeRadius = radius * frame.scale
    forEachLeafInSphere(tree, center, octreeRadius, (leafId, distance) => {
      const weight = opacity * (1 - smoothstep(hardness * octreeRadius, octreeRadius, distance))
      if (weight <= 0) return
      const base = leafId * 4
      const coverage = colors[base + 3]
      if (erase) {
        colors[base + 3] = coverage * (1 - weight)
      } else {
        const colorWeight = coverage < 1e-3 ? 1 : weight
        for (let channel = 0; channel < 3; channel++) {
          colors[base + channel] += (color[channel] - colors[base + channel]) * colorWeight
        }
        colors[base + 3] = coverage + (1 - coverage) * weight
      }
      writeTexel(leafId)
    })
  }

  const clearPaint = () => {
    colors.fill(0)
    bytes.fill(0)
    dirty = true
  }

  const flush = () => {
    if (!dirty) return
    texture.needsUpdate = true
    dirty = false
  }

  if (previous) inheritPaint()

  return {
    texture,
    paintDab,
    clearPaint,
    flush,
    snapshot: () => ({ tree, colors }),
    dispose: () => texture.dispose()
  }
}
