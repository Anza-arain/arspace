// Run with: node src/account.test.js
import assert from 'node:assert/strict'
import { cartTotals, clampQty, hashPassword, newSalt, validateSignup } from './account.js'
import { DEFAULTS } from './store.js'

// Same password + salt gives the same hash; a different salt does not.
const salt = newSalt()
const h = await hashPassword('secret123', salt)
assert.equal(h, await hashPassword('secret123', salt))
assert.notEqual(h, await hashPassword('secret123', newSalt()))
assert.notEqual(h, await hashPassword('secret124', salt))

assert.deepEqual(validateSignup({ name: 'Anza', email: 'a@b.co', password: 'abcd1234', confirm: 'abcd1234' }), {})
const bad = validateSignup({ name: ' ', email: 'nope', password: 'short', confirm: 'x' })
assert.deepEqual(Object.keys(bad).sort(), ['confirm', 'email', 'name', 'password'])

// orbit $890 + walnut $120 = $1010 x2; tide squat matte = $85. Over $500: free standard shipping.
const cart = [
  { key: 'a', id: 'orbit', cfg: { color: 0, finish: 1, option: 0 }, qty: 2 },
  { key: 'b', id: 'tide', cfg: { color: 0, finish: 0, option: 1 }, qty: 1 },
  { key: 'c', id: 'deleted-product', cfg: { color: 0, finish: 0, option: 0 }, qty: 1 },
]
const none = { ...DEFAULTS, offers: {} }
assert.deepEqual(cartTotals(cart, 'standard', null, none), { count: 3, subtotal: 2105, savings: 0, discount: 0, shipping: 0, total: 2105 })
assert.equal(cartTotals(cart, 'express', null, none).shipping, 79)
assert.deepEqual(cartTotals([cart[1]], 'standard', null, none), { count: 1, subtotal: 85, savings: 0, discount: 0, shipping: 39, total: 124 })
assert.equal(cartTotals([], 'standard', null, none).total, 0)

// Offers: 20% off orbit makes $1010 a $808 unit, so 1616 + 85 = 1701, saving 404.
const sale = { ...DEFAULTS, offers: { orbit: 20 } }
assert.deepEqual(cartTotals(cart, 'standard', null, sale), { count: 3, subtotal: 1701, savings: 404, discount: 0, shipping: 0, total: 1701 })

// Coupon WELCOME10 (any case, object or string) takes 10% of the offer subtotal, rounded: 170.1 -> 170.
assert.equal(cartTotals(cart, 'standard', ' welcome10 ', sale).discount, 170)
assert.equal(cartTotals(cart, 'standard', { code: 'WELCOME10' }, sale).total, 1701 - 170)

// Invalid or inactive coupon: no discount.
assert.equal(cartTotals(cart, 'standard', 'NOPE', sale).discount, 0)
const ended = { ...sale, coupons: [{ code: 'WELCOME10', percent: 10, active: false }] }
assert.equal(cartTotals(cart, 'standard', 'WELCOME10', ended).discount, 0)

// Free standard shipping counts after offers and coupon: 5 x tide tall ($105) = $525 qualifies,
// but 10% off ($53) leaves $472, and a 15% offer makes it 5 x $89 = $445, so delivery is charged.
const five = [{ key: 'd', id: 'tide', cfg: { color: 0, finish: 0, option: 0 }, qty: 5 }]
assert.equal(cartTotals(five, 'standard', null, none).subtotal, 525)
assert.equal(cartTotals(five, 'standard', null, none).shipping, 0)
assert.deepEqual(cartTotals(five, 'standard', 'WELCOME10', none), { count: 5, subtotal: 525, savings: 0, discount: 53, shipping: 39, total: 511 })
assert.equal(cartTotals(five, 'standard', null, { ...none, offers: { tide: 15 } }).shipping, 39)

// Quantity box: typed or stepped values stay within 1 to 99.
assert.equal(clampQty(25), 25)
assert.equal(clampQty('12'), 12)
assert.equal(clampQty(0), 1)
assert.equal(clampQty(250), 99)
assert.equal(clampQty('abc'), 1)
assert.equal(clampQty(3.7), 3)

console.log('account ok')
