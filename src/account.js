// Accounts, saved items, cart and orders.
// ponytail: accounts live in this browser's localStorage (demo store, no server).
// Passwords are never stored: only a salted PBKDF2-SHA256 hash. Swap these
// functions for API calls (e.g. Supabase Auth) to make accounts real.
import { useCallback, useEffect, useState } from 'react'
import { byId, priceOf } from './data/products.js'

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

// Prices always come from the catalog, never from what was stored in the cart.
export function cartTotals(cart, delivery = 'standard') {
  const lines = cart.filter((l) => byId[l.id])
  const subtotal = lines.reduce((n, l) => n + priceOf(byId[l.id], l.cfg) * l.qty, 0)
  const count = lines.reduce((n, l) => n + l.qty, 0)
  const base = SHIPPING[delivery].price
  const shipping = count === 0 ? 0 : delivery === 'standard' && subtotal >= FREE_SHIPPING ? 0 : base
  return { count, subtotal, shipping, total: subtotal + shipping }
}

export function useAccount() {
  const [users, setUsers] = useState(() => read(USERS, {}))
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
    placeOrder(address, delivery) {
      const totals = cartTotals(user.cart, delivery)
      const order = {
        id: 'AS' + Date.now().toString(36).toUpperCase(),
        date: Date.now(),
        delivery,
        address,
        totals,
        lines: user.cart
          .filter((l) => byId[l.id])
          .map((l) => ({ ...l, name: byId[l.id].name, price: priceOf(byId[l.id], l.cfg) })),
      }
      update((u) => ({ ...u, cart: [], orders: [order, ...u.orders] }))
      return order
    },
  }
}
