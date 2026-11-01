import { money } from '../data/products.js'
import { SHIPPING } from '../account.js'
import { configText } from './Cart.jsx'
import { byId } from '../data/products.js'

const date = (t) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export function Account({ account, onLogout }) {
  const { user } = account
  return (
    <section className="wrap page">
      <div className="account-head">
        <div>
          <h1 className="page-title">Hello, {user.name.split(' ')[0]}</h1>
          <p className="muted">
            {user.email}. Member since {date(user.joined)}.
          </p>
        </div>
        <button type="button" className="btn btn-quiet" onClick={onLogout}>
          Sign out
        </button>
      </div>

      <div className="stats">
        <a href="#account">
          <strong>{user.orders.length}</strong> orders
        </a>
        <a href="#saved">
          <strong>{user.saved.length}</strong> saved
        </a>
        <a href="#cart">
          <strong>{user.cart.reduce((n, l) => n + l.qty, 0)}</strong> in cart
        </a>
      </div>

      <h2 className="section-title">Orders</h2>
      {user.orders.length ? (
        <div className="table-wrap">
          <table className="orders">
            <thead>
              <tr>
                <th scope="col">Order</th>
                <th scope="col">Placed</th>
                <th scope="col">Items</th>
                <th scope="col">Status</th>
                <th scope="col" className="num">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {user.orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <a href={`#order-${o.id}`}>{o.id}</a>
                  </td>
                  <td>{date(o.date)}</td>
                  <td>{o.lines.map((l) => l.name).join(', ')}</td>
                  <td>
                    <span className="pill">Processing</span>
                  </td>
                  <td className="num price">{money(o.totals.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">
          <p>No orders yet. Your orders will appear here after checkout.</p>
          <a className="btn btn-primary" href="#catalog">
            Start shopping
          </a>
        </div>
      )}
    </section>
  )
}

export function Order({ order, user }) {
  if (!order)
    return (
      <section className="wrap page">
        <h1 className="page-title">Order not found</h1>
        <div className="empty">
          <p>This order isn't in your account. Check your orders list.</p>
          <a className="btn btn-primary" href="#account">
            View my orders
          </a>
        </div>
      </section>
    )
  const a = order.address
  return (
    <section className="wrap page order">
      <p className="pill pill-ok">Order placed</p>
      <h1 className="page-title">Thank you, {user.name.split(' ')[0]}.</h1>
      <p className="lede">
        Order <strong>{order.id}</strong> is confirmed. We'll email {user.email} when it ships.
      </p>
      <div className="two-col">
        <ul className="lines">
          {order.lines.map((l) => (
            <li key={l.key} className="line line-plain">
              <div className="line-info">
                <h3>
                  {l.qty} × {l.name}
                </h3>
                <p className="muted">{byId[l.id] ? configText(byId[l.id], l.cfg) : ''}</p>
              </div>
              <p className="price line-price">{money(l.price * l.qty)}</p>
            </li>
          ))}
        </ul>
        <aside className="summary">
          <h2>Delivery</h2>
          <address>
            {a.name}
            <br />
            {a.address}
            <br />
            {[a.city, a.postal].filter(Boolean).join(' ')}
            <br />
            {a.country}
            <br />
            {a.phone}
          </address>
          <dl>
            <div>
              <dt>Method</dt>
              <dd>{SHIPPING[order.delivery].name}</dd>
            </div>
            <div>
              <dt>Payment</dt>
              <dd>{a.payment === 'bank' ? 'Bank transfer' : 'Cash on delivery'}</dd>
            </div>
            <div className="total">
              <dt>Total</dt>
              <dd>{money(order.totals.total)}</dd>
            </div>
          </dl>
          <a className="btn btn-quiet btn-block" href="#account">
            View all orders
          </a>
        </aside>
      </div>
    </section>
  )
}
