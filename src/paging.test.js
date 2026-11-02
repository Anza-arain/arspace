// Run with: node src/paging.test.js
import assert from 'node:assert/strict'
import { pageList } from './paging.js'

assert.deepEqual(pageList(1, 1), [1])
assert.deepEqual(pageList(1, 3), [1, 2, 3])
assert.deepEqual(pageList(2, 3), [1, 2, 3])
assert.deepEqual(pageList(5, 9), [1, null, 4, 5, 6, null, 9])
assert.deepEqual(pageList(1, 9), [1, 2, null, 9])
assert.deepEqual(pageList(9, 9), [1, null, 8, 9])

console.log('paging ok')
