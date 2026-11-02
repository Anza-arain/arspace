import { useState } from 'react'
import { byId, money } from '../data/products.js'
import { cartTotals, FREE_SHIPPING, SHIPPING } from '../account.js'
import { findCoupon, useSettings } from '../store.js'
import { LinePrice, Summary, configText } from './Cart.jsx'

const COUNTRIES = ['Pakistan', 'United Arab Emirates', 'Saudi Arabia', 'United Kingdom', 'United States', 'Other']

export default function Checkout({ account }) {
  const { user } = account
  const [delivery, setDelivery] = useState('standard')
  const [payment, setPayment] = useState('cod')
  const [code, setCode] = useState('')
  const [applied, setApplied] = useState('')
  const [codeError, setCodeError] = useState('')
  const s = useSettings()
  const cart = user.cart.filter((l) => byId[l.id])
  // Re-checked on every render, so a code the admin ends drops off before the order is placed.
  const coupon = findCoupon(applied, s)
  const totals = cartTotals(cart, delivery, coupon, s)
  const couponError = codeError || (applied && !coupon ? "That code isn't valid or has ended." : '')

  function applyCoupon(e) {
    e.preventDefault()
    const c = findCoupon(code, s)
    if (c) {
      setApplied(c.code)
      setCode('')
      setCodeError('')
    } else setCodeError(code.trim() ? "That code isn't valid or has ended." : 'Enter a coupon code.')
  }
  function removeCoupon() {
    setApplied('')
    setCodeError('')
  }

  if (!cart.length)
    return (
      <section className="wrap page">
        <h1 className="page-title">Checkout</h1>
        <div className="empty">
          <p>There is nothing to check out yet.</p>
          <a className="btn btn-primary" href="#catalog">
            Browse the catalog
          </a>
        </div>
      </section>
    )

  // Native form validation (required, pattern) handles field checks before this runs.
  function submit(e) {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.currentTarget))
    const order = account.placeOrder({ ...f, payment }, delivery, coupon)
    location.hash = 'order-' + order.id
  }

  return (
    <section className="wrap page">
      <h1 className="page-title">Checkout</h1>
      <div className="two-col">
        <form className="checkout" id="checkout-form" onSubmit={submit}>
          <fieldset>
            <legend>Contact</legend>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="co-name">Full name</label>
                <input id="co-name" name="name" defaultValue={user.name} autoComplete="name" required />
              </div>
              <div className="form-field">
                <label htmlFor="co-email">Email</label>
                <input id="co-email" value={user.email} readOnly />
              </div>
              <div className="form-field">
                <label htmlFor="co-phone">Phone</label>
                <input id="co-phone" name="phone" type="tel" autoComplete="tel" placeholder="+92 300 1234567" pattern="[+0-9 ()-]{7,20}" title="Digits, spaces and + only" required />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Delivery address</legend>
            <div className="form-grid">
              <div className="form-field span-2">
                <label htmlFor="co-address">Street address</label>
                <input id="co-address" name="address" autoComplete="street-address" required />
              </div>
              <div className="form-field">
                <label htmlFor="co-city">City</label>
                <input id="co-city" name="city" autoComplete="address-level2" required />
              </div>
              <div className="form-field">
                <label htmlFor="co-postal">
                  Postal code <span className="muted">optional</span>
                </label>
                <input id="co-postal" name="postal" autoComplete="postal-code" />
              </div>
              <div className="form-field span-2">
                <label htmlFor="co-country">Country</label>
                <select id="co-country" name="country" autoComplete="country-name" defaultValue="Pakistan">
                  {COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Delivery method</legend>
            <div className="radio-cards">
              {Object.entries(SHIPPING).map(([key, s]) => (
                <label key={key} className="radio-card">
                  <input type="radio" name="delivery" value={key} checked={delivery === key} onChange={() => setDelivery(key)} />
                  <span>
                    <strong>{s.name}</strong>
                    <small>{key === 'standard' && totals.subtotal - totals.discount >= FREE_SHIPPING ? 'Free' : money(s.price)}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Payment</legend>
            <div className="radio-cards">
              <label className="radio-card">
                <input type="radio" name="pay" checked={payment === 'cod'} onChange={() => setPayment('cod')} />
                <span>
                  <strong>Cash on delivery</strong>
                  <small>Pay when it arrives</small>
                </span>
              </label>
              <label className="radio-card">
                <input type="radio" name="pay" checked={payment === 'bank'} onChange={() => setPayment('bank')} />
                <span>
                  <strong>Bank transfer</strong>
                  <small>Details sent by email</small>
                </span>
              </label>
            </div>
            <p className="muted small">This is a demo store. No payment is taken and nothing is shipped.</p>
          </fieldset>
        </form>

        <Summary totals={totals} delivery={delivery} coupon={coupon?.code}>
          <form className="coupon" onSubmit={applyCoupon} noValidate>
            {coupon ? (
              <p className="coupon-applied">
                <span>
                  <strong>{coupon.code}</strong> applied, {coupon.percent}% off
                </span>
                <button type="button" className="link-btn" onClick={removeCoupon}>
                  Remove
                </button>
              </p>
            ) : (
              <>
                <label htmlFor="co-coupon">Coupon code</label>
                <div className="coupon-row">
                  <input
                    id="co-coupon"
                    value={code}
                    onChange={(e) => (setCode(e.target.value), setCodeError(''))}
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck="false"
                    aria-invalid={couponError ? 'true' : undefined}
                    aria-describedby={couponError ? 'co-coupon-error' : undefined}
                  />
                  <button className="btn btn-quiet">Apply</button>
                </div>
              </>
            )}
            {couponError && (
              <p className="error" id="co-coupon-error" role="alert">
                {couponError}
              </p>
            )}
          </form>
          <ul className="mini-lines">
            {cart.map((l) => (
              <li key={l.key}>
                <span>
                  {l.qty} × {byId[l.id].name}
                  <small className="muted">{configText(byId[l.id], l.cfg)}</small>
                </span>
                <LinePrice p={byId[l.id]} cfg={l.cfg} qty={l.qty} s={s} />
              </li>
            ))}
          </ul>
          <button className="btn btn-primary btn-block" form="checkout-form">
            Place order, {money(totals.total)}
          </button>
        </Summary>
      </div>
    </section>
  )
}
