// Site footer.
export default function Footer({ user }) {
  return (
    <footer className="site-footer">
    <div className="wrap footer-grid">
      <div>
        <a className="wordmark" href="#">
          Furnova
        </a>
        <p className="muted">Sofas, beds, tables and desks made to order, that you can see in your room before you buy.</p>
      </div>
      <nav aria-label="Shop">
        <h2>Shop</h2>
        <a href="#shop">All furniture</a>
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
        <h2>Help</h2>
        <p className="muted">Free standard delivery on orders over $500, express in 2 days, and 30-day returns on every piece.</p>
      </div>
    </div>
    <div className="wrap footer-base">
      <span>
        Made with <span className="heart" aria-label="love">❤</span> by Anza
      </span>
    </div>
  </footer>
  )
}
