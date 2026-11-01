import { useEffect, useState } from 'react'
import { DEFAULT_CFG, money } from '../data/products.js'
import { thumbnail } from '../three/scene.js'

export function useThumbnail(product, cfg = DEFAULT_CFG, delay = 0) {
  const [src, setSrc] = useState(null)
  useEffect(() => {
    // Stagger renders so the first paint is not blocked by eight WebGL draws.
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

export default function ProductCard({ product, index, saved, toggleSaved }) {
  const src = useThumbnail(product, DEFAULT_CFG, 60 + index * 40)
  return (
    <article className="card">
      <a className="card-link" href={`#${product.id}`}>
        <div className="card-plinth">
          {src ? <img src={src} alt="" width="560" height="560" /> : <div className="card-loading" aria-hidden="true" />}
        </div>
        <div className="card-text">
          <h3>{product.name}</h3>
          <p className="card-meta">
            <span>{product.category}</span>
            <span className="price">from {money(product.price)}</span>
          </p>
        </div>
      </a>
      {product.colors.length > 0 && (
        <ul className="card-dots" aria-label={`${product.colors.length} colours`}>
          {product.colors.map((c) => (
            <li key={c.name} style={{ background: c.hex }} title={c.name} />
          ))}
        </ul>
      )}
      <SaveButton id={product.id} saved={saved} toggleSaved={toggleSaved} className="card-save" />
    </article>
  )
}
