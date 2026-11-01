import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { createRenderer, createStudio, disposeGeometry } from './scene.js'
import { buildProduct } from './models.js'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Interactive Three.js viewer. Rebuilds the model when the configuration changes,
// keeps the camera where the user left it unless the product itself changes.
export default function Stage({ product, cfg, onModel, className, label }) {
  const host = useRef(null)
  const kit = useRef(null)

  useEffect(() => {
    const el = host.current
    const renderer = createRenderer()
    el.appendChild(renderer.domElement)
    const { scene, fit } = createStudio(renderer)
    const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.enablePan = false
    controls.maxPolarAngle = Math.PI / 2 - 0.04 // never look from under the floor
    controls.autoRotate = !reducedMotion()
    controls.autoRotateSpeed = 0.9
    controls.addEventListener('start', () => (controls.autoRotate = false))

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el
      if (!w || !h) return
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

    // Only render while the stage is on screen.
    const loop = () => {
      controls.update()
      renderer.render(scene, camera)
    }
    const io = new IntersectionObserver(([e]) => renderer.setAnimationLoop(e.isIntersecting ? loop : null))
    io.observe(el)

    kit.current = {
      scene,
      model: null,
      productId: null,
      setModel(model, productId) {
        if (this.model) {
          scene.remove(this.model)
          disposeGeometry(this.model)
        }
        scene.add(model)
        this.model = model
        if (productId !== this.productId) {
          fit(model, camera, controls)
          this.productId = productId
        }
      },
      reset() {
        fit(this.model, camera, controls)
      },
    }

    return () => {
      io.disconnect()
      ro.disconnect()
      renderer.setAnimationLoop(null)
      controls.dispose()
      if (kit.current.model) disposeGeometry(kit.current.model)
      renderer.dispose()
      el.removeChild(renderer.domElement)
    }
  }, [])

  useEffect(() => {
    const model = buildProduct(product, cfg)
    kit.current.setModel(model, product.id)
    onModel?.(model, () => kit.current.reset())
  }, [product, cfg, onModel])

  return <div ref={host} className={className} role="img" aria-label={label ?? `3D view of ${product.name}. Drag to rotate, scroll or pinch to zoom.`} />
}
