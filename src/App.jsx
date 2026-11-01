import { useEffect, useRef, useState } from 'react'
import { parseHash, toHash } from './route.js'
import { cartTotals, useAccount } from './account.js'
import Header from './components/Header.jsx'
import Home from './pages/Home.jsx'
import Product from './pages/Product.jsx'
import Saved from './pages/Saved.jsx'
import Auth from './pages/Auth.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import { Account, Order } from './pages/Account.jsx'

// Pages that need a signed-in user, and what to tell a guest who opens them.
const PRIVATE = {
  saved: 'Sign in to see the pieces you saved.',
  cart: 'Sign in to see your cart.',
  checkout: 'Sign in to check out.',
  account: 'Sign in to see your account and orders.',
  order: 'Sign in to see this order.',
}

export default function App() {
  const [route, setRoute] = useState(() => parseHash(location.hash))
  const account = useAccount()
  const { user } = account
  const [toast, setToast] = useState({}) // keeps its text while fading out
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState(null) // action a guest tried before signing in
  const back = useRef('') // where to return after signing in

  useEffect(() => {
    const onHash = () => setRoute(parseHash(location.hash))
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])

  const authPage = route.page === 'login' || route.page === 'signup'
  const pageKey = route.page === 'product' ? route.product.id : route.page
  useEffect(() => {
    if (!authPage) back.current = location.hash.slice(1)
    const target = route.anchor && document.getElementById(route.anchor)
    if (target) target.scrollIntoView()
    else scrollTo(0, 0)
  }, [pageKey, route.anchor, route.category, authPage])

  useEffect(() => {
    if (!toast.show) return
    const t = setTimeout(() => setToast((t) => ({ ...t, show: false })), 3200)
    return () => clearTimeout(t)
  }, [toast])

  const notify = (text, href, action) => setToast({ text, href, action, show: true })

  function run({ type, args }) {
    if (type === 'save') {
      notify(user?.saved.includes(args[0]) ? 'Removed from saved' : 'Saved to your account', '#saved', 'View saved')
      account.toggleSaved(args[0])
    }
    if (type === 'cart') {
      account.addToCart(...args)
      notify(args[3] > 1 ? `Added ${args[3]} to cart` : 'Added to cart', '#cart', 'View cart')
    }
  }

  // Guests are sent to sign in; the action they tried runs right after.
  function gate(message, type, args) {
    if (user) return run({ type, args })
    back.current = location.hash.slice(1)
    setPending({ message, type, args })
    location.hash = 'login'
  }

  useEffect(() => {
    if (!user) return
    if (pending) {
      run(pending)
      setPending(null)
    }
    if (authPage) location.hash = back.current
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email])

  function logout() {
    account.logout()
    notify('Signed out')
    location.hash = ''
  }

  const saved = user?.saved ?? []
  const store = {
    user,
    saved,
    toggleSaved: (id) => gate('Sign in to save pieces to your account.', 'save', [id]),
    addToCart: (product, cfg, qty = 1) => gate('Sign in to add pieces to your cart.', 'cart', [toHash(product, cfg), product.id, cfg, qty]),
    notify,
  }

  let page
  if (PRIVATE[route.page] && !user) page = <Auth mode="login" account={account} message={PRIVATE[route.page]} />
  else if (authPage) page = <Auth mode={route.page} account={account} message={pending?.message} />
  else if (route.page === 'product') page = <Product key={toHash(route.product, route.cfg)} product={route.product} initial={route.cfg} openAR={route.ar} {...store} />
  else if (route.page === 'saved') page = <Saved {...store} />
  else if (route.page === 'cart') page = <Cart account={account} />
  else if (route.page === 'checkout') page = <Checkout account={account} />
  else if (route.page === 'account') page = <Account account={account} onLogout={logout} />
  else if (route.page === 'order') page = <Order order={user.orders.find((o) => o.id === route.id)} user={user} />
  else page = <Home {...store} category={route.category} query={query} setQuery={setQuery} />

  return (
    <>
      <Header user={user} cartCount={user ? cartTotals(user.cart).count : 0} savedCount={saved.length} route={route} onSearch={setQuery} onLogout={logout} />

      <main>{page}</main>

      <footer className="site-footer">
        <div className="wrap footer-grid">
          <div>
            <a className="wordmark" href="#">
              AR<span>Space</span>
            </a>
            <p className="muted">Furniture you can place in your room before you buy it. A portfolio project by Anza Arain.</p>
          </div>
          <nav aria-label="Shop">
            <h2>Shop</h2>
            <a href="#shop-sofas">Sofas</a>
            <a href="#shop-beds">Beds</a>
            <a href="#shop-tables">Tables</a>
            <a href="#shop-desks">Study desks</a>
            <a href="#shop-lighting">Lighting</a>
          </nav>
          <nav aria-label="Your account">
            <h2>Your account</h2>
            {user ? <a href="#account">Orders</a> : <a href="#login">Sign in</a>}
            {!user && <a href="#signup">Create account</a>}
            <a href="#saved">Saved</a>
            <a href="#cart">Cart</a>
          </nav>
          <div>
            <h2>Delivery</h2>
            <p className="muted">Free standard delivery on orders over $500. Express in 2 days. 30-day returns on every piece.</p>
          </div>
        </div>
        <div className="wrap footer-base">
          <span>
            Made with <span className="heart" aria-label="love">❤</span> by Anza
          </span>
        </div>
      </footer>

      <div className="toast" role="status" aria-live="polite" data-show={toast.show ? '' : undefined}>
        {toast.text}
        {toast.href && <a href={toast.href}>{toast.action}</a>}
      </div>
    </>
  )
}
