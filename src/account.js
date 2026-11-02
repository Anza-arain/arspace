// Accounts, saved items, cart and orders.
// ponytail: accounts live in this browser's localStorage (demo store, no server).
// Passwords are never stored: only a salted PBKDF2-SHA256 hash. Swap these
// functions for API calls (e.g. Supabase Auth) to make accounts real.
import { useCallback, useEffect, useState } from 'react'
import { byId, priceOf } from './data/products.js'
import { findCoupon, getSettings, salePrice } from './store.js'

const USERS = 'arspace:users'
const SESSION = 'arspace:session'

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage blocked: account lasts for this visit only */
  }
}

const b64 = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)))
const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))

export function newSalt() {
  return b64(crypto.getRandomValues(new Uint8Array(16)))
}

export async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: fromB64(salt), iterations: 210000 }, key, 256)
  return b64(bits)
}

// Constant-time string compare, so a wrong password takes as long as a near-miss.
function sameHash(a, b) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export const normEmail = (e) => e.trim().toLowerCase()
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateSignup({ name, email, password, confirm }) {
  const errors = {}
  if (name.trim().length < 2) errors.name = 'Enter your name.'
  if (!EMAIL.test(email.trim())) errors.email = 'Enter an email like name@example.com.'
  if (password.length < 8 || !/[a-z]/i.test(password) || !/\d/.test(password))
    errors.password = 'Use at least 8 characters with a letter and a number.'
  if (confirm !== password) errors.confirm = 'Passwords do not match.'
  return errors
}

// 0–4, for the strength meter on the signup form.
export function passwordStrength(pw) {
  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 12) s++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++
  if (/\d/.test(pw) && /[^a-z0-9]/i.test(pw)) s++
  return s
}

export const MAX_QTY = 99
export const clampQty = (n) => Math.max(1, Math.min(MAX_QTY, Math.floor(Number(n)) || 1))

export const FREE_SHIPPING = 500
export const SHIPPING = { standard: { name: 'Standard, 5 to 7 days', price: 39 }, express: { name: 'Express, 2 days', price: 79 } }

// Prices always come from the catalog (with the admin's offers), never from what was stored in the cart.
// `coupon` is a code or { code }; it is re-checked against settings, so an ended code gives no discount.
export function cartTotals(cart, delivery = 'standard', coupon = null, s = getSettings()) {
  let count = 0
  let subtotal = 0
  let base = 0
  for (const l of cart) {
    const p = byId[l.id]
    if (!p) continue
    count += l.qty
    subtotal += salePrice(p, l.cfg, s) * l.qty
    base += priceOf(p, l.cfg) * l.qty
  }
  const c = findCoupon(coupon?.code ?? coupon, s)
  const discount = c ? Math.round((subtotal * c.percent) / 100) : 0
  const shipping = count === 0 ? 0 : delivery === 'standard' && subtotal - discount >= FREE_SHIPPING ? 0 : SHIPPING[delivery].price
  return { count, subtotal, savings: base - subtotal, discount, shipping, total: subtotal - discount + shipping }
}

// Demo admin account, so the admin panel works on a fresh browser.
// Email admin@furnova.store, password Furnova@2026 (stored only as this salted hash).
export const ADMIN_EMAIL = 'admin@furnova.store'
const ADMIN = {
  name: 'Furnova Admin',
  email: ADMIN_EMAIL,
  role: 'admin',
  salt: '84DA7zgS3MGNhvwxJzYVmw==',
  hash: 'BsOSoc0IZtJLU/UR9MueNd+weT2eA22LlVZPm6FUyIQ=',
  joined: 0,
  saved: [],
  cart: [],
  orders: [],
}

export const ORDER_STATUSES = ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']

export function useAccount() {
  const [users, setUsers] = useState(() => {
    const all = read(USERS, {})
    return all[ADMIN_EMAIL] ? all : { ...all, [ADMIN_EMAIL]: ADMIN }
  })
  const [email, setEmail] = useState(() => read(SESSION, null))
  useEffect(() => write(USERS, users), [users])
  useEffect(() => write(SESSION, email), [email])

  const user = email ? (users[email] ?? null) : null
  const update = useCallback((fn) => setUsers((all) => ({ ...all, [email]: fn(all[email]) })), [email])

  const signup = async ({ name, email: raw, password }) => {
    const e = normEmail(raw)
    if (users[e]) throw new Error('An account with this email already exists. Sign in instead.')
    const salt = newSalt()
    const hash = await hashPassword(password, salt)
    setUsers((all) => ({ ...all, [e]: { name: name.trim(), email: e, salt, hash, joined: Date.now(), saved: [], cart: [], orders: [] } }))
    setEmail(e)
  }

  const login = async (raw, password) => {
    const u = users[normEmail(raw)]
    // Hash even for unknown emails so response time doesn't reveal which emails exist.
    const hash = await hashPassword(password, u?.salt ?? newSalt())
    if (!u || !sameHash(hash, u.hash)) throw new Error('Email or password is incorrect.')
    setEmail(u.email)
  }

  return {
    user,
    isAdmin: user?.role === 'admin',
    users, // every account in this browser, for the admin panel
    // Admin: move an order to a new status, with a dated history entry.
    setOrderStatus: (email, orderId, status) =>
      setUsers((all) => ({
        ...all,
        [email]: {
          ...all[email],
          orders: all[email].orders.map((o) => (o.id === orderId ? { ...o, status, history: [...(o.history ?? []), { status, at: Date.now() }] } : o)),
        },
      })),
    signup,
    login,
    logout: () => setEmail(null),
    toggleSaved: (id) => update((u) => ({ ...u, saved: u.saved.includes(id) ? u.saved.filter((x) => x !== id) : [...u.saved, id] })),
    addToCart: (key, id, cfg, qty = 1) =>
      update((u) => {
        const hit = u.cart.find((l) => l.key === key)
        const cart = hit ? u.cart.map((l) => (l === hit ? { ...l, qty: clampQty(l.qty + qty) } : l)) : [...u.cart, { key, id, cfg, qty: clampQty(qty) }]
        return { ...u, cart }
      }),
    setQty: (key, qty) => update((u) => ({ ...u, cart: u.cart.map((l) => (l.key === key ? { ...l, qty: clampQty(qty) } : l)) })),
    removeLine: (key) => update((u) => ({ ...u, cart: u.cart.filter((l) => l.key !== key) })),
    placeOrder(address, delivery, coupon = null) {
      const s = getSettings()
      const c = findCoupon(coupon?.code ?? coupon, s)
      const at = Date.now()
      const order = {
        id: 'AS' + at.toString(36).toUpperCase(),
        date: at,
        status: 'Processing',
        history: [{ status: 'Processing', at }],
        delivery,
        address,
        coupon: c ? { code: c.code, percent: c.percent } : null,
        totals: cartTotals(user.cart, delivery, c, s),
        lines: user.cart
          .filter((l) => byId[l.id])
          .map(({ key, id, cfg, qty }) => ({ key, id, cfg, qty, name: byId[id].name, price: salePrice(byId[id], cfg, s), basePrice: priceOf(byId[id], cfg) })),
      }
      update((u) => ({ ...u, cart: [], orders: [order, ...u.orders] }))
      return order
    },
  }
}
