// Admin panel: overview, orders, offers, coupons, categories and the home banner.
// Sections switch with in-page state; all settings go through store.js.
import { useId, useMemo, useState } from 'react'
import { ORDER_STATUSES, SHIPPING } from '../account.js'
import { countByStatus, ordersFromUsers, revenue, validateCategory, validateCoupon } from '../admin-utils.js'
import { CATEGORIES, DEFAULT_CFG, PRODUCTS, byId, money, priceOf } from '../data/products.js'
import { DEFAULTS, categoryOf, normCode, offerOf, updateSettings, useSettings } from '../store.js'
import { configText } from './Cart.jsx'

const SECTIONS = [
  ['overview', 'Overview'],
  ['orders', 'Orders'],
  ['offers', 'Offers and discounts'],
  ['coupons', 'Coupons'],
  ['categories', 'Categories'],
  ['banner', 'Banner and promo'],
]

const fmtDate = (ms, time = false) =>
  ms ? new Date(ms).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', ...(time && { hour: '2-digit', minute: '2-digit' }) }) : 'Unknown date'
const itemCount = (o) => o.totals?.count ?? (o.lines ?? []).reduce((n, l) => n + (l.qty ?? 0), 0)
const PAYMENT = { cod: 'Cash on delivery', bank: 'Bank transfer' }

function save(fn, notify) {
  updateSettings(fn)
  notify('Saved')
}

function StatusPill({ status }) {
  return <span className={`pill status-pill status-${status.toLowerCase()}`}>{status}</span>
}

// A button that asks "Are you sure?" in place instead of using window.confirm.
function ConfirmButton({ label, question, confirmLabel, onConfirm, className = 'btn btn-small' }) {
  const [asking, setAsking] = useState(false)
  if (!asking)
    return (
      <button type="button" className={className} onClick={() => setAsking(true)}>
        {label}
      </button>
    )
  return (
    <span className="adm-confirm" role="group" aria-label={question}>
      <span>{question}</span>
      <button type="button" className="btn btn-small adm-danger" onClick={() => (setAsking(false), onConfirm())} autoFocus>
        {confirmLabel}
      </button>
      <button type="button" className="btn btn-small" onClick={() => setAsking(false)}>
        Keep it
      </button>
    </span>
  )
}

// ---------- Overview

function Overview({ orders, users, s, open }) {
  const counts = countByStatus(orders, ORDER_STATUSES)
  const customers = Object.values(users).filter((u) => u?.role !== 'admin').length
  const stats = [
    ['Revenue', money(revenue(orders)), 'Excludes cancelled orders'],
    ['Orders', orders.length, `${counts.Processing} waiting to be confirmed`],
    ['Customers', customers, 'Accounts in this browser'],
    ['Active offers', Object.values(s.offers).filter((n) => n > 0).length, 'Products with a percent off'],
    ['Active coupons', s.coupons.filter((c) => c.active).length, `${s.coupons.length} in total`],
  ]
  return (
    <>
      <div className="adm-stats">
        {stats.map(([label, value, note]) => (
          <div key={label} className="adm-stat">
            <p className="muted">{label}</p>
            <p className="adm-stat-value">{value}</p>
            <p className="muted small">{note}</p>
          </div>
        ))}
      </div>
      <h3 className="adm-h3">Orders by status</h3>
      <ul className="adm-status-list">
        {ORDER_STATUSES.map((st) => (
          <li key={st}>
            <StatusPill status={st} /> <span className="price">{counts[st]}</span>
          </li>
        ))}
      </ul>
      <h3 className="adm-h3">Latest orders</h3>
      <OrdersTable orders={orders.slice(0, 5)} open={open} empty="No orders yet. They will appear here as customers check out." />
    </>
  )
}

// ---------- Orders

function OrdersTable({ orders, open, selected, empty }) {
  if (!orders.length) return <p className="empty">{empty}</p>
  return (
    <div className="table-wrap">
      <table className="adm-table">
        <thead>
          <tr>
            <th scope="col">Order</th>
            <th scope="col">Customer</th>
            <th scope="col">Date</th>
            <th scope="col" className="num">Items</th>
            <th scope="col" className="num">Total</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.email + o.id} aria-selected={selected === o.email + o.id || undefined}>
              <td>
                <button type="button" className="adm-link" onClick={() => open(o)} aria-label={`View order ${o.id}`}>
                  {o.id}
                </button>
              </td>
              <td>
                {o.customer}
                <span className="muted small adm-block">{o.email}</span>
              </td>
              <td>{fmtDate(o.date)}</td>
              <td className="num">{itemCount(o)}</td>
              <td className="num price">{money(o.totals?.total ?? 0)}</td>
              <td>
                <StatusPill status={o.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function OrderDetail({ order: o, account, notify, close }) {
  const [next, setNext] = useState(o.status)
  const a = o.address ?? {}
  const t = o.totals ?? {}
  const history = o.history?.length ? o.history : [{ status: 'Processing', at: o.date }]
  const update = () => {
    account.setOrderStatus(o.email, o.id, next)
    notify(`Order ${o.id} marked ${next}`)
  }
  return (
    <section className="adm-card adm-detail" aria-labelledby="order-detail-title">
      <div className="adm-row-between">
        <div>
          <h3 id="order-detail-title">Order {o.id}</h3>
          <p className="muted small">
            Placed {fmtDate(o.date, true)} by {o.customer} ({o.email})
          </p>
        </div>
        <button type="button" className="btn btn-small" onClick={close}>
          Close order
        </button>
      </div>

      <div className="adm-status-form">
        <div className="form-field">
          <label htmlFor="order-status">Status</label>
          <select id="order-status" value={next} onChange={(e) => setNext(e.target.value)}>
            {ORDER_STATUSES.map((st) => (
              <option key={st}>{st}</option>
            ))}
          </select>
        </div>
        <button type="button" className="btn btn-primary" onClick={update} disabled={next === o.status}>
          Update status
        </button>
      </div>

      <h4>Items</h4>
      <ul className="adm-lines">
        {(o.lines ?? []).map((l) => (
          <li key={l.key ?? l.id}>
            <span>
              {l.name ?? byId[l.id]?.name ?? l.id}
              {byId[l.id] && l.cfg && <span className="muted small adm-block">{configText(byId[l.id], l.cfg)}</span>}
            </span>
            <span className="muted">
              {l.qty} x {money(l.price ?? 0)}
            </span>
            <span className="price">{money((l.price ?? 0) * (l.qty ?? 0))}</span>
          </li>
        ))}
      </ul>
      <dl className="adm-totals">
        <dt>Subtotal</dt>
        <dd>{money(t.subtotal ?? 0)}</dd>
        {o.coupon && (
          <>
            <dt>
              Coupon {o.coupon.code} ({o.coupon.percent}% off)
            </dt>
            <dd>-{money(t.discount ?? 0)}</dd>
          </>
        )}
        <dt>Shipping</dt>
        <dd>{t.shipping ? money(t.shipping) : 'Free'}</dd>
        <dt className="adm-total">Total</dt>
        <dd className="adm-total">{money(t.total ?? 0)}</dd>
      </dl>

      <div className="adm-detail-grid">
        <div>
          <h4>Deliver to</h4>
          <p>
            {a.name ?? o.customer}
            <br />
            {a.address}
            <br />
            {[a.city, a.postal].filter(Boolean).join(' ')}
            {a.country && <br />}
            {a.country}
          </p>
          {a.phone && <p className="muted small">Phone {a.phone}</p>}
        </div>
        <div>
          <h4>Delivery and payment</h4>
          <p>{SHIPPING[o.delivery]?.name ?? 'Standard'}</p>
          <p>{PAYMENT[a.payment] ?? a.payment ?? 'Not recorded'}</p>
          <p className="muted small">{o.coupon ? `Coupon ${o.coupon.code} used` : 'No coupon used'}</p>
        </div>
      </div>

      <h4>Status history</h4>
      <ol className="adm-timeline">
        {history.map((h, i) => (
          <li key={i}>
            <StatusPill status={h.status ?? 'Processing'} />
            <span className="muted small">{fmtDate(h.at, true)}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Orders({ orders, account, notify, selected, setSelected }) {
  const [status, setStatus] = useState('All')
  const [q, setQ] = useState('')
  const term = q.trim().toLowerCase()
  const shown = orders.filter(
    (o) => (status === 'All' || o.status === status) && (!term || [o.id, o.customer, o.email].some((x) => String(x).toLowerCase().includes(term))),
  )
  const order = orders.find((o) => o.email + o.id === selected)
  return (
    <>
      <div className="adm-filters">
        <div className="form-field">
          <label htmlFor="order-filter">Status</label>
          <select id="order-filter" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="All">All statuses</option>
            {ORDER_STATUSES.map((st) => (
              <option key={st}>{st}</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="order-search">Search</label>
          <input id="order-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order id, name or email" />
        </div>
      </div>
      <p className="muted small" aria-live="polite">
        Showing {shown.length} of {orders.length} orders
      </p>
      <OrdersTable
        orders={shown}
        selected={selected}
        open={(o) => setSelected(o.email + o.id)}
        empty={orders.length ? 'No orders match these filters.' : 'No orders yet.'}
      />
      {order && <OrderDetail key={order.id + order.status} order={order} account={account} notify={notify} close={() => setSelected(null)} />}
    </>
  )
}

// ---------- Offers

function Offers({ s, notify }) {
  const [draft, setDraft] = useState(() => Object.fromEntries(PRODUCTS.map((p) => [p.id, String(offerOf(p, s))])))
  const bad = (v) => v.trim() !== '' && (!Number.isInteger(Number(v)) || Number(v) < 0 || Number(v) > 90)
  const invalid = PRODUCTS.some((p) => bad(draft[p.id]))
  const active = Object.keys(s.offers).length
  const submit = (e) => {
    e.preventDefault()
    if (invalid) return
    const offers = {}
    for (const p of PRODUCTS) if (Number(draft[p.id]) > 0) offers[p.id] = Number(draft[p.id])
    save((x) => ({ ...x, offers }), notify)
  }
  return (
    <form onSubmit={submit} noValidate>
      <p className="muted adm-lede">Set a percent off for any product, from 1 to 90. Use 0 to remove an offer. Sale prices are for the base configuration.</p>
      <div className="table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Category</th>
              <th scope="col" className="num">Base price</th>
              <th scope="col">Percent off</th>
              <th scope="col" className="num">Sale price</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map((p) => {
              const v = draft[p.id]
              const pct = bad(v) ? 0 : Number(v) || 0
              const base = priceOf(p, DEFAULT_CFG)
              return (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{categoryOf(p, s)}</td>
                  <td className="num price">{money(base)}</td>
                  <td>
                    <label className="sr-only" htmlFor={`off-${p.id}`}>
                      Percent off {p.name}
                    </label>
                    <input
                      id={`off-${p.id}`}
                      className="adm-input adm-num"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="90"
                      step="1"
                      value={v}
                      aria-invalid={bad(v) || undefined}
                      onChange={(e) => setDraft({ ...draft, [p.id]: e.target.value })}
                    />
                    {bad(v) && <span className="error adm-block">Use 0 to 90.</span>}
                  </td>
                  <td className="num price">
                    {pct > 0 ? (
                      <>
                        {money(Math.round(base * (1 - pct / 100)))} <s className="muted">{money(base)}</s>
                      </>
                    ) : (
                      <span className="muted">No offer</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="adm-actions">
        <button type="submit" className="btn btn-primary" disabled={invalid}>
          Save offers
        </button>
        {active > 0 && (
          <ConfirmButton
            className="btn btn-quiet"
            label="Clear all offers"
            question={`Remove all ${active} offers?`}
            confirmLabel="Clear offers"
            onConfirm={() => save((x) => ({ ...x, offers: {} }), notify)}
          />
        )}
        {invalid && <p className="error">Fix the highlighted percentages before saving.</p>}
      </div>
    </form>
  )
}

// ---------- Coupons

function Coupons({ s, notify }) {
  const [form, setForm] = useState({ code: '', percent: '' })
  const [errors, setErrors] = useState({})
  const submit = (e) => {
    e.preventDefault()
    const errs = validateCoupon(form, s.coupons)
    setErrors(errs)
    if (Object.keys(errs).length) return
    const coupon = { code: normCode(form.code), percent: Number(form.percent), active: true }
    save((x) => ({ ...x, coupons: [...x.coupons, coupon] }), notify)
    setForm({ code: '', percent: '' })
  }
  const setCoupon = (code, fn) => save((x) => ({ ...x, coupons: x.coupons.flatMap((c) => (c.code === code ? fn(c) : [c])) }), notify)
  return (
    <>
      {s.coupons.length ? (
        <div className="table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Code</th>
                <th scope="col" className="num">Percent off</th>
                <th scope="col">Active</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {s.coupons.map((c) => (
                <tr key={c.code}>
                  <td>
                    <code className="adm-code">{c.code}</code>
                  </td>
                  <td className="num">{c.percent}%</td>
                  <td>
                    <label className="adm-switch">
                      <input type="checkbox" checked={c.active} onChange={() => setCoupon(c.code, (x) => [{ ...x, active: !x.active }])} />
                      <span>{c.active ? 'Active' : 'Paused'}</span>
                      <span className="sr-only"> coupon {c.code}</span>
                    </label>
                  </td>
                  <td className="num">
                    <ConfirmButton
                      label={<>Delete<span className="sr-only"> coupon {c.code}</span></>}
                      question={`Delete ${c.code}?`}
                      confirmLabel="Delete coupon"
                      onConfirm={() => setCoupon(c.code, () => [])}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty">No coupons yet. Create one below.</p>
      )}

      <form className="adm-card adm-form" onSubmit={submit} noValidate>
        <h3>Create a coupon</h3>
        <div className="adm-form-row">
          <Field label="Code" error={errors.code} hint="3 to 20 letters or digits. Saved in capitals.">
            {(p) => <input {...p} value={form.code} maxLength={20} autoCapitalize="characters" onChange={(e) => setForm({ ...form, code: e.target.value })} />}
          </Field>
          <Field label="Percent off" error={errors.percent} hint="1 to 90">
            {(p) => <input {...p} type="number" inputMode="numeric" min="1" max="90" value={form.percent} onChange={(e) => setForm({ ...form, percent: e.target.value })} />}
          </Field>
        </div>
        <button type="submit" className="btn btn-primary">
          Create coupon
        </button>
      </form>
    </>
  )
}

// Label + input + hint + inline error, wired with ids for screen readers.
function Field({ label, error, hint, count, children }) {
  const id = useId()
  const describedBy = [hint && id + 'h', error && id + 'e'].filter(Boolean).join(' ') || undefined
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {(hint || count) && (
        <span id={id + 'h'} className="muted small adm-row-between">
          <span>{hint}</span>
          {count && <span>{count}</span>}
        </span>
      )}
      {error && (
        <span id={id + 'e'} className="error">
          {error}
        </span>
      )}
    </div>
  )
}

// ---------- Categories

function Categories({ s, notify }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [renaming, setRenaming] = useState(null) // { from, to, error }
  const counts = useMemo(() => {
    const n = {}
    for (const p of PRODUCTS) n[categoryOf(p, s)] = (n[categoryOf(p, s)] ?? 0) + 1
    return n
  }, [s])

  const move = (i, d) => {
    const cats = [...s.categories]
    ;[cats[i], cats[i + d]] = [cats[i + d], cats[i]]
    save((x) => ({ ...x, categories: cats }), notify)
  }
  const add = (e) => {
    e.preventDefault()
    const err = validateCategory(name, s.categories)
    setError(err)
    if (err) return
    save((x) => ({ ...x, categories: [...x.categories, name.trim()] }), notify)
    setName('')
  }
  const rename = (e) => {
    e.preventDefault()
    const { from, to } = renaming
    const err = validateCategory(to, s.categories, from)
    if (err) return setRenaming({ ...renaming, error: err })
    const n = to.trim()
    save(
      (x) => ({
        ...x,
        categories: x.categories.map((c) => (c === from ? n : c)),
        moves: Object.fromEntries(Object.entries(x.moves).map(([id, c]) => [id, c === from ? n : c])),
      }),
      notify,
    )
    setRenaming(null)
  }
  const fileUnder = (p, cat) =>
    save((x) => {
      const moves = { ...x.moves }
      if (cat === p.category) delete moves[p.id]
      else moves[p.id] = cat
      return { ...x, moves }
    }, notify)

  return (
    <>
      <p className="muted adm-lede">Categories show in this order in the shop. The original categories can be reordered but not renamed or deleted.</p>
      <ol className="adm-cats">
        {s.categories.map((c, i) => {
          const custom = !CATEGORIES.includes(c)
          const n = counts[c] ?? 0
          return (
            <li key={c} className="adm-cat">
              {renaming?.from === c ? (
                <form className="adm-rename" onSubmit={rename} noValidate>
                  <Field label={`New name for ${c}`} error={renaming.error}>
                    {(p) => <input {...p} value={renaming.to} maxLength={24} autoFocus onChange={(e) => setRenaming({ ...renaming, to: e.target.value, error: '' })} />}
                  </Field>
                  <div className="adm-actions">
                    <button type="submit" className="btn btn-small btn-primary">
                      Save name
                    </button>
                    <button type="button" className="btn btn-small" onClick={() => setRenaming(null)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <span className="adm-cat-name">
                    {c}
                    <span className="muted small">
                      {n} {n === 1 ? 'product' : 'products'}
                      {custom ? ', added by you' : ''}
                    </span>
                  </span>
                  <span className="adm-cat-actions">
                    <button type="button" className="btn btn-small" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${c} up`}>
                      Up
                    </button>
                    <button type="button" className="btn btn-small" onClick={() => move(i, 1)} disabled={i === s.categories.length - 1} aria-label={`Move ${c} down`}>
                      Down
                    </button>
                    {custom && (
                      <button type="button" className="btn btn-small" onClick={() => setRenaming({ from: c, to: c, error: '' })} aria-label={`Rename ${c}`}>
                        Rename
                      </button>
                    )}
                    {custom &&
                      (n === 0 ? (
                        <ConfirmButton
                          label={<>Delete<span className="sr-only"> {c}</span></>}
                          question={`Delete ${c}?`}
                          confirmLabel="Delete category"
                          onConfirm={() => save((x) => ({ ...x, categories: x.categories.filter((y) => y !== c) }), notify)}
                        />
                      ) : (
                        <span className="muted small adm-why">Move its products out to delete it.</span>
                      ))}
                  </span>
                </>
              )}
            </li>
          )
        })}
      </ol>

      <form className="adm-card adm-form" onSubmit={add} noValidate>
        <h3>Add a category</h3>
        <div className="adm-form-row">
          <Field label="Category name" error={error} hint="2 to 24 characters: letters, spaces, & or -">
            {(p) => <input {...p} value={name} maxLength={24} onChange={(e) => (setName(e.target.value), setError(''))} />}
          </Field>
        </div>
        <button type="submit" className="btn btn-primary">
          Add category
        </button>
      </form>

      <h3 className="adm-h3">Move products</h3>
      <p className="muted adm-lede">File a product under another category. Choosing its original category undoes the move.</p>
      <div className="table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Original category</th>
              <th scope="col">Filed under</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td className="muted">{p.category}</td>
                <td>
                  <label className="sr-only" htmlFor={`cat-${p.id}`}>
                    Category for {p.name}
                  </label>
                  <select id={`cat-${p.id}`} className="adm-input" value={categoryOf(p, s)} onChange={(e) => fileUnder(p, e.target.value)}>
                    {s.categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ---------- Banner

const BANNER_FIELDS = [
  ['title', 'Headline', 80],
  ['text', 'Intro text', 260],
  ['cta', 'Button label', 30],
  ['promo', 'Promo line', 90],
]

function Banner({ s, notify }) {
  const [b, setB] = useState(s.banner)
  const [errors, setErrors] = useState({})
  const submit = (e) => {
    e.preventDefault()
    const errs = {}
    for (const [k, label, max] of BANNER_FIELDS) {
      if (!b[k].trim()) errs[k] = `${label} cannot be empty.`
      else if (b[k].length > max) errs[k] = `Keep it to ${max} characters.`
    }
    setErrors(errs)
    if (Object.keys(errs).length) return
    const banner = Object.fromEntries(Object.entries(b).map(([k, v]) => [k, v.trim()]))
    save((x) => ({ ...x, banner }), notify)
  }
  const changed = BANNER_FIELDS.some(([k]) => b[k] !== DEFAULTS.banner[k]) || BANNER_FIELDS.some(([k]) => s.banner[k] !== DEFAULTS.banner[k])
  return (
    <div className="adm-banner">
      <form className="adm-form" onSubmit={submit} noValidate>
        {BANNER_FIELDS.map(([k, label, max]) => (
          <Field key={k} label={label} error={errors[k]} count={`${b[k].length} of ${max}`}>
            {(p) =>
              k === 'text' ? (
                <textarea {...p} className="adm-textarea" rows={5} maxLength={max} value={b[k]} onChange={(e) => setB({ ...b, [k]: e.target.value })} />
              ) : (
                <input {...p} maxLength={max} value={b[k]} onChange={(e) => setB({ ...b, [k]: e.target.value })} />
              )
            }
          </Field>
        ))}
        <div className="adm-actions">
          <button type="submit" className="btn btn-primary">
            Save banner
          </button>
          {changed && (
            <ConfirmButton
              className="btn btn-quiet"
              label="Restore defaults"
              question="Replace the banner with the original copy?"
              confirmLabel="Restore defaults"
              onConfirm={() => save((x) => ({ ...x, banner: DEFAULTS.banner }), notify)}
            />
          )}
        </div>
      </form>
      <figure className="adm-preview" aria-label="Live preview of the home banner">
        <figcaption className="muted small">Preview</figcaption>
        <div className="adm-preview-card">
          <p className="adm-preview-promo">{b.promo || 'Promo line'}</p>
          <p className="adm-preview-title">{b.title || 'Headline'}</p>
          <p className="muted">{b.text || 'Intro text'}</p>
          <span className="btn btn-primary adm-preview-cta">{b.cta || 'Button label'}</span>
        </div>
      </figure>
    </div>
  )
}

// ---------- Page

export default function Admin({ account, notify }) {
  const s = useSettings()
  const [tab, setTab] = useState('overview')
  const [selected, setSelected] = useState(null)
  const orders = useMemo(() => ordersFromUsers(account.users), [account.users])
  const title = SECTIONS.find(([k]) => k === tab)[1]
  const open = (o) => (setSelected(o.email + o.id), setTab('orders'))

  return (
    <section className="wrap page admin">
      <div className="adm-head">
        <h1 className="page-title">Store admin</h1>
        <p className="muted">Signed in as {account.user?.email}. Changes save in this browser and show in the shop straight away.</p>
      </div>
      <div className="adm-layout">
        <nav className="adm-nav" aria-label="Admin sections">
          {SECTIONS.map(([k, label]) => (
            <button key={k} type="button" className="adm-tab" aria-current={tab === k ? 'page' : undefined} onClick={() => setTab(k)}>
              {label}
              {k === 'orders' && orders.length > 0 && <span className="adm-count">{orders.length}</span>}
            </button>
          ))}
        </nav>
        <div className="adm-main">
          <h2 className="adm-h2">{title}</h2>
          {tab === 'overview' && <Overview orders={orders} users={account.users} s={s} open={open} />}
          {tab === 'orders' && <Orders orders={orders} account={account} notify={notify} selected={selected} setSelected={setSelected} />}
          {tab === 'offers' && <Offers key={JSON.stringify(s.offers)} s={s} notify={notify} />}
          {tab === 'coupons' && <Coupons s={s} notify={notify} />}
          {tab === 'categories' && <Categories s={s} notify={notify} />}
          {tab === 'banner' && <Banner key={JSON.stringify(s.banner)} s={s} notify={notify} />}
        </div>
      </div>
    </section>
  )
}

