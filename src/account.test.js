// Run with: node src/account.test.js
import assert from 'node:assert/strict'
import { cartTotals, hashPassword, newSalt, validateSignup } from './account.js'

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
assert.deepEqual(cartTotals(cart), { count: 3, subtotal: 2105, shipping: 0, total: 2105 })
assert.equal(cartTotals(cart, 'express').shipping, 79)
assert.deepEqual(cartTotals([cart[1]]), { count: 1, subtotal: 85, shipping: 39, total: 124 })
assert.equal(cartTotals([]).total, 0)

console.log('account ok')
