import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_CFG, badgeOf, money } from '../data/products.js'
import { thumbnail } from '../three/scene.js'
import { toHash } from '../route.js'

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

// Product card. Pointing at (or tapping) a colour dot re-renders the picture in that
// colour, and the card then links to the piece in that colour.
export default function ProductCard({ product, index = 0, saved, toggleSaved, addToCart }) {
  const [color, setColor] = useState(0)
  const cfg = useMemo(() => ({ ...DEFAULT_CFG, color }), [color])
  const src = useThumbnail(product, cfg, 60 + index * 40)
  const badge = badgeOf(product)
  const href = `#${toHash(product, cfg)}`
  const shown = product.colors.slice(0, 5)

  return (
    <article className="card">
      <div className="card-media">
        <a className="card-plinth" href={href} tabIndex={-1} aria-hidden="true">
          {src ? <img src={src} alt="" width="560" height="560" /> : <span className="card-loading" />}
        </a>
        {badge && <span className={`tag tag-${badge.toLowerCase()}`}>{badge}</span>}
        <SaveButton id={product.id} saved={saved} toggleSaved={toggleSaved} className="card-save" />
        {addToCart && (
          <button type="button" className="quick-add" onClick={() => addToCart(product, cfg)}>
            Add to cart
          </button>
        )}
      </div>
      <div className="card-body">
        <p className="card-cat">{product.category}</p>
        <h3>
          <a href={href}>{product.name}</a>
        </h3>
        <div className="card-foot">
          <span className="price">{money(product.price)}</span>
          {shown.length > 0 && (
            <div className="card-dots" role="group" aria-label="Colours">
              {shown.map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  style={{ background: c.hex }}
                  aria-label={c.name}
                  aria-pressed={i === color}
                  onMouseEnter={() => setColor(i)}
                  onFocus={() => setColor(i)}
                  onClick={() => setColor(i)}
                />
              ))}
              {product.colors.length > 5 && <span className="more-dots">+{product.colors.length - 5}</span>}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
