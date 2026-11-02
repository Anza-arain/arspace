import { useEffect, useMemo, useRef, useState } from 'react'
import { PRODUCTS, money } from '../data/products.js'
import { useSettings, productsIn } from '../store.js'
import { useThumbnail } from './ProductCard.jsx'

const icon = {
  search: 'M10.5 4a6.5 6.5 0 1 0 4 11.6l4.4 4.4 1.4-1.4-4.4-4.4A6.5 6.5 0 0 0 10.5 4zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z',
  heart: 'M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z',
  bag: 'M7 8V7a5 5 0 0 1 10 0v1h3l-1 13H5L4 8h3zm2 0h6V7a3 3 0 0 0-6 0v1zm-2.9 2 .7 9h10.4l.7-9H6.1z',
  user: 'M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 10c4.4 0 8 2 8 4.5V20H4v-1.5C4 16 7.6 14 12 14z',
  menu: 'M4 7h16v1.6H4zm0 8.4h16V17H4z',
}
export const Icon = ({ d, size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path d={d} />
  </svg>
)
export const ICONS = icon

// Category names become hash-safe slugs (letters, digits, hyphens).
const slug = (c) => c.toLowerCase().replace(/[^a-z0-9]+/g, '-')
const initials = (name) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

// Centre links: label shown, category it opens.
const NAV = [
  ['Sofas', 'Sofas'],
  ['Beds', 'Beds'],
  ['Tables', 'Tables'],
  ['Desks', 'Desks'],
  ['Chairs', 'Seating'],
  ['Lamps', 'Lighting'],
]

// Menus are native <details>; close them on outside click, Escape, or a link click.
function useCloseMenus(ref) {
  useEffect(() => {
    const close = (e) => {
      ref.current?.querySelectorAll('details[open]').forEach((d) => {
        if (e.type === 'keydown' ? e.key === 'Escape' : !d.contains(e.target) || e.target.closest('a')) d.open = false
      })
    }
    document.addEventListener('click', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('click', close)
      document.removeEventListener('keydown', close)
    }
  }, [ref])
}

function MegaFeature() {
  const lead = PRODUCTS.find((p) => p.featured) ?? PRODUCTS[0]
  const src = useThumbnail(lead)
  return (
    <a className="mega-feature" href={`#${lead.id}`}>
      <span className="mega-img">{src && <img src={src} alt="" width="560" height="560" />}</span>
      <span className="mega-feature-name">{lead.name}</span>
      <span className="muted">From {money(lead.price)}</span>
    </a>
  )
}

function Result({ p, active, onPick }) {
  const src = useThumbnail(p)
  return (
    <li>
      <a href={`#${p.id}`} className="result" aria-selected={active} onClick={onPick}>
        <span className="result-img">{src && <img src={src} alt="" width="560" height="560" />}</span>
        <span className="result-text">
          <strong>{p.name}</strong>
          <small className="muted">{p.category}</small>
        </span>
        <span className="price">{money(p.price)}</span>
      </a>
    </li>
  )
}

// Search panel with live results. Opens from the search button or Ctrl/Cmd + K.
function Search({ open, onClose, onSearch }) {
  const dialog = useRef(null)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)

  useEffect(() => {
    const d = dialog.current
    if (open && !d.open) {
      setQ('')
      setActive(0)
      d.showModal()
    }
    if (!open && d.open) d.close()
  }, [open])

  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return PRODUCTS.filter((p) => p.featured).slice(0, 5)
    return PRODUCTS.filter((p) => `${p.name} ${p.category} ${p.blurb} ${p.finishes.map((f) => f.name).join(' ')}`.toLowerCase().includes(t)).slice(0, 6)
  }, [q])

  function submit(e) {
    e.preventDefault()
    const pick = results[active]
    if (q.trim() && !pick) {
      onSearch(q.trim())
      location.hash = 'shop'
    } else if (pick) location.hash = pick.id
    onClose()
  }

  return (
    <dialog ref={dialog} className="search-dialog" onClose={onClose} aria-label="Search the store" onClick={(e) => e.target === dialog.current && onClose()}>
      <form onSubmit={submit} className="search-box" role="search">
        <Icon d={icon.search} />
        <input
          autoFocus
          type="search"
          value={q}
          placeholder="Search sofas, beds, walnut, marble"
          aria-label="Search the store"
          aria-controls="search-results"
          onChange={(e) => {
            setQ(e.target.value)
            setActive(0)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') setActive((a) => Math.min(a + 1, results.length - 1))
            if (e.key === 'ArrowUp') setActive((a) => Math.max(a - 1, 0))
          }}
        />
        <kbd className="desktop-only">Esc</kbd>
      </form>
      <p className="search-label">{q.trim() ? `${results.length ? results.length : 'No'} matches` : 'People are looking at'}</p>
      {results.length > 0 ? (
        <ul id="search-results" className="results" role="listbox">
          {results.map((p, i) => (
            <Result key={p.id} p={p} active={i === active} onPick={onClose} />
          ))}
        </ul>
      ) : (
        <p className="search-empty">
          Nothing matches “{q}”. Try a room, like <em>bedroom</em>, or a material, like <em>oak</em>.
        </p>
      )}
      {q.trim() && (
        <button
          type="button"
          className="search-all"
          onClick={() => {
            onSearch(q.trim())
            location.hash = 'shop'
            onClose()
          }}
        >
          See every result for “{q.trim()}” in the shop
        </button>
      )}
    </dialog>
  )
}

export default function Header({ user, isAdmin, cartCount, savedCount, route, onSearch, onLogout }) {
  const ref = useRef(null)
  const s = useSettings()
  const [searching, setSearching] = useState(false)
  const [bar, setBar] = useState({ solid: false, hidden: false })
  const [roll, setRoll] = useState(0)
  const lastCount = useRef(cartCount)
  useCloseMenus(ref)

  // Roll the bag number when something is added.
  useEffect(() => {
    if (cartCount > lastCount.current) setRoll((r) => r + 1)
    lastCount.current = cartCount
  }, [cartCount])

  useEffect(() => {
    let lastY = scrollY
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearching(true)
      }
    }
    // Hide on scroll down, show on scroll up; solid after 80px. Never hide with a menu open.
    const onScroll = () => {
      const y = scrollY
      const menuOpen = ref.current?.querySelector('details[open]')
      const hidden = !menuOpen && y > 160 && y > lastY
      if (Math.abs(y - lastY) > 4 || y < 80) {
        setBar((b) => (b.hidden === hidden && b.solid === y > 80 ? b : { solid: y > 80, hidden }))
        lastY = y
      }
    }
    addEventListener('keydown', onKey)
    addEventListener('scroll', onScroll, { passive: true })
    return () => {
      removeEventListener('keydown', onKey)
      removeEventListener('scroll', onScroll)
    }
  }, [])

  const here = (page) => (route.page === page ? 'page' : undefined)
  const inCat = (c) => (route.page === 'shop' && route.category === c ? 'page' : undefined)
  const counted = s.categories.map((c) => [c, productsIn(c, s).length])

  return (
    <>
      {s.banner.promo && <p className="promo">{s.banner.promo}</p>}
      <header className="site-header" data-solid={bar.solid || undefined} data-hidden={bar.hidden || undefined} ref={ref} onFocus={() => bar.hidden && setBar((b) => ({ ...b, hidden: false }))}>
        <div className="wrap header-inner">
          <details className="menu mobile-only">
            <summary aria-label="Menu">
              <Icon d={icon.menu} />
            </summary>
            <div className="menu-panel drawer">
              <a href="#shop">All furniture</a>
              {counted.map(([c, n]) => (
                <a key={c} href={`#shop-${slug(c)}`}>
                  {c} <span className="muted">{n}</span>
                </a>
              ))}
              <p className="menu-title">Account</p>
              {user ? <a href="#account">Your account</a> : <a href="#login">Sign in or create account</a>}
              <a href="#saved">Saved</a>
              {isAdmin && <a href="#admin">Admin panel</a>}
            </div>
          </details>

          <a className="wordmark" href="#" aria-label="Furnova home">
            Furnova
          </a>

          <nav className="main-nav desktop-only" aria-label="Main">
            <details className="menu mega">
              <summary aria-current={route.page === 'shop' && route.category === 'All' ? 'page' : undefined}>Shop</summary>
              <div className="mega-panel">
                <div className="wrap mega-inner">
                  <div className="mega-cats">
                    <a className="mega-all" href="#shop">
                      All furniture <span className="muted">{PRODUCTS.length}</span>
                    </a>
                    {counted.map(([c, n]) => (
                      <a key={c} href={`#shop-${slug(c)}`}>
                        {c} <span className="muted">{n}</span>
                      </a>
                    ))}
                  </div>
                  <MegaFeature />
                </div>
              </div>
            </details>
            {NAV.map(([label, c]) => (
              <a key={label} className="ul" href={`#shop-${slug(c)}`} aria-current={inCat(c)}>
                {label}
              </a>
            ))}
          </nav>

          <div className="header-icons">
            <button type="button" className="icon-btn search-btn" onClick={() => setSearching(true)} aria-label="Search (Ctrl K)">
              <Icon d={icon.search} />
              <span className="wide-only" aria-hidden="true">
                Search
              </span>
            </button>
            <a className="icon-btn saved-btn" href="#saved" aria-label={`Saved, ${savedCount} items`} aria-current={here('saved')}>
              <Icon d={icon.heart} />
              {savedCount > 0 && <span className="badge">{savedCount}</span>}
            </a>
            <a className="icon-btn" href="#cart" aria-label={`Bag, ${cartCount} items`} aria-current={here('cart')}>
              <Icon d={icon.bag} />
              {cartCount > 0 && (
                <span key={roll} className="badge" data-roll={roll > 0 || undefined}>
                  {cartCount}
                </span>
              )}
            </a>
            {user ? (
              <details className="menu account-menu">
                <summary aria-label="Account menu">
                  <span className="avatar">{initials(user.name)}</span>
                </summary>
                <div className="menu-panel menu-right">
                  <p className="menu-user">
                    <strong>{user.name}</strong>
                    <span className="muted">{user.email}</span>
                  </p>
                  <a href="#account">Your account</a>
                  <a href="#account">Orders {user.orders.length > 0 && <span className="muted">{user.orders.length}</span>}</a>
                  <a href="#saved">Saved</a>
                  {isAdmin && <a href="#admin">Admin panel</a>}
                  <button type="button" onClick={onLogout}>
                    Sign out
                  </button>
                </div>
              </details>
            ) : (
              <a className="icon-btn sign-in" href="#login" aria-label="Sign in">
                <Icon d={icon.user} />
              </a>
            )}
          </div>
        </div>
      </header>
      <Search open={searching} onClose={() => setSearching(false)} onSearch={onSearch} />
    </>
  )
}
