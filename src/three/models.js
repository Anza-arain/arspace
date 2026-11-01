// Procedural product models. Units are metres and every model stands on y = 0,
// so the same object is correct in the 3D viewer and at true scale in AR.
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mat } from './materials.js'

const V2 = THREE.Vector2

function mesh(geo, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, material)
  m.position.set(x, y, z)
  m.castShadow = true
  m.receiveShadow = true
  return m
}
const rbox = (w, h, d, r) => new RoundedBoxGeometry(w, h, d, 4, r)
const cyl = (rt, rb, h, seg = 48) => new THREE.CylinderGeometry(rt, rb, h, seg)

// A lathe profile closed at the base, with wall thickness for a hollow vessel.
function vessel(outer, wall) {
  const pts = [new V2(0, 0), ...outer]
  const inner = outer.slice(1).reverse().map((p) => new V2(Math.max(p.x - wall, 0.001), p.y))
  pts.push(...inner, new V2(0, wall))
  return new THREE.LatheGeometry(pts, 72)
}

function legs(group, finish, w, d, h, splay = 0.06) {
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const leg = mesh(cyl(0.018, 0.011, h, 20), finish, sx * w, h / 2, sz * d)
      leg.rotation.z = sx * splay
      leg.rotation.x = -sz * splay
      group.add(leg)
    }
}

function sled(group, finish, w, d, h) {
  for (const sx of [-1, 1]) {
    group.add(mesh(rbox(0.028, 0.022, d * 2 + 0.06, 0.008), finish, sx * w, 0.011, 0))
    for (const sz of [-1, 1]) group.add(mesh(cyl(0.012, 0.012, h, 16), finish, sx * w, h / 2, sz * d))
  }
}

const builders = {
  orbit(c) {
    const g = new THREE.Group()
    const frame = mat(c.finish.key)
    const cloth = mat('fabric', c.color.hex)
    if (c.option === 0) legs(g, frame, 0.3, 0.29, 0.26)
    else sled(g, mat('steel'), 0.33, 0.3, 0.25)
    g.add(mesh(rbox(0.72, 0.06, 0.72, 0.012), frame, 0, 0.27, 0))
    g.add(mesh(rbox(0.74, 0.15, 0.74, 0.06), cloth, 0, 0.37, 0.01))
    const back = mesh(rbox(0.74, 0.44, 0.16, 0.07), cloth, 0, 0.6, -0.3)
    back.rotation.x = -0.2
    g.add(back)
    for (const sx of [-1, 1]) g.add(mesh(rbox(0.1, 0.22, 0.7, 0.045), cloth, sx * 0.37, 0.47, 0))
    return g
  },

  dune(c) {
    const g = new THREE.Group()
    const w = c.option === 0 ? 1.72 : 2.24
    const seats = c.option === 0 ? 2 : 3
    const cloth = mat('fabric', c.color.hex)
    const frame = mat(c.finish.key)
    legs(g, frame, w / 2 - 0.08, 0.36, 0.14, 0.03)
    g.add(mesh(rbox(w, 0.16, 0.92, 0.04), cloth, 0, 0.22, 0))
    const cw = (w - 0.24) / seats
    for (let i = 0; i < seats; i++) {
      const x = -w / 2 + 0.12 + cw * (i + 0.5)
      g.add(mesh(rbox(cw - 0.01, 0.14, 0.7, 0.06), cloth, x, 0.37, 0.08))
      const back = mesh(rbox(cw - 0.01, 0.42, 0.2, 0.08), cloth, x, 0.56, -0.33)
      back.rotation.x = -0.15
      g.add(back)
    }
    for (const sx of [-1, 1]) g.add(mesh(rbox(0.14, 0.42, 0.92, 0.06), cloth, sx * (w / 2 - 0.06), 0.35, 0))
    return g
  },

  plinth(c) {
    const g = new THREE.Group()
    const m = mat(c.finish.key)
    if (c.option === 0) {
      g.add(mesh(cyl(0.2, 0.21, 0.025, 64), m, 0, 0.0125, 0))
      g.add(mesh(cyl(0.11, 0.13, 0.44, 64), m, 0, 0.245, 0))
      g.add(mesh(cyl(0.27, 0.27, 0.035, 72), m, 0, 0.4825, 0))
    } else {
      g.add(mesh(rbox(0.36, 0.025, 0.36, 0.006), m, 0, 0.0125, 0))
      g.add(mesh(rbox(0.2, 0.44, 0.2, 0.01), m, 0, 0.245, 0))
      g.add(mesh(rbox(0.48, 0.035, 0.48, 0.01), m, 0, 0.4825, 0))
    }
    return g
  },

  halo(c) {
    const g = new THREE.Group()
    const h = c.option === 0 ? 0.3 : 0.46
    const shade = mat(c.finish.key, c.color.hex)
    const metal = mat('brass')
    g.add(mesh(cyl(0.085, 0.09, 0.03, 48), shade, 0, 0.015, 0))
    g.add(mesh(cyl(0.007, 0.007, h, 16), metal, 0, h / 2 + 0.03, 0))
    const pts = []
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * (Math.PI / 2)
      pts.push(new V2(Math.sin(a) * 0.17 + 0.004, Math.cos(a) * 0.13))
    }
    const dome = mesh(new THREE.LatheGeometry(pts, 72), shade, 0, h + 0.02, 0)
    dome.material.side = THREE.DoubleSide
    g.add(dome)
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 24, 16), new THREE.MeshStandardMaterial({ color: '#fff6e0', emissive: '#ffd99a', emissiveIntensity: 1.4 }))
    bulb.position.y = h + 0.03
    g.add(bulb)
    return g
  },

  arc(c) {
    const g = new THREE.Group()
    const metal = mat(c.finish.key)
    g.add(mesh(cyl(0.17, 0.18, 0.06, 64), mat('marble'), 0, 0.03, 0))
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 0.06, 0),
      new THREE.Vector3(0, 1.6, 0),
      new THREE.Vector3(0.5, 2.15, 0),
      new THREE.Vector3(1.3, 1.85, 0),
    )
    g.add(mesh(new THREE.TubeGeometry(curve, 96, 0.014, 16), metal))
    const shade = mat('matte', c.color.hex)
    let profile
    if (c.option === 0) {
      profile = []
      for (let i = 0; i <= 24; i++) {
        const a = (i / 24) * (Math.PI / 2)
        profile.push(new V2(Math.sin(a) * 0.22 + 0.01, Math.cos(a) * 0.16))
      }
    } else {
      profile = [new V2(0.03, 0.26), new V2(0.22, 0)]
    }
    const lathe = new THREE.LatheGeometry(profile, 72)
    const sm = mesh(lathe, shade, 1.3, c.option === 0 ? 1.68 : 1.6, 0)
    sm.material.side = THREE.DoubleSide
    g.add(sm)
    g.position.x = -0.55 // centre the footprint so it orbits nicely
    const wrap = new THREE.Group()
    wrap.add(g)
    return wrap
  },

  fold(c) {
    const g = new THREE.Group()
    const tiers = c.option === 0 ? 3 : 4
    const w = 0.8
    const d = 0.3
    const th = 0.022
    const tierH = 0.34
    const H = tiers * tierH + th
    const wood = mat(c.finish.key)
    for (const sx of [-1, 1]) g.add(mesh(rbox(th, H, d, 0.004), wood, (sx * (w - th)) / 2, H / 2, 0))
    for (let i = 0; i <= tiers; i++) g.add(mesh(rbox(w - th * 2, th, d, 0.003), wood, 0, th / 2 + i * tierH, 0))
    g.add(mesh(new THREE.BoxGeometry(w - th * 2, H - th, 0.008), mat('paint', c.color.hex), 0, H / 2, -d / 2 + 0.006))
    // A few books and a vase so the shelf reads at a glance.
    const bookColors = ['#3D4A3E', '#B8AD94', '#7A2F21', '#2A3245', '#D7D2C6']
    for (let i = 0; i < tiers; i++) {
      const y = th + i * tierH
      let x = -w / 2 + th + 0.04 + (i % 2) * 0.32
      const count = 4 + (i % 3)
      for (let b = 0; b < count; b++) {
        const bh = 0.2 + ((b * 7 + i * 3) % 5) * 0.018
        const bw = 0.028 + ((b + i) % 3) * 0.008
        g.add(mesh(new THREE.BoxGeometry(bw, bh, 0.19), mat('paint', bookColors[(b + i) % 5]), x + bw / 2, y + bh / 2, 0.01))
        x += bw + 0.003
      }
    }
    return g
  },

  tide(c) {
    const forms = [
      [new V2(0.06, 0), new V2(0.075, 0.08), new V2(0.07, 0.22), new V2(0.045, 0.3), new V2(0.04, 0.34), new V2(0.05, 0.36)],
      [new V2(0.08, 0), new V2(0.12, 0.05), new V2(0.125, 0.1), new V2(0.09, 0.16), new V2(0.06, 0.18), new V2(0.07, 0.19)],
      [new V2(0.05, 0), new V2(0.11, 0.07), new V2(0.11, 0.14), new V2(0.04, 0.22), new V2(0.03, 0.27), new V2(0.04, 0.28)],
    ]
    const g = new THREE.Group()
    g.add(mesh(vessel(forms[c.option], 0.006), mat(c.finish.key, c.color.hex)))
    return g
  },

  pebble(c) {
    const g = new THREE.Group()
    const s = c.option === 0 ? 0.75 : 1
    g.add(mesh(rbox(0.3 * s, 0.17 * s, 0.14 * s, 0.05 * s), mat('fabric', c.color.hex), 0, 0.085 * s, 0))
    g.add(mesh(rbox(0.27 * s, 0.014, 0.115 * s, 0.006), mat(c.finish.key), 0, 0.17 * s + 0.004, 0))
    g.add(mesh(cyl(0.018 * s, 0.018 * s, 0.014, 32), mat('steel'), 0.09 * s, 0.17 * s + 0.017, 0))
    return g
  },
}

// Short feet at the given [x, z] points.
function feet(group, finish, points, h, r = 0.022) {
  for (const [x, z] of points) group.add(mesh(cyl(r, r * 0.8, h, 20), finish, x, h / 2, z))
}

// A round rod between two points (hairpin legs, frames).
function rod(a, b, r, material) {
  const dir = new THREE.Vector3().subVectors(b, a)
  const m = mesh(cyl(r, r, dir.length(), 12), material)
  m.position.copy(a).addScaledVector(dir, 0.5)
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
  return m
}

const corners = (w, d) => [
  [-w, -d],
  [w, -d],
  [-w, d],
  [w, d],
]

function pillows(g, w, y, z) {
  const white = mat('fabric', '#F1EEE8')
  for (const sx of [-1, 1]) {
    const p = mesh(rbox(Math.min(0.62, w / 2 - 0.08), 0.14, 0.38, 0.07), white, (sx * w) / 4, y, z)
    p.rotation.x = -0.25
    g.add(p)
  }
}

Object.assign(builders, {
  haven(c) {
    const g = new THREE.Group()
    const cloth = mat('fabric', c.color.hex)
    const wood = mat(c.finish.key)
    const side = c.option === 0 ? -1 : 1 // where the chaise sits
    const W = 2.5
    const D = 0.95
    const CW = 0.95 // chaise width
    const CD = 1.65 // chaise depth
    const cx = side * (W / 2 - CW / 2)
    const cz = -D / 2 + CD / 2
    feet(g, wood, [[-W / 2 + 0.08, -D / 2 + 0.08], [W / 2 - 0.08, -D / 2 + 0.08], [-side * (W / 2 - 0.08), D / 2 - 0.08], [side * (W / 2 - CW + 0.08), D / 2 - 0.08], [cx - CW / 2 + 0.08, -D / 2 + CD - 0.08], [cx + CW / 2 - 0.08, -D / 2 + CD - 0.08]], 0.08)
    g.add(mesh(rbox(W, 0.18, D, 0.04), cloth, 0, 0.17, 0))
    g.add(mesh(rbox(CW, 0.18, CD, 0.04), cloth, cx, 0.17, cz))
    // Seat cushions: two on the sofa part, one long one on the chaise.
    const xa = -side * (W / 2 - 0.17)
    const xb = side * (W / 2 - CW)
    const sw = Math.abs(xb - xa) / 2
    for (let i = 0; i < 2; i++) g.add(mesh(rbox(sw - 0.01, 0.14, D - 0.22, 0.06), cloth, Math.min(xa, xb) + sw * (i + 0.5), 0.33, 0.11))
    g.add(mesh(rbox(CW - 0.02, 0.14, CD - 0.22, 0.06), cloth, cx, 0.33, -D / 2 + CD - (CD - 0.22) / 2))
    // Back cushions along the full width, and one arm on the open end.
    for (let i = 0; i < 3; i++) {
      const b = mesh(rbox(W / 3 - 0.02, 0.42, 0.2, 0.08), cloth, -W / 2 + (W / 3) * (i + 0.5), 0.52, -D / 2 + 0.1)
      b.rotation.x = -0.12
      g.add(b)
    }
    g.add(mesh(rbox(0.16, 0.34, D, 0.06), cloth, -side * (W / 2 - 0.08), 0.42, 0))
    return g
  },

  loom(c) {
    const g = new THREE.Group()
    const cloth = mat('fabric', c.color.hex)
    const W = 1.5
    const D = 0.85
    const r = c.option === 0 ? 0.1 : 0.025
    legs(g, mat(c.finish.key), W / 2 - 0.12, D / 2 - 0.12, 0.17, 0.04)
    g.add(mesh(rbox(W, 0.16, D, 0.04), cloth, 0, 0.25, 0))
    const cw = (W - 0.4) / 2
    for (const sx of [-1, 1]) g.add(mesh(rbox(cw - 0.01, 0.13, D - 0.2, 0.06), cloth, (sx * cw) / 2, 0.39, 0.08))
    const back = mesh(rbox(W - 0.22, 0.4, 0.18, 0.07), cloth, 0, 0.56, -D / 2 + 0.1)
    back.rotation.x = -0.12
    g.add(back)
    for (const sx of [-1, 1]) g.add(mesh(rbox(0.2, 0.36, D, r), cloth, sx * (W / 2 - 0.1), 0.43, 0))
    return g
  },

  mara(c) {
    const g = new THREE.Group()
    const cloth = mat('fabric', c.color.hex)
    const W = c.option === 0 ? 2.1 : 2.4
    const D = 0.95
    feet(g, mat(c.finish.key), corners(W / 2 - 0.1, D / 2 - 0.1), 0.12, 0.03)
    g.add(mesh(rbox(W, 0.2, D, 0.03), cloth, 0, 0.22, 0))
    const cw = (W - 0.44) / 3
    for (let i = 0; i < 3; i++) g.add(mesh(rbox(cw - 0.01, 0.15, D - 0.25, 0.05), cloth, -W / 2 + 0.22 + cw * (i + 0.5), 0.395, 0.1))
    g.add(mesh(rbox(W - 0.1, 0.42, 0.22, 0.06), cloth, 0, 0.53, -D / 2 + 0.11))
    for (const sx of [-1, 1]) {
      g.add(mesh(rbox(0.22, 0.3, D, 0.04), cloth, sx * (W / 2 - 0.11), 0.42, 0))
      const roll = mesh(cyl(0.13, 0.13, D, 40), cloth, sx * (W / 2 - 0.11), 0.6, 0)
      roll.rotation.x = Math.PI / 2
      g.add(roll)
    }
    return g
  },

  rest(c) {
    const g = new THREE.Group()
    const cloth = mat('fabric', c.color.hex)
    const W = c.option === 0 ? 1.6 : 1.93 // mattress width
    feet(g, mat(c.finish.key), corners(W / 2, 0.98), 0.08, 0.03)
    g.add(mesh(rbox(W + 0.1, 0.25, 2.1, 0.04), cloth, 0, 0.205, 0))
    g.add(mesh(rbox(W, 0.24, 2.0, 0.05), mat('matte', '#EEEBE4'), 0, 0.45, 0))
    // Channel-tufted headboard.
    g.add(mesh(rbox(W + 0.14, 1.0, 0.1, 0.04), cloth, 0, 0.58, -1.1))
    const n = Math.round((W + 0.1) / 0.22)
    const cw = (W + 0.1) / n
    for (let i = 0; i < n; i++) g.add(mesh(rbox(cw - 0.015, 0.82, 0.07, 0.03), cloth, -(W + 0.1) / 2 + cw * (i + 0.5), 0.64, -1.03))
    g.add(mesh(rbox(W + 0.04, 0.06, 1.4, 0.03), mat('fabric', '#DCD6CA'), 0, 0.6, 0.31))
    pillows(g, W, 0.66, -0.78)
    return g
  },

  timber(c) {
    const g = new THREE.Group()
    const wood = mat(c.finish.key)
    const W = [1.4, 1.6, 1.93][c.option]
    const L = 2.0
    for (const sx of [-1, 1]) {
      g.add(mesh(rbox(0.05, 0.2, L + 0.1, 0.008), wood, sx * (W / 2 + 0.03), 0.3, 0))
      g.add(mesh(rbox(0.07, 0.4, 0.07, 0.008), wood, sx * (W / 2 + 0.03), 0.2, L / 2 + 0.05)) // foot legs
      g.add(mesh(rbox(0.07, 1.0, 0.07, 0.008), wood, sx * (W / 2 + 0.03), 0.5, -L / 2 - 0.05)) // head posts
    }
    g.add(mesh(rbox(W + 0.06, 0.2, 0.05, 0.008), wood, 0, 0.3, L / 2 + 0.05))
    g.add(mesh(rbox(W + 0.14, 0.06, 0.07, 0.01), wood, 0, 0.97, -L / 2 - 0.05))
    const n = Math.round(W / 0.12)
    for (let i = 0; i < n; i++) g.add(mesh(rbox(0.05, 0.52, 0.025, 0.006), wood, -W / 2 + (W / n) * (i + 0.5), 0.68, -L / 2 - 0.05))
    g.add(mesh(rbox(W, 0.22, L, 0.05), mat('matte', '#EEEBE4'), 0, 0.5, 0))
    g.add(mesh(rbox(W + 0.06, 0.06, 1.4, 0.03), mat('fabric', c.color.hex), 0, 0.64, 0.31))
    pillows(g, W, 0.7, -0.76)
    return g
  },

  atelier(c) {
    const g = new THREE.Group()
    const wood = mat(c.finish.key)
    const paint = mat('paint', c.color.hex)
    const brass = mat('brass')
    const W = 1.2
    const D = 0.6
    g.add(mesh(rbox(W, 0.03, D, 0.006), wood, 0, 0.735, 0))
    // Drawer pedestal on the left.
    const px = -W / 2 + 0.21
    g.add(mesh(rbox(0.4, 0.71, D - 0.04, 0.008), paint, px, 0.355, 0))
    for (const y of [0.13, 0.36, 0.59]) {
      g.add(mesh(rbox(0.38, 0.21, 0.02, 0.004), paint, px, y, (D - 0.04) / 2 + 0.008))
      g.add(mesh(rbox(0.12, 0.012, 0.015, 0.004), brass, px, y + 0.06, (D - 0.04) / 2 + 0.025))
    }
    // Two legs and a stretcher on the right.
    for (const sz of [-1, 1]) g.add(mesh(rbox(0.04, 0.72, 0.04, 0.006), wood, W / 2 - 0.04, 0.36, sz * (D / 2 - 0.04)))
    g.add(mesh(rbox(0.03, 0.03, D - 0.08, 0.004), wood, W / 2 - 0.04, 0.12, 0))
    // Laptop for scale.
    g.add(mesh(rbox(0.32, 0.015, 0.22, 0.006), mat('steel'), 0.18, 0.758, 0.06))
    const screen = mesh(rbox(0.32, 0.21, 0.008, 0.004), mat('blacksteel'), 0.18, 0.86, -0.06)
    screen.rotation.x = -0.25
    g.add(screen)
    if (c.option === 1) {
      for (const sx of [-1, 1]) g.add(mesh(rbox(0.02, 0.42, 0.25, 0.004), wood, sx * (W / 2 - 0.01), 0.96, -D / 2 + 0.125))
      g.add(mesh(rbox(W, 0.022, 0.25, 0.004), wood, 0, 1.17, -D / 2 + 0.125))
      const colors = ['#3D4A3E', '#B8AD94', '#7A2F21', '#2A3245']
      let x = -W / 2 + 0.08
      for (let i = 0; i < 7; i++) {
        const h = 0.2 + (i % 3) * 0.02
        g.add(mesh(new THREE.BoxGeometry(0.035, h, 0.17), mat('paint', colors[i % 4]), x, 1.181 + h / 2, -D / 2 + 0.12))
        x += 0.04
      }
    }
    return g
  },

  nook(c) {
    const g = new THREE.Group()
    const top = mat(c.finish.key)
    const steel = mat('blacksteel')
    const W = c.option === 0 ? 1.0 : 1.2
    const D = 0.5
    g.add(mesh(rbox(W, 0.025, D, 0.005), top, 0, 0.7375, 0))
    g.add(mesh(rbox(W - 0.12, 0.07, D - 0.08, 0.004), c.finish.key === 'marble' ? mat('oak') : top, 0, 0.69, 0))
    // Hairpin legs: two rods meeting at the floor.
    for (const [x, z] of corners(W / 2 - 0.05, D / 2 - 0.08)) {
      const foot = new THREE.Vector3(x, 0, z)
      for (const dz of [-0.05, 0.05]) g.add(rod(foot, new THREE.Vector3(x, 0.655, z + dz), 0.006, steel))
    }
    return g
  },

  arlo(c) {
    const g = new THREE.Group()
    const wood = mat(c.finish.key)
    g.add(mesh(rbox(0.46, 0.04, 0.44, 0.02), wood, 0, 0.45, 0))
    g.add(mesh(rbox(0.42, 0.04, 0.4, 0.02), mat('fabric', c.color.hex), 0, 0.49, 0.01))
    for (const sx of [-1, 1]) g.add(mesh(rbox(0.03, 0.26, 0.02, 0.006), wood, sx * 0.16, 0.6, -0.2))
    const back = mesh(rbox(0.44, 0.2, 0.03, 0.012), wood, 0, 0.78, -0.22)
    back.rotation.x = 0.12
    g.add(back)
    if (c.option === 0) legs(g, wood, 0.19, 0.18, 0.43, 0.05)
    else {
      const steel = mat('steel')
      g.add(mesh(cyl(0.025, 0.025, 0.34, 20), steel, 0, 0.26, 0))
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2
        const arm = mesh(rbox(0.3, 0.025, 0.04, 0.01), steel, Math.cos(a) * 0.15, 0.08, Math.sin(a) * 0.15)
        arm.rotation.y = -a
        g.add(arm)
        g.add(mesh(new THREE.SphereGeometry(0.03, 16, 12), mat('blacksteel'), Math.cos(a) * 0.29, 0.03, Math.sin(a) * 0.29))
      }
    }
    return g
  },

  slab(c) {
    const g = new THREE.Group()
    const wood = mat(c.finish.key)
    const L = c.option === 0 ? 1.6 : 2.2
    g.add(mesh(rbox(L, 0.045, 0.9, 0.008), wood, 0, 0.7275, 0))
    for (const sx of [-1, 1]) g.add(mesh(rbox(0.06, 0.705, 0.7, 0.006), wood, sx * (L / 2 - 0.25), 0.3525, 0))
    g.add(mesh(rbox(L - 0.5, 0.05, 0.05, 0.006), wood, 0, 0.22, 0))
    return g
  },

  orb(c) {
    const g = new THREE.Group()
    const m = mat(c.finish.key)
    const top = mesh(cyl(0.5, 0.5, 0.03, 72), m, 0, 0.385, 0)
    const base = mesh(cyl(0.32, 0.34, 0.37, 64), m, 0, 0.185, 0)
    if (c.option === 1) {
      top.scale.x = 1.4
      base.scale.x = 1.3
    }
    g.add(top, base)
    g.add(mesh(new THREE.BoxGeometry(0.24, 0.03, 0.18), mat('paint', '#2A3245'), 0.12, 0.415, 0.05))
    g.add(mesh(new THREE.BoxGeometry(0.2, 0.025, 0.15), mat('paint', '#B8AD94'), 0.13, 0.4425, 0.04))
    return g
  },
})

export function buildProduct(product, cfg) {
  const group = builders[product.id]({
    color: product.colors[cfg.color] ?? { hex: '#ffffff' },
    finish: product.finishes[cfg.finish],
    option: cfg.option,
  })
  group.name = product.name
  return group
}

// Real-world footprint in centimetres, measured from the built geometry.
export function measure(group) {
  const size = new THREE.Box3().setFromObject(group).getSize(new THREE.Vector3())
  const cm = (v) => Math.round(v * 100)
  return { w: cm(size.x), d: cm(size.z), h: cm(size.y) }
}
