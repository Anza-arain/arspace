import ProductCard from '../components/ProductCard.jsx'
import { byId, money } from '../data/products.js'

export default function Saved({ saved, toggleSaved }) {
  const items = saved.map((id) => byId[id]).filter(Boolean)
  const total = items.reduce((n, p) => n + p.price, 0)
  return (
    <section className="wrap saved">
      <div className="catalog-head">
        <h1>Saved</h1>
        {items.length > 0 && (
          <p className="muted">
            {items.length} {items.length === 1 ? 'piece' : 'pieces'}, from {money(total)} together
          </p>
        )}
      </div>
      {items.length ? (
        <div className="grid">
          {items.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} saved={saved} toggleSaved={toggleSaved} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <p>Nothing saved yet. Tap the heart on any piece to keep it here.</p>
          <a className="btn btn-primary" href="#catalog">
            Browse the catalog
          </a>
        </div>
      )}
    </section>
  )
}
