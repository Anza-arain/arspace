import { useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_CFG, badgeOf, money, priceOf } from '../data/products.js'
import { thumbnail } from '../three/scene.js'
import { toHash } from '../route.js'
import { useSettings, offerOf, salePrice } from '../store.js'

export function useThumbnail(product, cfg = DEFAULT_CFG, delay = 0) {
  const [src, setSrc] = useState(null)
  useEffect(() => {
    if (!product) return
    // Stagger renders so the first paint is not blocked by a row of WebGL draws.
    const t = setTimeout(() => setSrc(thumbnail(product, cfg)), delay)
    return () => clearTimeout(t)
  }, [product, cfg, delay])
  return src
}

// true for ~1.2s after flash() is called: drives the "Added" label on bag buttons.
export function useAdded() {
  const [added, setAdded] = useState(false)
  const t = useRef(0)
  useEffect(() => () => clearTimeout(t.current), [])
  const flash = () => {
    clearTimeout(t.current)
    setAdded(true)
    t.current = setTimeout(() => setAdded(false), 1200)
  }
  return [added, flash]
}

// Button label that slides from `label` to "Added".
export function AddLabel({ added, label }) {
  return (
    <span className="add-label" data-added={added ? '' : undefined}>
      <span aria-hidden={added}>{label}</span>
      <span aria-hidden={!added}>Added</span>
    </span>
  )
}

// Struck base price and "n% off" when the admin has an offer on the piece.
export function Price({ product, cfg = DEFAULT_CFG, qty = 1, from = false, className = '' }) {
  const s = useSettings()
  const off = offerOf(product, s)
  return (
    <p className={`price-line ${className}`}>
      <span className="price">
        {from && 'from '}
        {money(salePrice(product, cfg, s) * qty)}
      </span>
      {off > 0 && (
        <>
          <s className="was">
            <span className="sr-only">was </span>
            {money(priceOf(product, cfg) * qty)}
          </s>
          <span className="off">{off}% off</span>
        </>
      )}
    </p>
  )
}

export function SaveButton({ id, saved, toggleSaved, className = '' }) {
  const on = saved.includes(id)
  return (
    <button type="button" className={`save ${className}`} aria-pressed={on} onClick={() => toggleSaved(id)} aria-label={on ? 'Remove from saved' : 'Save'}>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" />
      </svg>
    </button>
  )
}

// The hover picture: next colour, else second finish, else second option.
function altOf(p, cfg) {
  if (p.colors.length > 1) return { ...cfg, color: (cfg.color + 1) % p.colors.length }
  if (p.finishes.length > 1) return { ...cfg, finish: 1 }
  if (p.option.choices.length > 1) return { ...cfg, option: 1 }
  return null
}

// Flat image tile. Pointing at (or tapping) a colour dot re-renders the picture in that
// colour, and the card then links to the piece in that colour. Hover cross-fades to a
// second render, which is only drawn once someone points at the card.
export default function ProductCard({ product, index = 0, saved, toggleSaved, addToCart }) {
  const s = useSettings()
  const [color, setColor] = useState(0)
  const [warm, setWarm] = useState(false)
  const [picked, setPicked] = useState(false) // a chosen colour stays on screen, no hover swap
  const [added, flash] = useAdded()
  const cfg = useMemo(() => ({ ...DEFAULT_CFG, color }), [color])
  const alt = useMemo(() => altOf(product, cfg), [product, cfg])
  const src = useThumbnail(product, cfg, 60 + index * 40)
  const altSrc = useThumbnail(warm && !picked && alt ? product : null, alt ?? DEFAULT_CFG, 0)
  const off = offerOf(product, s)
  const badge = off > 0 ? `${off}% off` : badgeOf(product)
  const href = `#${toHash(product, cfg)}`
  const shown = product.colors.slice(0, 5)
  const pick = (i) => {
    setPicked(true)
    setColor(i)
  }

  return (
    <article className="card" onPointerEnter={() => setWarm(true)} onFocus={() => setWarm(true)}>
      <div className="card-media" data-reveal>
        <a className="card-img" href={href} tabIndex={-1} aria-hidden="true">
          {src ? <img src={src} alt="" width="560" height="560" /> : <span className="card-loading" />}
          {altSrc && !picked && <img className="card-alt" src={altSrc} alt="" width="560" height="560" />}
        </a>
        <p className="card-labels">
          <span className="label-3d">3D</span>
          {badge && <span className={off > 0 ? 'card-badge card-badge-offer' : 'card-badge'}>{badge}</span>}
        </p>
        <SaveButton id={product.id} saved={saved} toggleSaved={toggleSaved} className="card-save" />
        {addToCart && (
          <button
            type="button"
            className="quick-add"
            aria-label={added ? `${product.name} added to bag` : `Add ${product.name} to bag`}
            onClick={() => {
              addToCart(product, cfg)
              flash()
            }}
          >
            <AddLabel added={added} label="Add to bag" />
          </button>
        )}
      </div>
      <div className="card-body">
        <h3 className="card-name">
          <a href={href}>{product.name}</a>
        </h3>
        <p className="card-maker">Furnova Studio</p>
        <Price product={product} from className="card-price" />
        {shown.length > 1 && (
          <div className="card-dots" role="group" aria-label={`${product.colorLabel ?? 'Colour'} for ${product.name}`}>
            {shown.map((c, i) => (
              <button
                key={c.name}
                type="button"
                aria-label={c.name}
                aria-pressed={i === color}
                onMouseEnter={() => pick(i)}
                onFocus={() => pick(i)}
                onClick={() => pick(i)}
              >
                <span style={{ background: c.hex }} />
              </button>
            ))}
            {product.colors.length > 5 && <span className="more-dots">{product.colors.length - 5} more</span>}
          </div>
        )}
      </div>
    </article>
  )
}
