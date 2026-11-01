// Physically based materials with procedural canvas textures, so the whole catalog
// ships without a single image or model file. Materials are cached and shared.
import * as THREE from 'three'

const SIZE = 512

// Small seeded RNG so textures look the same on every load.
function rng(seed) {
  return () => (seed = (seed * 16807) % 2147483647) / 2147483647
}

const textures = new Map()
function canvasTexture(key, draw, repeat = 1) {
  if (textures.has(key)) return textures.get(key)
  const c = document.createElement('canvas')
  c.width = c.height = SIZE
  draw(c.getContext('2d'), SIZE)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(repeat, repeat)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  textures.set(key, t)
  return t
}

// Wood grain: wavy strokes whose period divides the canvas, so the texture tiles.
const wood = (base, grain) => (g, s) => {
  const r = rng(11)
  g.fillStyle = base
  g.fillRect(0, 0, s, s)
  g.strokeStyle = grain
  for (let i = 0; i < 160; i++) {
    const y = r() * s
    const amp = 3 + r() * 7
    const phase = r() * Math.PI * 2
    g.globalAlpha = 0.06 + r() * 0.2
    g.lineWidth = 0.6 + r() * 2.4
    g.beginPath()
    for (let x = 0; x <= s; x += 8) {
      const t = (x / s) * Math.PI * 2
      g.lineTo(x, y + Math.sin(t * 2 + phase) * amp + Math.sin(t * 9 + i) * 1.2)
    }
    g.stroke()
  }
  g.globalAlpha = 1
}

// Woven fabric: a light crosshatch that the material colour tints.
const fabric = (g, s) => {
  const r = rng(5)
  g.fillStyle = '#ffffff'
  g.fillRect(0, 0, s, s)
  for (let i = 0; i < s; i += 4) {
    g.fillStyle = `rgba(0,0,0,${0.05 + r() * 0.05})`
    g.fillRect(0, i, s, 1.5)
    g.fillStyle = `rgba(0,0,0,${0.03 + r() * 0.04})`
    g.fillRect(i, 0, 1.5, s)
  }
  for (let i = 0; i < 3000; i++) {
    g.fillStyle = `rgba(0,0,0,${r() * 0.08})`
    g.fillRect(r() * s, r() * s, 2, 2)
  }
}

// Stone: speckle plus optional veins (marble) or pits (travertine).
const stone = (base, fleck, veins) => (g, s) => {
  const r = rng(23)
  g.fillStyle = base
  g.fillRect(0, 0, s, s)
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = fleck
    g.globalAlpha = r() * 0.12
    g.fillRect(r() * s, r() * s, 1 + r() * 3, 1 + r() * 2)
  }
  g.strokeStyle = fleck
  for (let i = 0; i < (veins ? 14 : 40); i++) {
    g.globalAlpha = veins ? 0.15 + r() * 0.25 : 0.12
    g.lineWidth = veins ? 0.5 + r() * 2 : 1 + r() * 3
    g.beginPath()
    let x = r() * s
    let y = r() * s
    g.moveTo(x, y)
    const len = veins ? 30 : 3
    for (let k = 0; k < len; k++) {
      x += (r() - 0.3) * (veins ? 30 : 18)
      y += (r() - 0.5) * (veins ? 22 : 2)
      g.lineTo(x, y)
    }
    g.stroke()
  }
  g.globalAlpha = 1
}

const FINISHES = {
  oak: () => new THREE.MeshStandardMaterial({ map: canvasTexture('oak', wood('#C49562', '#6E4826')), roughness: 0.6 }),
  walnut: () => new THREE.MeshStandardMaterial({ map: canvasTexture('walnut', wood('#5E3C29', '#24140C')), roughness: 0.5 }),
  ash: () => new THREE.MeshStandardMaterial({ map: canvasTexture('ash', wood('#2C2A28', '#000000')), roughness: 0.55 }),
  steel: () => new THREE.MeshStandardMaterial({ color: '#C3C7C9', metalness: 1, roughness: 0.32 }),
  brass: () => new THREE.MeshStandardMaterial({ color: '#C9A15A', metalness: 1, roughness: 0.3 }),
  blacksteel: () => new THREE.MeshStandardMaterial({ color: '#27292B', metalness: 0.5, roughness: 0.45 }),
  travertine: () => new THREE.MeshStandardMaterial({ map: canvasTexture('trav', stone('#D9CCB4', '#8A7558', false)), roughness: 0.85 }),
  marble: () => new THREE.MeshPhysicalMaterial({ map: canvasTexture('marble', stone('#ECEAE5', '#6F7378', true)), roughness: 0.25, clearcoat: 0.4 }),
  // Colour-dependent surfaces:
  fabric: (hex) => new THREE.MeshStandardMaterial({ color: hex, map: canvasTexture('fabric', fabric, 3), roughness: 1 }),
  matte: (hex) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.8 }),
  gloss: (hex) => new THREE.MeshPhysicalMaterial({ color: hex, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08 }),
  paint: (hex) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.7 }),
}

const cache = new Map()
export function mat(key, hex = '#ffffff') {
  const id = key + hex
  if (!cache.has(id)) {
    const m = FINISHES[key](hex)
    m.name = id
    if (m.map) m.map.colorSpace = THREE.SRGBColorSpace
    cache.set(id, m)
  }
  return cache.get(id)
}
