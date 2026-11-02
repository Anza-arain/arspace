import { byId, money } from '../data/products.js'
import { SHIPPING } from '../account.js'
import { LinePrice, TotalsRows, configText } from './Cart.jsx'

const date = (t) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const statusOf = (o) => o.status ?? 'Processing'
const Pill = ({ status }) => <span className={`pill status-${status.toLowerCase()}`}>{status}</span>

const STEPS = ['Processing', 'Confirmed', 'Shipped', 'Delivered']

// Steps with dates from the order's history; orders placed before history existed start at their order date.
function Timeline({ order }) {
  const history = order.history ?? [{ status: 'Processing', at: order.date }]
  const when = (status) => history.findLast((h) => h.status === status)?.at
  const status = statusOf(order)
  const cancelled = status === 'Cancelled'
  const current = STEPS.indexOf(status)
  // A cancelled order shows only the steps it reached, then the cancellation.
  const steps = cancelled ? [...STEPS.filter((st) => when(st)), 'Cancelled'] : STEPS
  return (
    <ol className="timeline" aria-label="Order status">
      {steps.map((st, i) => {
        const at = when(st)
        const state = st === 'Cancelled' ? 'cancelled' : cancelled || i < current ? 'done' : i === current ? 'current' : 'todo'
        return (
          <li key={st} className={`step step-${state}`} aria-current={st === status ? 'step' : undefined}>
            <span className="step-dot" aria-hidden="true" />
            <strong>{st}</strong>
            <small className="muted">{at ? date(at) : state === 'todo' ? 'Not yet' : ''}</small>
          </li>
        )
      })}
    </ol>
  )
}

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
                    <Pill status={statusOf(o)} />
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
      <Pill status={statusOf(order)} />
      <h1 className="page-title">Thank you, {user.name.split(' ')[0]}.</h1>
      <p className="lede">
        Order <strong>{order.id}</strong> was placed on {date(order.date)}. We'll email {user.email} when it ships.
      </p>
      <Timeline order={order} />
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
              <div className="line-price">
                <LinePrice p={byId[l.id]} cfg={l.cfg} qty={l.qty} sale={l.price} base={l.basePrice ?? l.price} />
              </div>
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
          </dl>
          <dl>
            <TotalsRows totals={order.totals} coupon={order.coupon && `${order.coupon.code} (${order.coupon.percent}% off)`} />
          </dl>
          <a className="btn btn-quiet btn-block" href="#account">
            View all orders
          </a>
        </aside>
      </div>
    </section>
  )
}
