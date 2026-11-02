// Furnished room sets for the home page. Each item is a catalog product with a
// configuration, placed in metres. Pieces stay at true scale, so a room reads right.
import * as THREE from 'three'
import { byId, priceOf } from '../data/products.js'
import { buildProduct } from './models.js'
import { mat } from './materials.js'
import { toHash } from '../route.js'

const item = (id, cfg, x, z, rotY = 0, y = 0) => ({ id, cfg: { color: 0, finish: 0, option: 0, ...cfg }, x, y, z, rotY })

export const ROOMS = [
  {
    id: 'living',
    name: 'Living room',
    rug: { w: 3.2, d: 2.4, z: 0.55, color: '#C9BFAE' },
    items: [
      item('haven', { color: 0, finish: 1 }, 0, 0),
      item('orb', { finish: 0, option: 1 }, 0.55, 1.35),
      item('tide', { color: 1, option: 0 }, 0.4, 1.35, 0, 0.4),
      item('arc', { color: 1, finish: 1 }, 2.15, -0.15, Math.PI),
      item('fold', { color: 1, finish: 1 }, -2.05, -0.35, Math.PI / 2),
    ],
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    rug: { w: 2.8, d: 2.0, z: 0.7, color: '#B9B3A6' },
    items: [
      item('rest', { color: 2, finish: 1 }, 0, 0),
      item('plinth', { finish: 1 }, -1.25, -0.8),
      item('plinth', { finish: 1 }, 1.25, -0.8),
      item('halo', { color: 1, finish: 0 }, -1.25, -0.8, 0, 0.5),
      item('halo', { color: 1, finish: 0 }, 1.25, -0.8, 0, 0.5),
    ],
  },
  {
    id: 'study',
    name: 'Study',
    rug: { w: 2.0, d: 1.6, z: 0.4, color: '#A9A79C' },
    items: [
      item('atelier', { color: 1, finish: 1 }, 0, 0),
      item('arlo', { color: 5, option: 1 }, 0.15, 0.62, Math.PI),
      item('halo', { color: 0, option: 0 }, 0.45, -0.12, 0, 0.75),
      item('fold', { color: 2 }, 1.15, -0.1),
    ],
  },
  {
    id: 'dining',
    name: 'Dining',
    rug: { w: 3.2, d: 2.4, z: 0, color: '#C2B8A6' },
    items: [
      item('slab', { finish: 1, option: 1 }, 0, 0),
      ...[-0.65, 0, 0.65].flatMap((x) => [item('arlo', { color: 1, finish: 1 }, x, 0.62, Math.PI), item('arlo', { color: 1, finish: 1 }, x, -0.62)]),
      item('tide', { color: 0, option: 2 }, 0, 0, 0, 0.75),
    ],
  },
]

export function buildRoom(room) {
  const group = new THREE.Group()
  const rug = new THREE.Mesh(new THREE.BoxGeometry(room.rug.w, 0.012, room.rug.d), mat('fabric', room.rug.color))
  rug.position.set(0, 0.006, room.rug.z)
  rug.receiveShadow = true
  group.add(rug)
  for (const it of room.items) {
    const m = buildProduct(byId[it.id], it.cfg)
    m.position.set(it.x, it.y, it.z)
    m.rotation.y = it.rotY
    group.add(m)
  }
  return group
}

// The distinct pieces in a room, with how many of each, for "Add the room to cart".
export function roomLines(room) {
  const lines = new Map()
  for (const it of room.items) {
    const key = toHash(byId[it.id], it.cfg)
    const line = lines.get(key) ?? { key, product: byId[it.id], cfg: it.cfg, qty: 0 }
    line.qty++
    lines.set(key, line)
  }
  return [...lines.values()]
}

export const roomTotal = (room) => roomLines(room).reduce((n, l) => n + priceOf(l.product, l.cfg) * l.qty, 0)
