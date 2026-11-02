import { byId, money, priceOf } from '../data/products.js'
import { cartTotals, FREE_SHIPPING } from '../account.js'
import { offerOf, salePrice, useSettings } from '../store.js'
import { useThumbnail } from '../components/ProductCard.jsx'
import { Qty } from '../components/Options.jsx'

export const configText = (p, cfg) =>
  [p.colors[cfg.color]?.name, p.finishes[cfg.finish].name, p.option.choices[cfg.option].name].filter(Boolean).join(', ')

// Line price for `qty` units: the sale price, plus the struck-through base price and "15% off" when on offer.
// Live lines pass `s` (from useSettings); saved orders pass unit `sale` and `base` and no `s`.
export function LinePrice({ p, cfg, qty, s, sale = salePrice(p, cfg, s), base = priceOf(p, cfg) }) {
  const off = sale < base ? (s ? offerOf(p, s) : Math.round((1 - sale / base) * 100)) : 0
  return (
    <span className="offer-price">
      <span className="price">{money(sale * qty)}</span>
      {off > 0 && (
        <>
          <s className="was">
            <span className="sr-only">Was </span>
            {money(base * qty)}
          </s>
          <small className="offer-note">{off}% off</small>
        </>
      )}
    </span>
  )
}

function Line({ line, account, s }) {
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
          <Qty value={line.qty} onChange={(n) => account.setQty(line.key, n)} label={`Quantity of ${p.name}`} />
          <button type="button" className="link-btn" onClick={() => account.removeLine(line.key)}>
            Remove
          </button>
        </div>
      </div>
      <div className="line-price">
        <LinePrice p={p} cfg={line.cfg} qty={line.qty} s={s} />
      </div>
    </li>
  )
}

// Subtotal before offers, then offer savings and coupon taken off, so the rows add up.
// Works for live totals and for saved orders (older orders have no savings or discount).
export function TotalsRows({ totals, coupon }) {
  const savings = totals.savings ?? 0
  const discount = totals.discount ?? 0
  return (
    <>
      <div>
        <dt>Subtotal</dt>
        <dd>{money(totals.subtotal + savings)}</dd>
      </div>
      {savings > 0 && (
        <div className="saving">
          <dt>Offer savings</dt>
          <dd>−{money(savings)}</dd>
        </div>
      )}
      {discount > 0 && (
        <div className="saving">
          <dt>Coupon {coupon}</dt>
          <dd>−{money(discount)}</dd>
        </div>
      )}
      <div>
        <dt>Delivery</dt>
        <dd>{totals.shipping ? money(totals.shipping) : 'Free'}</dd>
      </div>
      <div className="total">
        <dt>Total</dt>
        <dd>{money(totals.total)}</dd>
      </div>
    </>
  )
}

export function Summary({ totals, children, delivery = 'standard', coupon }) {
  const toFree = FREE_SHIPPING - (totals.subtotal - totals.discount)
  return (
    <aside className="summary">
      <h2>Order summary</h2>
      <dl>
        <TotalsRows totals={totals} coupon={coupon} />
      </dl>
      {delivery === 'standard' && toFree > 0 && totals.count > 0 && <p className="muted small">Add {money(toFree)} more for free delivery.</p>}
      {children}
    </aside>
  )
}

export default function Cart({ account }) {
  const s = useSettings()
  const cart = account.user.cart.filter((l) => byId[l.id])
  const totals = cartTotals(cart, 'standard', null, s)

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
            <Line key={l.key} line={l} account={account} s={s} />
          ))}
        </ul>
        <Summary totals={totals}>
          <p className="muted small">Have a coupon code? You can enter it at checkout.</p>
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
