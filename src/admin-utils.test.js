// Run with: node src/admin-utils.test.js
import assert from 'node:assert/strict'
import { countByStatus, ordersFromUsers, revenue, validateCategory, validateCoupon } from './admin-utils.js'

const coupons = [{ code: 'WELCOME10', percent: 10, active: true }]
assert.deepEqual(validateCoupon({ code: ' spring25 ', percent: '25' }, coupons), {})
assert.ok(validateCoupon({ code: 'welcome10', percent: 5 }, coupons).code) // duplicate after uppercasing
assert.ok(validateCoupon({ code: 'ab', percent: 5 }, coupons).code)
assert.ok(validateCoupon({ code: 'NO SPACE', percent: 5 }, coupons).code)
assert.ok(validateCoupon({ code: 'A'.repeat(21), percent: 5 }, coupons).code)
for (const p of ['', 0, 91, 12.5, 'x']) assert.ok(validateCoupon({ code: 'OKAY', percent: p }, coupons).percent, `percent ${p}`)
assert.equal(validateCoupon({ code: 'OKAY', percent: 90 }).percent, undefined)

const cats = ['Sofas', 'Beds', 'Kids & Baby']
assert.equal(validateCategory('Outdoor', cats), '')
assert.equal(validateCategory('Home-office & study', cats), '')
assert.ok(validateCategory('sofas', cats)) // case-insensitive duplicate
assert.ok(validateCategory('A', cats))
assert.ok(validateCategory('X'.repeat(25), cats))
assert.ok(validateCategory('Lamps!', cats))
assert.ok(validateCategory('123', cats))
assert.equal(validateCategory('Kids & baby', cats, 'Kids & Baby'), '') // renaming itself, new case is fine

const users = {
  'admin@x.co': { email: 'admin@x.co', role: 'admin', orders: [{ id: 'ADM', date: 9, totals: { total: 999 } }] },
  'a@x.co': { name: 'Ana', email: 'a@x.co', orders: [{ id: 'A1', date: 1, totals: { total: 100 } }, { id: 'A2', date: 3, status: 'Cancelled', totals: { total: 50 } }] },
  'b@x.co': { name: 'Ben', email: 'b@x.co', orders: [{ id: 'B1', date: 2, status: 'Shipped', totals: { total: 30 } }] },
  'c@x.co': { name: 'Cy', email: 'c@x.co' }, // no orders key
}
const all = ordersFromUsers(users)
assert.deepEqual(all.map((o) => o.id), ['A2', 'B1', 'A1'])
assert.equal(all[2].status, 'Processing')
assert.equal(all[1].customer, 'Ben')
assert.equal(all[1].email, 'b@x.co')
assert.equal(revenue(all), 130)
assert.equal(revenue([]), 0)
assert.deepEqual(countByStatus(all, ['Processing', 'Shipped', 'Delivered', 'Cancelled']), { Processing: 1, Shipped: 1, Delivered: 0, Cancelled: 1 })

console.log('admin ok')
