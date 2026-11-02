import ProductCard from '../components/ProductCard.jsx'
import { DEFAULT_CFG, byId, money } from '../data/products.js'
import { useSettings, salePrice } from '../store.js'

export default function Saved({ saved, toggleSaved, addToCart }) {
  const s = useSettings()
  const items = saved.map((id) => byId[id]).filter(Boolean)
  const total = items.reduce((n, p) => n + salePrice(p, DEFAULT_CFG, s), 0)
  return (
    <section className="wrap saved">
      <header className="saved-head">
        <h1 data-reveal="text">Saved</h1>
        <p className="muted">
          {items.length
            ? `${items.length} ${items.length === 1 ? 'piece' : 'pieces'} you keep coming back to, from ${money(total)} together.`
            : 'The pieces you keep coming back to.'}
        </p>
      </header>
      {items.length ? (
        <div className="grid">
          {items.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} saved={saved} toggleSaved={toggleSaved} addToCart={addToCart} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <p>Nothing saved yet. Tap the heart on any piece to keep it here.</p>
          <a className="btn-solid" href="#shop">
            Browse all furniture
          </a>
        </div>
      )}
    </section>
  )
}
