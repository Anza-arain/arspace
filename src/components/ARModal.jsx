import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { exportGLB } from '../three/scene.js'
import { money, priceOf } from '../data/products.js'

// AR preview. The configured Three.js model is exported to GLB in the browser and
// handed to <model-viewer>, which picks WebXR (Android Chrome) or Quick Look (iOS).
// On a device without AR, it shows a QR code to continue on a phone.
export default function ARModal({ product, cfg, model, url, onClose }) {
  const dialog = useRef(null)
  const viewer = useRef(null)
  const [src, setSrc] = useState(null)
  const [canAR, setCanAR] = useState(null) // null = still checking
  const [qr, setQr] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!dialog.current.open) dialog.current.showModal()
    let blobUrl
    Promise.all([import('@google/model-viewer'), exportGLB(model)])
      .then(([, u]) => setSrc((blobUrl = u)))
      .catch(() => setError('The 3D file could not be prepared in this browser. Try a recent Chrome, Edge or Safari.'))
    if (url) QRCode.toDataURL(url, { margin: 1, width: 360, color: { dark: '#1C2420', light: '#FFFFFF' } }).then(setQr)
    return () => blobUrl && URL.revokeObjectURL(blobUrl)
  }, [model, url])

  useEffect(() => {
    const el = viewer.current
    if (!el) return
    const onLoad = () => setCanAR(Boolean(el.canActivateAR))
    el.addEventListener('load', onLoad)
    return () => el.removeEventListener('load', onLoad)
  }, [src])

  return (
    <dialog ref={dialog} className="ar-dialog" onClose={onClose} aria-labelledby="ar-title">
      <div className="ar-head">
        <div>
          <h2 id="ar-title">{product.name}</h2>
          <p className="muted">
            {[product.colors[cfg.color]?.name, product.finishes[cfg.finish].name, product.option.choices[cfg.option].name].filter(Boolean).join(', ')}
            {'  '}
            <span className="price">{money(priceOf(product, cfg))}</span>
          </p>
        </div>
        <button type="button" className="btn btn-small" onClick={() => dialog.current.close()}>
          Close
        </button>
      </div>

      <div className="ar-body">
        <div className="ar-viewer">
          {error && <p className="ar-error">{error}</p>}
          {!src && !error && <p className="ar-wait">Preparing the 3D file…</p>}
          {src && (
            <model-viewer
              ref={viewer}
              src={src}
              alt={`${product.name} in augmented reality`}
              ar=""
              ar-modes="webxr quick-look scene-viewer"
              ar-scale="fixed"
              ar-placement="floor"
              camera-controls=""
              touch-action="pan-y"
              shadow-intensity="1"
              environment-image="neutral"
              exposure="1"
            >
              <button slot="ar-button" className="btn btn-primary ar-launch" type="button">
                Place in my room
              </button>
            </model-viewer>
          )}
        </div>

        <aside className="ar-side">
          {canAR === true && (
            <>
              <h3>Ready on this device</h3>
              <p>Tap “Place in my room”, point your camera at the floor and move the phone slowly until the model appears. It is shown at true size.</p>
            </>
          )}
          {canAR !== true && (
            <>
              <h3>{canAR === false ? 'Open this on your phone' : 'Checking for AR…'}</h3>
              <p>This screen can show the model in 3D but not in your room. Scan the code with an ARCore Android phone or an iPhone. It opens this exact piece straight in the room view, one tap from your floor.</p>
              {qr && <img className="qr" src={qr} alt="QR code that opens this piece in AR on a phone" width="180" height="180" />}
              {!url && <p className="notice">The QR code appears on the published site. This preview runs inside another page, so a phone can't open it.</p>}
            </>
          )}
          <p className="fine">AR uses WebXR on Android Chrome and Quick Look on iOS Safari. Models are generated as glTF in your browser, nothing is uploaded.</p>
        </aside>
      </div>
    </dialog>
  )
}
