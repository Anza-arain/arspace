import { useCallback, useEffect, useMemo, useState } from 'react'
import Stage from '../three/Stage.jsx'
import { measure } from '../three/models.js'
import ProductCard from '../components/ProductCard.jsx'
import { Swatches } from '../components/Options.jsx'
import { byId, CATEGORIES, PRODUCTS, money, priceOf } from '../data/products.js'
import { toHash } from '../route.js'

const hero = byId.orbit
const MAX_PRICE = Math.max(...PRODUCTS.map((p) => p.price))

function Hero() {
  const [cfg, setCfg] = useState({ color: 0, finish: 0, option: 0 })
  const [dims, setDims] = useState(null)
  const onModel = useCallback((m) => setDims(measure(m)), [])
  return (
    <section className="hero wrap">
      <div className="hero-copy">
        <h1>See the chair in your room before it ships.</h1>
        <p className="lede">
          Every piece in ARSpace is a live 3D model built at real size. Choose the cloth and the frame, drag to look at it from any
          side, then place it on your own floor with your phone's camera.
        </p>
        <div className="hero-pick">
          <Swatches label="Try a fabric" colors={hero.colors} value={cfg.color} onChange={(color) => setCfg({ ...cfg, color })} />
          <div className="chips" role="group" aria-label="Frame">
            {hero.finishes.map((f, i) => (
              <button key={f.key} type="button" className="chip" aria-pressed={cfg.finish === i} onClick={() => setCfg({ ...cfg, finish: i })}>
                {f.name}
              </button>
            ))}
          </div>
        </div>
        <div className="hero-actions">
          <a className="btn btn-primary" href={`#${toHash(hero, cfg)}`}>
            Open in configurator
          </a>
          <a className="btn btn-quiet" href="#catalog">
            Browse {PRODUCTS.length} pieces
          </a>
        </div>
      </div>
      <figure className="hero-stage">
        <Stage className="stage" product={hero} cfg={cfg} onModel={onModel} />
        <figcaption>
          <span>{hero.name}</span>
          {dims && (
            <span className="dims">
              W {dims.w} × D {dims.d} × H {dims.h} cm
            </span>
          )}
          <span className="price">{money(priceOf(hero, cfg))}</span>
        </figcaption>
      </figure>
    </section>
  )
}

const STEPS = [
  ['Configure', 'Colour, material and size update the model instantly. The price follows.'],
  ['Inspect', 'Orbit and zoom. Dimensions are measured from the model itself, in centimetres.'],
  ['Place', 'On Android and iPhone the model opens in AR at 1:1 scale on your floor.'],
]

function Catalog({ saved, toggleSaved, category: fromLink, query, setQuery }) {
  const [category, setCategory] = useState(fromLink ?? 'All')
  useEffect(() => {
    if (fromLink) setCategory(fromLink) // #shop-lighting links from the menu
  }, [fromLink])
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE)
  const [sort, setSort] = useState('featured')

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = PRODUCTS.filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        p.price <= maxPrice &&
        (!q || `${p.name} ${p.category} ${p.blurb}`.toLowerCase().includes(q)),
    )
    if (sort === 'low') list.sort((a, b) => a.price - b.price)
    if (sort === 'high') list.sort((a, b) => b.price - a.price)
    if (sort === 'featured') list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    return list
  }, [query, category, maxPrice, sort])

  const clear = () => {
    setQuery('')
    setCategory('All')
    setMaxPrice(MAX_PRICE)
  }

  return (
    <section className="catalog wrap" id="catalog" aria-labelledby="catalog-title">
      <div className="catalog-head">
        <h2 id="catalog-title">Catalog</h2>
        <p className="muted">{items.length === PRODUCTS.length ? `${items.length} pieces` : `${items.length} of ${PRODUCTS.length} pieces`}</p>
      </div>

      <div className="filters">
        <div className="chips" role="group" aria-label="Category">
          {['All', ...CATEGORIES].map((c) => (
            <button key={c} type="button" className="chip" aria-pressed={category === c} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
        <div className="filter-row">
          <label className="field search">
            <span className="sr-only">Search</span>
            <input id="search" type="search" placeholder="Search lamps, oak, sofa…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <label className="field range">
            <span>Up to {money(maxPrice)}</span>
            <input id="max-price" type="range" min="50" max={MAX_PRICE} step="10" value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} />
          </label>
          <label className="field">
            <span className="sr-only">Sort</span>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Featured first</option>
              <option value="low">Price, low to high</option>
              <option value="high">Price, high to low</option>
            </select>
          </label>
        </div>
      </div>

      {items.length ? (
        <div className="grid">
          {items.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} saved={saved} toggleSaved={toggleSaved} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <p>Nothing matches these filters.</p>
          <button type="button" className="btn btn-quiet" onClick={clear}>
            Clear filters
          </button>
        </div>
      )}
    </section>
  )
}

export default function Home(props) {
  return (
    <>
      <Hero />
      <section className="steps wrap" id="how" aria-label="How the AR preview works">
        <ol>
          {STEPS.map(([title, text]) => (
            <li key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>
      <Catalog {...props} />
    </>
  )
}
