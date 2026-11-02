import { useEffect, useMemo, useRef, useState } from 'react'
import { CATEGORIES, PRODUCTS, money } from '../data/products.js'
import { useThumbnail } from './ProductCard.jsx'

const icon = {
  search: 'M10.5 4a6.5 6.5 0 1 0 4 11.6l4.4 4.4 1.4-1.4-4.4-4.4A6.5 6.5 0 0 0 10.5 4zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z',
  heart: 'M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z',
  bag: 'M7 8V7a5 5 0 0 1 10 0v1h3l-1 13H5L4 8h3zm2 0h6V7a3 3 0 0 0-6 0v1zm-2.9 2 .7 9h10.4l.7-9H6.1z',
  user: 'M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 10c4.4 0 8 2 8 4.5V20H4v-1.5C4 16 7.6 14 12 14z',
  menu: 'M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z',
}
export const Icon = ({ d, size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path d={d} />
  </svg>
)
export const ICONS = icon

const count = (c) => PRODUCTS.filter((p) => p.category === c).length
const initials = (name) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

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

function CategoryTile({ category }) {
  const lead = PRODUCTS.find((p) => p.category === category)
  const src = useThumbnail(lead)
  return (
    <a className="mega-tile" href={`#shop-${category.toLowerCase()}`}>
      <span className="mega-img">{src && <img src={src} alt="" width="560" height="560" />}</span>
      <span>
        <strong>{category}</strong>
        <small className="muted">
          {count(category)} {count(category) === 1 ? 'piece' : 'pieces'}
        </small>
      </span>
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

// Search panel with live results. Opens from the search icon or Ctrl/Cmd + K.
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
          placeholder="Search sofas, beds, walnut, marble…"
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
      <p className="search-label">{q.trim() ? `${results.length ? results.length : 'No'} matches` : 'Trending now'}</p>
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

const NAV = ['Sofas', 'Beds', 'Tables', 'Desks']

export default function Header({ user, cartCount, savedCount, route, onSearch, onLogout }) {
  const ref = useRef(null)
  const [searching, setSearching] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useCloseMenus(ref)

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearching(true)
      }
    }
    const onScroll = () => setScrolled(scrollY > 8)
    addEventListener('keydown', onKey)
    addEventListener('scroll', onScroll, { passive: true })
    return () => {
      removeEventListener('keydown', onKey)
      removeEventListener('scroll', onScroll)
    }
  }, [])

  const here = (page) => (route.page === page ? 'page' : undefined)
  const inCat = (c) => (route.page === 'shop' && route.category === c ? 'page' : undefined)

  return (
    <>
      <p className="promo">Free delivery on orders over $500, and 30 days to return any piece.</p>
      <header className="site-header" data-scrolled={scrolled || undefined} ref={ref}>
        <div className="wrap header-inner">
          <details className="menu mobile-only">
            <summary aria-label="Menu">
              <Icon d={icon.menu} />
            </summary>
            <div className="menu-panel drawer">
              <a href="#shop">Shop all</a>
              {CATEGORIES.map((c) => (
                <a key={c} href={`#shop-${c.toLowerCase()}`}>
                  {c} <span className="muted">{count(c)}</span>
                </a>
              ))}
              <p className="menu-title">Account</p>
              {user ? <a href="#account">My account</a> : <a href="#login">Sign in or create account</a>}
              <a href="#saved">Saved</a>
            </div>
          </details>

          <a className="wordmark" href="#" aria-label="Furnova home">
            Furnova
          </a>

          <nav className="main-nav desktop-only" aria-label="Main">
            <details className="menu mega">
              <summary aria-current={route.page === 'shop' && route.category === 'All' ? 'page' : undefined}>Shop</summary>
              <div className="menu-panel mega-panel">
                <div className="mega-grid">
                  {CATEGORIES.slice(0, 8).map((c) => (
                    <CategoryTile key={c} category={c} />
                  ))}
                </div>
                <a className="mega-all" href="#shop">
                  Shop all {PRODUCTS.length} pieces
                </a>
              </div>
            </details>
            {NAV.map((c) => (
              <a key={c} href={`#shop-${c.toLowerCase()}`} aria-current={inCat(c)}>
                {c}
              </a>
            ))}
          </nav>

          <div className="header-icons">
            <button type="button" className="icon-btn search-btn" onClick={() => setSearching(true)} aria-label="Search (Ctrl K)">
              <Icon d={icon.search} />
              <span className="desktop-only">Search</span>
            </button>
            <a className="icon-btn" href="#saved" aria-label={`Saved, ${savedCount} items`} aria-current={here('saved')}>
              <Icon d={icon.heart} />
              {savedCount > 0 && <span className="badge">{savedCount}</span>}
            </a>
            <a className="icon-btn" href="#cart" aria-label={`Cart, ${cartCount} items`} aria-current={here('cart')}>
              <Icon d={icon.bag} />
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
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
                  <a href="#account">My account</a>
                  <a href="#account">Orders {user.orders.length > 0 && <span className="muted">{user.orders.length}</span>}</a>
                  <a href="#saved">Saved</a>
                  <button type="button" onClick={onLogout}>
                    Sign out
                  </button>
                </div>
              </details>
            ) : (
              <a className="icon-btn sign-in" href="#login">
                <Icon d={icon.user} />
                <span className="desktop-only">Sign in</span>
              </a>
            )}
          </div>
        </div>
      </header>
      <Search open={searching} onClose={() => setSearching(false)} onSearch={onSearch} />
    </>
  )
}
