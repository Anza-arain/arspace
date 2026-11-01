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
