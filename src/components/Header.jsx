import { useEffect, useRef } from 'react'
import { CATEGORIES, PRODUCTS } from '../data/products.js'

const icon = {
  search: 'M10.5 4a6.5 6.5 0 1 0 4 11.6l4.4 4.4 1.4-1.4-4.4-4.4A6.5 6.5 0 0 0 10.5 4zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z',
  heart: 'M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z',
  bag: 'M7 8V7a5 5 0 0 1 10 0v1h3l-1 13H5L4 8h3zm2 0h6V7a3 3 0 0 0-6 0v1zm-2.9 2 .7 9h10.4l.7-9H6.1z',
  user: 'M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 10c4.4 0 8 2 8 4.5V20H4v-1.5C4 16 7.6 14 12 14z',
  menu: 'M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z',
}
const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <path d={d} />
  </svg>
)

const count = (c) => PRODUCTS.filter((p) => p.category === c).length
const initials = (name) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

// Menus are native <details>; this closes them on outside click, Escape, or a link click.
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

export default function Header({ user, cartCount, savedCount, route, onSearch, onLogout }) {
  const ref = useRef(null)
  useCloseMenus(ref)
  const here = (page) => (route.page === page ? 'page' : undefined)

  function search(e) {
    e.preventDefault()
    onSearch(new FormData(e.currentTarget).get('q').trim())
    location.hash = 'catalog'
    document.getElementById('catalog')?.scrollIntoView()
  }

  const shopLinks = (
    <>
      <a href="#catalog">All products</a>
      {CATEGORIES.map((c) => (
        <a key={c} href={`#shop-${c.toLowerCase()}`}>
          {c} <span className="muted">{count(c)}</span>
        </a>
      ))}
    </>
  )

  return (
    <>
      <p className="promo">Free standard delivery on orders over $500. 30-day returns.</p>
      <header className="site-header" ref={ref}>
        <div className="wrap header-inner">
          <details className="menu mobile-only">
            <summary aria-label="Menu">
              <Icon d={icon.menu} />
            </summary>
            <div className="menu-panel drawer">
              <form className="header-search" role="search" onSubmit={search}>
                <input name="q" type="search" placeholder="Search the store" aria-label="Search the store" />
              </form>
              <p className="menu-title">Shop</p>
              {shopLinks}
              <p className="menu-title">More</p>
              <a href="#how">How AR works</a>
              {user ? <a href="#account">My account</a> : <a href="#login">Sign in or create account</a>}
            </div>
          </details>

          <a className="wordmark" href="#" aria-label="ARSpace home">
            AR<span>Space</span>
          </a>

          <nav className="main-nav desktop-only" aria-label="Main">
            <details className="menu">
              <summary>Shop</summary>
              <div className="menu-panel">{shopLinks}</div>
            </details>
            <a href="#shop-seating">Seating</a>
            <a href="#shop-lighting">Lighting</a>
            <a href="#how">How AR works</a>
          </nav>

          <form className="header-search desktop-only" role="search" onSubmit={search}>
            <Icon d={icon.search} />
            <input name="q" type="search" placeholder="Search chairs, lamps, oak…" aria-label="Search the store" />
          </form>

          <div className="header-icons">
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
              <a className="sign-in" href="#login">
                <Icon d={icon.user} />
                <span className="desktop-only">Sign in</span>
              </a>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
