import { useCallback, useEffect, useRef, useState } from 'react'
import Stage from '../three/Stage.jsx'
import { measure } from '../three/models.js'
import { Choices, Qty, Swatches } from '../components/Options.jsx'
import ProductCard, { AddLabel, Price, SaveButton, useAdded } from '../components/ProductCard.jsx'
import ARModal from '../components/ARModal.jsx'
import { CATEGORIES, PRODUCTS, money } from '../data/products.js'
import { toHash } from '../route.js'
import { useSettings, categoryOf, salePrice } from '../store.js'

// One line about life with each piece, shown under its name.
const STORIES = {
  orbit: 'Low enough to tuck your feet under you, deep enough to finish the book.',
  dune: 'Sink in. Deep enough for a nap, firm enough for your coffee.',
  plinth: 'Somewhere for the mug, the glasses and the book you will finish next week.',
  halo: 'The lamp you will reach for on dark mornings.',
  arc: 'Light over the sofa, right where the crossword is.',
  fold: 'Room for the books you lend out and the ones you never will.',
  tide: 'Holds three stems from the garden, or nothing at all.',
  pebble: 'Sunday radio in the kitchen while the bread proves.',
  haven: 'Sink in. The Haven is deep enough for a nap, firm enough for your coffee.',
  loom: 'Two seats, one dog, and still space in a small flat.',
  mara: 'Made to be leaned on, spilled on and handed down.',
  rest: 'A soft headboard for reading late and sleeping in.',
  timber: 'Beds for the long sleep-in after a long week.',
  atelier: 'Three deep drawers so the kitchen table can be a table again.',
  nook: 'A small desk for the corner by the window.',
  arlo: 'Pull it up to the desk, then to the dinner table when friends come over.',
  slab: 'A table that remembers every dinner.',
  orb: 'Put your feet up. It can take it.',
}

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
  const s = useSettings()
  const [added, flash] = useAdded()
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

  const cat = categoryOf(product, s)
  const catHref = CATEGORIES.includes(cat) ? `#shop-${cat.toLowerCase()}` : '#shop'
  const others = PRODUCTS.filter((p) => p.id !== product.id && categoryOf(p, s) === cat)
    .concat(PRODUCTS.filter((p) => p.id !== product.id && categoryOf(p, s) !== cat))
    .slice(0, 4)

  return (
    <>
      <section className="product wrap">
        <div className="product-stage">
          <Stage className="stage" product={product} cfg={cfg} onModel={onModel} />
          <div className="stage-tools">
            <button type="button" className="btn-line" onClick={() => resetView.current?.()}>
              Reset view
            </button>
            <span className="hint">Drag to turn it around. Pinch or scroll to look closer.</span>
          </div>
        </div>

        <div className="panel">
          <p className="crumbs">
            <a href="#shop">Shop</a> <span aria-hidden="true">/</span> <a href={catHref}>{cat}</a>
          </p>
          <div className="title-row">
            <div>
              <h1>{product.name}</h1>
              <p className="pdp-story">{STORIES[product.id] ?? product.blurb}</p>
            </div>
            <SaveButton id={product.id} saved={saved} toggleSaved={toggleSaved} />
          </div>

          <Price product={product} cfg={cfg} className="pdp-price" />
          <p className="lede">{product.blurb}</p>

          <form className="options" onSubmit={(e) => e.preventDefault()}>
            {product.colors.length > 0 && <Swatches label={product.colorLabel} colors={product.colors} value={cfg.color} onChange={set('color')} />}
            <Choices label={product.finishLabel} choices={product.finishes} value={cfg.finish} onChange={set('finish')} />
            <Choices label={product.option.label} choices={product.option.choices} value={cfg.option} onChange={set('option')} />
          </form>

          <div className="actions">
            <div className="cart-row">
              <Qty value={qty} onChange={setQty} label="Quantity" className="qty-lg" />
              <button
                type="button"
                className="btn-solid btn-bag"
                onClick={() => {
                  addToCart(product, cfg, qty)
                  flash()
                }}
              >
                <AddLabel added={added} label={`${qty > 1 ? `Add ${qty} to bag` : 'Add to bag'}, ${money(salePrice(product, cfg, s) * qty)}`} />
              </button>
            </div>
            <button type="button" className="btn-line btn-ar" onClick={() => setArOpen(true)}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3zm0 2.3 5.6 3.2L12 11.7 6.4 8.5 12 5.3zM6 10.2l5 2.9v5.6l-5-2.8v-5.7zm7 8.5v-5.6l5-2.9v5.7l-5 2.8z" />
              </svg>
              View in your room
            </button>
            <button type="button" className="link-clear" onClick={share}>
              Copy share link
            </button>
          </div>
          {linkFallback && (
            <label className="share-fallback">
              <span>Copy this link</span>
              <input id="share-link" readOnly value={linkFallback} onFocus={(e) => e.target.select()} autoFocus />
            </label>
          )}

          <dl className="spec">
            <div>
              <dt>Dimensions</dt>
              <dd>{dims ? `W ${dims.w} × D ${dims.d} × H ${dims.h} cm` : 'Measuring…'}</dd>
            </div>
            <div>
              <dt>Made by</dt>
              <dd>Furnova Studio</dd>
            </div>
          </dl>
          <ul className="perks">
            <li>Made to order, ships in 2 to 3 weeks</li>
            <li>Free standard delivery over $500</li>
            <li>30 days to live with it, or send it back</li>
          </ul>
        </div>
      </section>

      <section className="wrap more" aria-labelledby="more-title">
        <h2 id="more-title" data-reveal="text">
          Pairs well with
        </h2>
        <div className="grid">
          {others.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} saved={saved} toggleSaved={toggleSaved} addToCart={addToCart} />
          ))}
        </div>
      </section>

      {arOpen && dims && <ARModal product={product} cfg={cfg} model={model.current} url={shareUrl(hash + '-ar')} onClose={() => setArOpen(false)} />}
    </>
  )
}
