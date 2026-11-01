// Shared studio scene, thumbnail renderer and GLB export.
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { buildProduct } from './models.js'

export function createRenderer(opts = {}) {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, ...opts })
  r.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  r.outputColorSpace = THREE.SRGBColorSpace
  r.toneMapping = THREE.ACESFilmicToneMapping
  r.toneMappingExposure = 1.05
  r.shadowMap.enabled = true
  r.shadowMap.type = THREE.PCFSoftShadowMap
  return r
}

// Studio: soft room reflections, one key light for shadows, an invisible shadow floor.
export function createStudio(renderer) {
  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  pmrem.dispose()

  const key = new THREE.DirectionalLight('#ffffff', 1.6)
  key.position.set(2.5, 4, 2)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.radius = 6
  key.shadow.bias = -0.0004
  scene.add(key, key.target)

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: 0.16 }))
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  // Fit the shadow camera and camera distance to the model.
  function fit(object, camera, controls) {
    const box = new THREE.Box3().setFromObject(object)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const radius = Math.max(size.x, size.y, size.z) * 0.75
    const cam = key.shadow.camera
    cam.left = cam.bottom = -radius * 2
    cam.right = cam.top = radius * 2
    cam.updateProjectionMatrix()
    key.position.copy(center).add(new THREE.Vector3(radius * 3, radius * 5, radius * 2.5))
    key.target.position.copy(center)
    if (camera) {
      const dist = radius / Math.sin((camera.fov * Math.PI) / 360) * 1.05
      const dir = new THREE.Vector3(0.9, 0.55, 1.25).normalize()
      camera.position.copy(center).addScaledVector(dir, dist)
      camera.near = dist / 100
      camera.far = dist * 20
      camera.updateProjectionMatrix()
      camera.lookAt(center)
      if (controls) {
        controls.target.copy(center)
        controls.minDistance = dist * 0.45
        controls.maxDistance = dist * 2.2
        controls.update()
      }
    }
  }

  return { scene, fit }
}

export function disposeGeometry(object) {
  object.traverse((o) => o.geometry?.dispose())
}

// One offscreen renderer draws every catalog thumbnail, instead of one WebGL
// context per card (browsers cap live contexts at roughly 16).
let thumbKit
const thumbs = new Map()
export function thumbnail(product, cfg) {
  const id = `${product.id}-${cfg.color}-${cfg.finish}-${cfg.option}`
  if (thumbs.has(id)) return thumbs.get(id)
  if (!thumbKit) {
    const renderer = createRenderer({ preserveDrawingBuffer: true })
    renderer.setPixelRatio(1)
    renderer.setSize(560, 560)
    const studio = createStudio(renderer)
    thumbKit = { renderer, ...studio, camera: new THREE.PerspectiveCamera(30, 1, 0.01, 100) }
  }
  const { renderer, scene, fit, camera } = thumbKit
  const model = buildProduct(product, cfg)
  scene.add(model)
  fit(model, camera)
  renderer.render(scene, camera)
  const url = renderer.domElement.toDataURL('image/png')
  scene.remove(model)
  disposeGeometry(model)
  thumbs.set(id, url)
  return url
}

// Export the configured model as a binary glTF for <model-viewer> and AR.
export async function exportGLB(object) {
  const buffer = await new GLTFExporter().parseAsync(object, { binary: true, maxTextureSize: 1024 })
  return URL.createObjectURL(new Blob([buffer], { type: 'model/gltf-binary' }))
}
