// Run with: node src/route.test.js
import assert from 'node:assert/strict'
import { parseHash, toHash } from './route.js'
import { byId } from './data/products.js'

assert.deepEqual(parseHash(''), { page: 'home', anchor: '' })
assert.deepEqual(parseHash('#saved'), { page: 'saved' })

const r = parseHash('#orbit-c2-m1-o1')
assert.equal(r.product.id, 'orbit')
assert.deepEqual(r.cfg, { color: 2, finish: 1, option: 1 })

// Out-of-range and junk values from a tampered link fall back to defaults.
assert.deepEqual(parseHash('#orbit-c99-m-1-ox').cfg, { color: 0, finish: 0, option: 0 })
// Products without colours never accept a colour index.
assert.equal(parseHash('#plinth-c1').cfg.color, 0)

assert.equal(parseHash('#orbit-c1-m0-o0-ar').ar, true)
assert.equal(parseHash('#orbit-c1-m0-o0-ar').cfg.color, 1)
assert.equal(parseHash('#orbit-c1').ar, false)
assert.deepEqual(parseHash('#cart'), { page: 'cart' })
assert.deepEqual(parseHash('#order-AS12XY'), { page: 'order', id: 'AS12XY' })
assert.equal(parseHash('#shop-lighting').category, 'Lighting')
assert.equal(parseHash('#shop-nothing').category, 'All')

// Round trip.
const cfg = { color: 1, finish: 2, option: 0 }
assert.deepEqual(parseHash('#' + toHash(byId.fold, cfg)).cfg, cfg)

console.log('route ok')
