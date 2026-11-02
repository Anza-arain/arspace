// Pure helpers for the admin panel: form validation and order aggregation.
// No React here, so `node src/admin-utils.test.js` can run it.
import { normCode } from './store.js'

export const statusOf = (o) => o.status ?? 'Processing'

// Returns { code?, percent? } error messages; empty object means valid.
export function validateCoupon({ code, percent }, coupons = []) {
  const errors = {}
  const c = normCode(code)
  if (!/^[A-Z0-9]{3,20}$/.test(c)) errors.code = 'Use 3 to 20 letters or digits, no spaces.'
  else if (coupons.some((x) => x.code === c)) errors.code = `A coupon called ${c} already exists.`
  const n = Number(percent)
  if (String(percent ?? '').trim() === '' || !Number.isInteger(n) || n < 1 || n > 90) errors.percent = 'Enter a whole number from 1 to 90.'
  return errors
}

// Returns an error message, or '' when the name is fine. `current` is the name being renamed.
export function validateCategory(name, categories = [], current = null) {
  const n = String(name ?? '').trim()
  if (n.length < 2 || n.length > 24) return 'Use 2 to 24 characters.'
  if (!/^[A-Za-z][A-Za-z &-]*$/.test(n)) return 'Use letters, spaces, & or - only, starting with a letter.'
  const lower = n.toLowerCase()
  if (categories.some((c) => c !== current && c.toLowerCase() === lower)) return `There is already a category called ${n}.`
  return ''
}

// Every order from every customer (admin excluded), newest first, with who placed it.
export function ordersFromUsers(users = {}) {
  return Object.values(users)
    .filter((u) => u && u.role !== 'admin')
    .flatMap((u) => (u.orders ?? []).map((o) => ({ ...o, status: statusOf(o), email: u.email, customer: u.name ?? u.email })))
    .sort((a, b) => (b.date ?? 0) - (a.date ?? 0))
}

export const revenue = (orders) => orders.reduce((n, o) => (statusOf(o) === 'Cancelled' ? n : n + (Number(o.totals?.total) || 0)), 0)

export function countByStatus(orders, statuses = []) {
  const counts = Object.fromEntries(statuses.map((s) => [s, 0]))
  for (const o of orders) counts[statusOf(o)] = (counts[statusOf(o)] ?? 0) + 1
  return counts
}
