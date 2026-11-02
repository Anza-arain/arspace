import { useEffect, useRef, useState } from 'react'
import { parseHash, toHash } from './route.js'
import { cartTotals, useAccount } from './account.js'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Admin from './pages/Admin.jsx'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
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
  admin: 'Sign in with the admin account to manage the store.',
}

export default function App() {
  const [route, setRoute] = useState(() => parseHash(location.hash))
  const account = useAccount()
  const { user } = account
  const [toast, setToast] = useState({}) // keeps its text while fading out
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState(null) // action a guest tried before signing in
  const back = useRef('') // where to return after signing in
  const [recent, setRecent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('furnova:recent')) ?? []
    } catch {
      return []
    }
  })

  // Remember the last pieces looked at, newest first, for "Recently viewed".
  const viewing = route.page === 'product' ? route.product.id : null
  useEffect(() => {
    if (!viewing) return
    setRecent((r) => {
      const next = [viewing, ...r.filter((id) => id !== viewing)].slice(0, 8)
      try {
        localStorage.setItem('furnova:recent', JSON.stringify(next))
      } catch {
        /* not kept */
      }
      return next
    })
  }, [viewing])

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
    if (type === 'room') {
      for (const l of args) account.addToCart(l.key, l.product.id, l.cfg, l.qty)
      notify(`Added ${args.reduce((n, l) => n + l.qty, 0)} pieces to cart`, '#cart', 'View cart')
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
    addRoom: (lines) => gate('Sign in to add this room to your cart.', 'room', lines),
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
  else if (route.page === 'admin') page = account.isAdmin ? <Admin account={account} notify={notify} /> : <Auth mode="login" account={account} message="This page is for the store admin. Sign in with the admin account." />
  else if (route.page === 'shop') page = <Shop {...store} category={route.category} query={query} setQuery={setQuery} />
  else page = <Home {...store} recent={recent} />

  return (
    <>
      <Header user={user} isAdmin={account.isAdmin} cartCount={user ? cartTotals(user.cart).count : 0} savedCount={saved.length} route={route} onSearch={setQuery} onLogout={logout} />

      <main>{page}</main>

      <Footer user={user} />

      <div className="toast" role="status" aria-live="polite" data-show={toast.show ? '' : undefined}>
        {toast.text}
        {toast.href && <a href={toast.href}>{toast.action}</a>}
      </div>
    </>
  )
}
