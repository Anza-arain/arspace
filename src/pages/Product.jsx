import { useCallback, useEffect, useRef, useState } from 'react'
import Stage from '../three/Stage.jsx'
import { measure } from '../three/models.js'
import { Choices, Qty, Swatches } from '../components/Options.jsx'
import { SaveButton } from '../components/ProductCard.jsx'
import ARModal from '../components/ARModal.jsx'
import { PRODUCTS, money, priceOf } from '../data/products.js'
import { toHash } from '../route.js'
import ProductCard from '../components/ProductCard.jsx'

// Address of the deployed store, set in .env as VITE_PUBLIC_URL=https://your-site.vercel.app/
// Links and QR codes use it, so they work even when the app runs inside a preview frame.
const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL
const embedded = window.self !== window.top

// null when there is no public address to point a phone at.
export function shareUrl(hash) {
  if (PUBLIC_URL) return `${PUBLIC_URL.replace(/\/?$/, '/')}#${hash}`
  if (embedded) return null
  return `${location.origin}${location.pathname}#${hash}`
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export default function Product({ product, initial, openAR, saved, toggleSaved, addToCart, notify }) {
  const [cfg, setCfg] = useState(initial)
  const [dims, setDims] = useState(null)
  const [qty, setQty] = useState(1)
  const [arOpen, setArOpen] = useState(Boolean(openAR))
  const [linkFallback, setLinkFallback] = useState('')
  const model = useRef(null)
  const resetView = useRef(null)

  const hash = toHash(product, cfg)
  // Keep the address bar in sync so the current configuration is always shareable.
  useEffect(() => {
    history.replaceState(null, '', '#' + hash)
  }, [hash])

  const onModel = useCallback((m, reset) => {
    model.current = m
    resetView.current = reset
    setDims(measure(m))
  }, [])

  const set = (key) => (i) => setCfg((c) => ({ ...c, [key]: i }))

  async function share() {
    const url = shareUrl(hash)
    if (!url) return notify('Share links work on the published site, not in this preview.')
    if (await copyText(url)) notify('Link copied')
    else setLinkFallback(url) // clipboard refused: show the link to copy by hand
  }

  const others = PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category).concat(
    PRODUCTS.filter((p) => p.id !== product.id && p.category !== product.category),
  ).slice(0, 3)

  return (
    <>
      <section className="product wrap">
        <div className="product-stage">
          <Stage className="stage" product={product} cfg={cfg} onModel={onModel} />
          <div className="stage-tools">
            <button type="button" className="btn btn-small" onClick={() => resetView.current?.()}>
              Reset view
            </button>
            <span className="hint">Drag to rotate. Pinch or scroll to zoom.</span>
          </div>
        </div>

        <div className="panel">
          <a className="back" href="#catalog">
            Catalog / {product.category}
          </a>
          <div className="title-row">
            <h1>{product.name}</h1>
            <SaveButton id={product.id} saved={saved} toggleSaved={toggleSaved} />
          </div>
          <p className="lede">{product.blurb}</p>

          <dl className="spec">
            <div>
              <dt>Price</dt>
              <dd className="price big">{money(priceOf(product, cfg))}</dd>
            </div>
            {dims && (
              <div>
                <dt>Size</dt>
                <dd>
                  W {dims.w} × D {dims.d} × H {dims.h} cm
                </dd>
              </div>
            )}
          </dl>

          <form className="options" onSubmit={(e) => e.preventDefault()}>
            {product.colors.length > 0 && <Swatches label={product.colorLabel} colors={product.colors} value={cfg.color} onChange={set('color')} />}
            <Choices label={product.finishLabel} choices={product.finishes} value={cfg.finish} onChange={set('finish')} />
            <Choices label={product.option.label} choices={product.option.choices} value={cfg.option} onChange={set('option')} />
          </form>

          <div className="actions">
            <div className="cart-row">
              <Qty value={qty} onChange={setQty} label="Quantity" className="qty-lg" />
              <button type="button" className="btn btn-primary btn-cart" onClick={() => addToCart(product, cfg, qty)}>
                {qty > 1 ? `Add ${qty} to cart` : 'Add to cart'}, {money(priceOf(product, cfg) * qty)}
              </button>
            </div>
            <button type="button" className="btn btn-ink btn-ar" onClick={() => setArOpen(true)}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3zm0 2.3 5.6 3.2L12 11.7 6.4 8.5 12 5.3zM6 10.2l5 2.9v5.6l-5-2.8v-5.7zm7 8.5v-5.6l5-2.9v5.7l-5 2.8z" />
              </svg>
              View in your room
            </button>
            <button type="button" className="btn btn-quiet" onClick={share}>
              Copy share link
            </button>
          </div>
          <ul className="perks">
            <li>Made to order, ships in 2 to 3 weeks</li>
            <li>Free standard delivery over $500</li>
            <li>30-day returns</li>
          </ul>
          {linkFallback && (
            <label className="field link-fallback">
              <span>Copy this link</span>
              <input id="share-link" readOnly value={linkFallback} onFocus={(e) => e.target.select()} autoFocus />
            </label>
          )}
        </div>
      </section>

      <section className="wrap more" aria-labelledby="more-title">
        <h2 id="more-title">Pairs well with</h2>
        <div className="grid grid-3">
          {others.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} saved={saved} toggleSaved={toggleSaved} />
          ))}
        </div>
      </section>

      {arOpen && dims && <ARModal product={product} cfg={cfg} model={model.current} url={shareUrl(hash + '-ar')} onClose={() => setArOpen(false)} />}
    </>
  )
}
