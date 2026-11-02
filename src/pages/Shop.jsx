import { useEffect, useMemo, useRef, useState } from 'react'
import ProductCard from '../components/ProductCard.jsx'
import { DEFAULT_CFG, MATERIALS, PRODUCTS, badgeOf, money } from '../data/products.js'
import { useSettings, categoryOf, offerOf, salePrice, productsIn } from '../store.js'
import { pageList } from '../paging.js'

const PAGE_SIZE = 12
const MAX_PRICE = Math.ceil(Math.max(...PRODUCTS.map((p) => p.price)) / 10) * 10

const INTROS = {
  All: 'Everything we make, ready to turn around in 3D and try in your room.',
  Sofas: 'Deep seats for long evenings and lazy Sundays.',
  Seating: 'Chairs for your first coffee and your last chapter.',
  Beds: 'Beds for the long sleep-in after a long week.',
  Tables: 'Tables that remember every dinner and every spilled glass.',
  Desks: 'A quiet corner for the work that comes home with you.',
  Lighting: 'Lamps you will reach for on dark mornings.',
  Storage: 'Shelves for the books you lend and the ones you keep.',
  Decor: 'Small things that make a room feel lived in.',
  Audio: 'Sound for the kitchen, the bath and the Saturday clean.',
}
const introOf = (c) => INTROS[c] ?? `Pieces from our ${c.toLowerCase()} range, all in live 3D.`

const price = (p, s) => salePrice(p, DEFAULT_CFG, s)
const SORTS = {
  featured: ['Recommended', () => (a, b) => (badgeOf(b) ? 1 : 0) - (badgeOf(a) ? 1 : 0)],
  low: ['Price, low to high', (s) => (a, b) => price(a, s) - price(b, s)],
  high: ['Price, high to low', (s) => (a, b) => price(b, s) - price(a, s)],
  name: ['Name, A to Z', () => (a, b) => a.name.localeCompare(b.name)],
}

export default function Shop({ category: fromLink, query, setQuery, saved, toggleSaved, addToCart }) {
  const s = useSettings()
  const [category, setCategory] = useState(fromLink ?? 'All')
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE)
  const [materials, setMaterials] = useState([])
  const [onOffer, setOnOffer] = useState(false)
  const [sort, setSort] = useState('featured')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const top = useRef(null)

  useEffect(() => setCategory(fromLink ?? 'All'), [fromLink])

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    return PRODUCTS.filter(
      (p) =>
        (category === 'All' || categoryOf(p, s) === category) &&
        price(p, s) <= maxPrice &&
        (!onOffer || offerOf(p, s) > 0) &&
        (!materials.length || p.finishes.some((f) => materials.includes(f.key))) &&
        (!q || `${p.name} ${categoryOf(p, s)} ${p.blurb} ${p.finishes.map((f) => f.name).join(' ')}`.toLowerCase().includes(q)),
    ).sort(SORTS[sort][1](s))
  }, [query, category, maxPrice, materials, onOffer, sort, s])

  // Any filter change starts again at page 1.
  useEffect(() => setPage(1), [query, category, maxPrice, materials, onOffer, sort])

  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const shown = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const go = (n) => {
    setPage(n)
    top.current?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
  }
  const active = (category !== 'All') + (maxPrice < MAX_PRICE) + materials.length + onOffer
  const clear = () => {
    setCategory('All')
    setMaxPrice(MAX_PRICE)
    setMaterials([])
    setOnOffer(false)
    setQuery('')
  }
  const toggleMaterial = (key) => setMaterials((m) => (m.includes(key) ? m.filter((x) => x !== key) : [...m, key]))
  const anyOffers = PRODUCTS.some((p) => offerOf(p, s) > 0)

  return (
    <section className="wrap shop">
      <header className="shop-head">
        <p className="crumbs">
          <a href="#">Home</a> <span aria-hidden="true">/</span> <a href="#shop">Shop</a>
          {category !== 'All' && (
            <>
              {' '}
              <span aria-hidden="true">/</span> {category}
            </>
          )}
        </p>
        <h1 data-reveal="text">{category === 'All' ? 'All furniture' : category}</h1>
        <p className="shop-intro">{introOf(category)}</p>
      </header>

      <div className="shop-layout">
        <aside className="shop-filters" aria-label="Filters">
          <button type="button" className="filters-toggle" aria-expanded={open} aria-controls="filters-body" onClick={() => setOpen((o) => !o)}>
            Filters{active > 0 && <span className="muted"> ({active} on)</span>}
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <div id="filters-body" className="filters-body" data-open={open ? '' : undefined}>
            <fieldset className="filter">
              <legend>Category</legend>
              {['All', ...s.categories].map((c) => (
                <label key={c} className="filter-row">
                  <input type="radio" name="shop-category" checked={category === c} onChange={() => setCategory(c)} />
                  <span>{c === 'All' ? 'Everything' : c}</span>
                  <small>{productsIn(c, s).length}</small>
                </label>
              ))}
            </fieldset>
            <fieldset className="filter">
              <legend>Price</legend>
              <label className="range-row" htmlFor="max-price">
                Up to {money(maxPrice)}
              </label>
              <input id="max-price" type="range" min="80" max={MAX_PRICE} step="10" value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} />
            </fieldset>
            <fieldset className="filter">
              <legend>Material</legend>
              {MATERIALS.map((m) => (
                <label key={m.key} className="filter-row">
                  <input type="checkbox" checked={materials.includes(m.key)} onChange={() => toggleMaterial(m.key)} />
                  <span>{m.name}</span>
                </label>
              ))}
            </fieldset>
            <label className="switch-row">
              <span>
                On offer
                {!anyOffers && <small className="muted"> Nothing right now</small>}
              </span>
              <input type="checkbox" role="switch" checked={onOffer} onChange={(e) => setOnOffer(e.target.checked)} />
            </label>
            {active + Boolean(query) > 0 && (
              <button type="button" className="link-clear" onClick={clear}>
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        <div className="shop-results" ref={top}>
          <div className="shop-tools">
            <p className="muted" aria-live="polite">
              {items.length} {items.length === 1 ? 'piece' : 'pieces'}
            </p>
            {query && (
              <p className="query-chip">
                Results for “{query}”
                <button type="button" onClick={() => setQuery('')} aria-label={`Clear search for ${query}`}>
                  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </p>
            )}
            <label className="sort">
              <span>Sort by</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {Object.entries(SORTS).map(([k, [label]]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {shown.length ? (
            <div className="grid">
              {shown.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} saved={saved} toggleSaved={toggleSaved} addToCart={addToCart} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <p>Nothing matches these filters. Try a wider price or another material.</p>
              <button type="button" className="btn btn-primary" onClick={clear}>
                Clear all filters
              </button>
            </div>
          )}

          {pages > 1 && (
            <nav className="pager" aria-label="Pages">
              <button type="button" onClick={() => go(page - 1)} disabled={page === 1}>
                Previous
              </button>
              <ol>
                {pageList(page, pages).map((n, i) =>
                  n === null ? (
                    <li key={'gap' + i} className="gap" aria-hidden="true">
                      …
                    </li>
                  ) : (
                    <li key={n}>
                      <button type="button" onClick={() => go(n)} aria-current={n === page ? 'page' : undefined} aria-label={`Page ${n}`}>
                        {n}
                      </button>
                    </li>
                  ),
                )}
              </ol>
              <button type="button" onClick={() => go(page + 1)} disabled={page === pages}>
                Next
              </button>
              <p className="pager-note muted">
                Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, items.length)} of {items.length}
              </p>
            </nav>
          )}
        </div>
      </div>
    </section>
  )
}
