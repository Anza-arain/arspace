// Hash routing. Hashes are plain `#name` strings (letters, digits, hyphens) so they
// survive being shared and work on any static host without server rewrites.
//   #           home + catalog
//   #saved      favourites
//   #orbit-c2-m1-o0   product "orbit" with colour 2, finish 1, option 0
//   #orbit-c2-m1-o0-ar  same, opening straight into the AR view (used by the QR code)
//   #login #signup #account #cart #checkout   store pages
//   #order-AS1X2Y     order confirmation
//   #shop-lighting    catalog filtered to a category
import { byId, CATEGORIES, DEFAULT_CFG } from './data/products.js'

const KEYS = { c: 'color', m: 'finish', o: 'option' }
const PAGES = ['saved', 'login', 'signup', 'account', 'cart', 'checkout']

export function parseHash(hash) {
  const h = hash.replace(/^#/, '')
  if (PAGES.includes(h)) return { page: h }
  if (h.startsWith('order-')) return { page: 'order', id: h.slice(6) }
  if (h.startsWith('shop-')) {
    const category = CATEGORIES.find((c) => c.toLowerCase() === h.slice(5))
    return { page: 'home', anchor: 'catalog', category: category ?? 'All' }
  }
  const [id, ...parts] = h.split('-')
  const product = byId[id]
  if (!product) return { page: 'home', anchor: h }

  // The hash comes from a shared link, so clamp every index to what the product offers.
  const max = { color: product.colors.length, finish: product.finishes.length, option: product.option.choices.length }
  const cfg = { ...DEFAULT_CFG }
  for (const part of parts) {
    const key = KEYS[part[0]]
    const n = Number(part.slice(1))
    if (key && Number.isInteger(n) && n >= 0 && n < max[key]) cfg[key] = n
  }
  return { page: 'product', product, cfg, ar: parts.includes('ar') }
}

export const toHash = (p, cfg) => `${p.id}-c${cfg.color}-m${cfg.finish}-o${cfg.option}`
