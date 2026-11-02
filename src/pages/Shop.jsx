import { useEffect, useMemo, useRef, useState } from 'react'
import ProductCard from '../components/ProductCard.jsx'
import { CATEGORIES, MATERIALS, PRODUCTS, badgeOf, money } from '../data/products.js'
import { pageList } from '../paging.js'

const PAGE_SIZE = 6
const MAX_PRICE = Math.max(...PRODUCTS.map((p) => p.price))
const count = (c) => (c === 'All' ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === c).length)

const SORTS = {
  featured: ['Recommended', (a, b) => (badgeOf(b) ? 1 : 0) - (badgeOf(a) ? 1 : 0)],
  low: ['Price, low to high', (a, b) => a.price - b.price],
  high: ['Price, high to low', (a, b) => b.price - a.price],
  name: ['Name, A to Z', (a, b) => a.name.localeCompare(b.name)],
}


export default function Shop({ category: fromLink, query, setQuery, saved, toggleSaved, addToCart }) {
  const [category, setCategory] = useState(fromLink ?? 'All')
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE)
  const [materials, setMaterials] = useState([])
  const [sort, setSort] = useState('featured')
  const [page, setPage] = useState(1)
  const top = useRef(null)

  useEffect(() => setCategory(fromLink ?? 'All'), [fromLink])

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    return PRODUCTS.filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        p.price <= maxPrice &&
        (!materials.length || p.finishes.some((f) => materials.includes(f.key))) &&
        (!q || `${p.name} ${p.category} ${p.blurb} ${p.finishes.map((f) => f.name).join(' ')}`.toLowerCase().includes(q)),
    ).sort(SORTS[sort][1])
  }, [query, category, maxPrice, materials, sort])

  // Any filter change starts again at page 1.
  useEffect(() => setPage(1), [query, category, maxPrice, materials, sort])

  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const shown = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const go = (n) => {
    setPage(n)
    top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const filtered = category !== 'All' || maxPrice < MAX_PRICE || materials.length > 0 || query
  const clear = () => {
    setCategory('All')
    setMaxPrice(MAX_PRICE)
    setMaterials([])
    setQuery('')
  }
  const toggleMaterial = (key) => setMaterials((m) => (m.includes(key) ? m.filter((x) => x !== key) : [...m, key]))

  const filters = (
    <>
      <fieldset className="filter">
        <legend>Category</legend>
        {['All', ...CATEGORIES].map((c) => (
          <label key={c} className="filter-row">
            <input type="radio" name="category" checked={category === c} onChange={() => setCategory(c)} />
            <span>{c === 'All' ? 'Everything' : c}</span>
            <small>{count(c)}</small>
          </label>
        ))}
      </fieldset>
      <fieldset className="filter">
        <legend>Price</legend>
        <label className="range-row" htmlFor="max-price">
          <span>Up to {money(maxPrice)}</span>
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
      {filtered && (
        <button type="button" className="btn btn-quiet btn-small" onClick={clear}>
          Clear all filters
        </button>
      )}
    </>
  )

  return (
    <section className="wrap shop" ref={top}>
      <div className="shop-head">
        <div>
          <p className="crumbs">
            <a href="#">Home</a> / Shop{category !== 'All' && ` / ${category}`}
          </p>
          <h1>{category === 'All' ? 'All furniture' : category}</h1>
        </div>
        <div className="shop-tools">
          <p className="muted">
            {items.length} {items.length === 1 ? 'piece' : 'pieces'}
          </p>
          <label className="sort">
            <span className="sr-only">Sort by</span>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
              {Object.entries(SORTS).map(([k, [label]]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {query && (
        <p className="query-chip">
          Results for “{query}”
          <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
            ×
          </button>
        </p>
      )}

      <div className="shop-layout">
        <aside className="shop-filters desktop-filters" aria-label="Filters">
          {filters}
        </aside>
        <details className="mobile-filters">
          <summary>Filters{filtered ? ' (on)' : ''}</summary>
          <div className="mobile-filters-body">{filters}</div>
        </details>

        <div className="shop-results">
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
