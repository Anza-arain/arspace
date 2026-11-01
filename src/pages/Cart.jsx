import { byId, money, priceOf } from '../data/products.js'
import { cartTotals, FREE_SHIPPING } from '../account.js'
import { useThumbnail } from '../components/ProductCard.jsx'

export const configText = (p, cfg) =>
  [p.colors[cfg.color]?.name, p.finishes[cfg.finish].name, p.option.choices[cfg.option].name].filter(Boolean).join(', ')

function Line({ line, account }) {
  const p = byId[line.id]
  const src = useThumbnail(p, line.cfg)
  return (
    <li className="line">
      <a className="line-img" href={`#${line.key}`}>
        {src && <img src={src} alt="" width="560" height="560" />}
      </a>
      <div className="line-info">
        <a href={`#${line.key}`}>
          <h3>{p.name}</h3>
        </a>
        <p className="muted">{configText(p, line.cfg)}</p>
        <div className="line-actions">
          <div className="qty" role="group" aria-label={`Quantity of ${p.name}`}>
            <button type="button" onClick={() => account.setQty(line.key, line.qty - 1)} disabled={line.qty <= 1} aria-label="Decrease quantity">
              −
            </button>
            <output aria-live="polite">{line.qty}</output>
            <button type="button" onClick={() => account.setQty(line.key, line.qty + 1)} disabled={line.qty >= 9} aria-label="Increase quantity">
              +
            </button>
          </div>
          <button type="button" className="link-btn" onClick={() => account.removeLine(line.key)}>
            Remove
          </button>
        </div>
      </div>
      <p className="price line-price">{money(priceOf(p, line.cfg) * line.qty)}</p>
    </li>
  )
}

export function Summary({ totals, children, delivery = 'standard' }) {
  const toFree = FREE_SHIPPING - totals.subtotal
  return (
    <aside className="summary">
      <h2>Order summary</h2>
      <dl>
        <div>
          <dt>Subtotal</dt>
          <dd>{money(totals.subtotal)}</dd>
        </div>
        <div>
          <dt>Delivery</dt>
          <dd>{totals.shipping ? money(totals.shipping) : 'Free'}</dd>
        </div>
        <div className="total">
          <dt>Total</dt>
          <dd>{money(totals.total)}</dd>
        </div>
      </dl>
      {delivery === 'standard' && toFree > 0 && totals.count > 0 && <p className="muted small">Add {money(toFree)} more for free delivery.</p>}
      {children}
    </aside>
  )
}

export default function Cart({ account }) {
  const cart = account.user.cart.filter((l) => byId[l.id])
  const totals = cartTotals(cart)

  if (!cart.length)
    return (
      <section className="wrap page">
        <h1 className="page-title">Your cart</h1>
        <div className="empty">
          <p>Your cart is empty. Configure a piece and choose Add to cart.</p>
          <a className="btn btn-primary" href="#catalog">
            Browse the catalog
          </a>
        </div>
      </section>
    )

  return (
    <section className="wrap page">
      <h1 className="page-title">
        Your cart <span className="muted">{totals.count} {totals.count === 1 ? 'item' : 'items'}</span>
      </h1>
      <div className="two-col">
        <ul className="lines">
          {cart.map((l) => (
            <Line key={l.key} line={l} account={account} />
          ))}
        </ul>
        <Summary totals={totals}>
          <a className="btn btn-primary btn-block" href="#checkout">
            Check out
          </a>
          <a className="btn btn-quiet btn-block" href="#catalog">
            Continue shopping
          </a>
        </Summary>
      </div>
    </section>
  )
}
