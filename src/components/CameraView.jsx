import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { createRenderer, createStudio, disposeGeometry } from '../three/scene.js'
import { buildProduct } from '../three/models.js'

// Camera view that works on any phone browser: the back camera fills the screen and the
// configured model is drawn on top, standing on a virtual floor.
// ponytail: no world tracking (that needs WebXR/ARCore); the model stays where the
// person puts it on screen. Real floor-locked AR still runs where the phone supports it.
export default function CameraView({ product, cfg, onClose }) {
  const video = useRef(null)
  const host = useRef(null)
  const [error, setError] = useState('')
  const [hint, setHint] = useState(true)

  // Back camera.
  useEffect(() => {
    let stream
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      .then((s) => {
        stream = s
        video.current.srcObject = s
        return video.current.play()
      })
      .catch((e) =>
        setError(
          e?.name === 'NotAllowedError'
            ? 'Camera access is blocked. Tap the lock or camera icon in the address bar, allow the camera, then reload the page.'
            : 'The camera could not be opened. Open this page in Chrome or Safari and allow camera access.',
        ),
      )
    if (!navigator.mediaDevices) setError('This browser has no camera access. Open the page in Chrome or Safari.')
    return () => stream?.getTracks().forEach((t) => t.stop())
  }, [])

  // Model over the camera.
  useEffect(() => {
    const el = host.current
    const renderer = createRenderer()
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)
    const { scene, fit } = createStudio(renderer)
    const camera = new THREE.PerspectiveCamera(55, 1, 0.01, 100)
    camera.position.set(0, 1.4, 0) // roughly a phone held at chest height
    const width = new THREE.Box3().setFromObject(buildProduct(product, cfg)).getSize(new THREE.Vector3()).x
    // Start far enough away that the piece fills about half the screen width.
    const homeDistance = () => {
      const half = Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect)
      return THREE.MathUtils.clamp(width / (0.5 * 2 * Math.tan(half)), 1.6, 6)
    }

    const model = buildProduct(product, cfg)
    const holder = new THREE.Group()
    holder.add(model)
    scene.add(holder)
    fit(holder) // shadow camera only

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const home = () => {
      const d = homeDistance()
      holder.position.set(0, 0, -d)
      holder.scale.setScalar(1)
      holder.rotation.y = 0
      camera.lookAt(0, 0.35, -d)
    }
    home()
    addEventListener('resize', resize)
    renderer.setAnimationLoop(() => renderer.render(scene, camera))

    // Gestures: one finger drags the piece across the floor, two fingers pinch to
    // resize (when the room looks bigger or smaller than it is) and twist to turn.
    const floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const ray = new THREE.Raycaster()
    const hit = new THREE.Vector3()
    const pts = new Map()
    let start = null

    function floorPoint(x, y) {
      const r = el.getBoundingClientRect()
      ray.setFromCamera(new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1), camera)
      return ray.ray.intersectPlane(floor, hit) ? hit.clone() : null
    }
    function snapshot() {
      const [a, b] = [...pts.values()]
      start = {
        pos: holder.position.clone(),
        scale: holder.scale.x,
        rot: holder.rotation.y,
        grab: a && floorPoint(a.x, a.y),
        dist: b ? Math.hypot(a.x - b.x, a.y - b.y) : 0,
        angle: b ? Math.atan2(b.y - a.y, b.x - a.x) : 0,
      }
    }
    const down = (e) => {
      el.setPointerCapture(e.pointerId)
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
      snapshot()
      setHint(false)
    }
    const move = (e) => {
      if (!pts.has(e.pointerId)) return
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
      const [a, b] = [...pts.values()]
      if (b) {
        const s = start.scale * (Math.hypot(a.x - b.x, a.y - b.y) / start.dist)
        holder.scale.setScalar(THREE.MathUtils.clamp(s, 0.3, 3))
        holder.rotation.y = start.rot - (Math.atan2(b.y - a.y, b.x - a.x) - start.angle)
      } else if (start.grab) {
        const p = floorPoint(a.x, a.y)
        if (p) {
          holder.position.copy(start.pos).add(p.sub(start.grab))
          holder.position.z = THREE.MathUtils.clamp(holder.position.z, -8, -0.6) // keep it in front of the camera
        }
      }
    }
    const up = (e) => {
      pts.delete(e.pointerId)
      snapshot()
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)

    host.current.turn = (deg) => (holder.rotation.y += THREE.MathUtils.degToRad(deg))
    host.current.reset = home

    return () => {
      removeEventListener('resize', resize)
      renderer.setAnimationLoop(null)
      disposeGeometry(holder)
      renderer.dispose()
      el.removeChild(renderer.domElement)
    }
  }, [product, cfg])

  return (
    <div className="camview">
      <video ref={video} className="camview-video" muted playsInline autoPlay />
      <div ref={host} className="camview-stage" role="img" aria-label={`${product.name} over your camera view. Drag to move, pinch to resize, twist to turn.`} />
      {error && <p className="camview-error">{error}</p>}
      {hint && !error && <p className="camview-hint">Drag to move it. Pinch to resize. Twist with two fingers to turn it.</p>}
      <div className="camview-bar">
        <button type="button" onClick={() => host.current.turn(-45)} aria-label="Turn left">
          ⟲
        </button>
        <button type="button" onClick={() => host.current.reset()}>
          Reset
        </button>
        <button type="button" onClick={() => host.current.turn(45)} aria-label="Turn right">
          ⟳
        </button>
        <button type="button" className="camview-close" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  )
}
