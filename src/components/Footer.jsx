import { useState } from 'react'

// Site footer: closing line, four link columns, a front-end-only newsletter field.
export default function Footer({ user }) {
  const [joined, setJoined] = useState(false)
  const [error, setError] = useState('')

  function join(e) {
    e.preventDefault()
    const email = new FormData(e.currentTarget).get('email').trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('That email doesn’t look right.')
    setError('')
    setJoined(true)
  }

  return (
    <footer className="site-footer">
      <div className="wrap footer-top">
        <div>
          <p className="footer-line">Come sit for a while.</p>
          <p className="footer-sub">Sofas, beds, tables and desks, made to order. Turn them around in 3D, then stand them in your own room before you buy.</p>
        </div>
        {joined ? (
          <p className="newsletter-done" role="status">
            Thanks, you’re on the list.
          </p>
        ) : (
          <form className="newsletter" onSubmit={join} noValidate>
            <label htmlFor="newsletter-email">A short letter when something new comes in</label>
            <div className="newsletter-row">
              <input id="newsletter-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={error ? true : undefined} aria-describedby={error ? 'newsletter-error' : undefined} />
              <button type="submit">Join</button>
            </div>
            {error && (
              <p id="newsletter-error" className="newsletter-error">
                {error}
              </p>
            )}
          </form>
        )}
      </div>

      <div className="wrap footer-grid">
        <nav aria-label="Shop">
          <h2>Shop</h2>
          <a className="ul" href="#shop">All furniture</a>
          <a className="ul" href="#shop-sofas">Sofas</a>
          <a className="ul" href="#shop-beds">Beds</a>
          <a className="ul" href="#shop-tables">Tables</a>
          <a className="ul" href="#shop-desks">Desks</a>
        </nav>
        <div>
          <h2>Help</h2>
          <p>Free delivery on orders over $500. Express in two days. 30 days to change your mind.</p>
          <p>hello@furnova.store</p>
        </div>
        <nav aria-label="Your account">
          <h2>Account</h2>
          {user ? (
            <a className="ul" href="#account">Orders</a>
          ) : (
            <>
              <a className="ul" href="#login">Sign in</a>
              <a className="ul" href="#signup">Create account</a>
            </>
          )}
          <a className="ul" href="#saved">Saved</a>
          <a className="ul" href="#cart">Bag</a>
        </nav>
        <nav aria-label="Studio">
          <h2>Studio</h2>
          <a className="ul" href="#">About Furnova</a>
        </nav>
      </div>

      <div className="wrap footer-base">
        <span>
          Made with <span className="heart" aria-label="love">❤</span> by Anza
        </span>
      </div>
    </footer>
  )
}
