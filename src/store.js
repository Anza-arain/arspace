// Store settings that the admin panel changes and the storefront reads:
// home banner and promo line, categories (including new ones), category moves,
// product offers (percent off) and coupon codes.
// ponytail: kept in this browser's localStorage like accounts; move to a backend
// (e.g. Supabase) together with account.js to share settings across devices.
import { useSyncExternalStore } from 'react'
import { CATEGORIES, PRODUCTS, priceOf } from './data/products.js'

const KEY = 'furnova:settings'

export const DEFAULTS = {
  banner: {
    title: 'Furniture for every room, made to fit yours.',
    text: 'Every sofa, bed, table and desk at Furnova is a live 3D model. Pick the fabric, wood and size, check the measurements, then see it standing in your own room before you order.',
    cta: 'Shop all furniture',
    promo: 'Free delivery on orders over $500, and 30 days to return any piece.',
  },
  categories: [...CATEGORIES], // display order; admin can add more
  moves: {}, // productId -> category, when admin files a product under another category
  offers: {}, // productId -> percent off (1 to 90)
  coupons: [{ code: 'WELCOME10', percent: 10, active: true }],
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    return saved ? { ...DEFAULTS, ...saved, banner: { ...DEFAULTS.banner, ...saved.banner } } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

let state = typeof localStorage === 'undefined' ? DEFAULTS : load()
const listeners = new Set()
const emit = () => listeners.forEach((l) => l())

export const getSettings = () => state

export function updateSettings(fn) {
  state = fn(state)
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* kept for this visit only */
  }
  emit()
}

export function resetSettings() {
  updateSettings(() => DEFAULTS)
}

// Another tab (for example the admin panel) changed the settings.
if (typeof addEventListener !== 'undefined')
  addEventListener('storage', (e) => {
    if (e.key === KEY) {
      state = load()
      emit()
    }
  })

export function useSettings() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    getSettings,
  )
}

// ---- Derived helpers. Pass `s` from useSettings() in components so they re-render.

export const categoryOf = (p, s = state) => s.moves[p.id] ?? p.category

export const offerOf = (p, s = state) => {
  const n = Number(s.offers[p.id])
  return n > 0 && n <= 90 ? n : 0
}

// Price after any product offer, rounded to whole dollars.
export const salePrice = (p, cfg, s = state) => Math.round(priceOf(p, cfg) * (1 - offerOf(p, s) / 100))

export const productsIn = (category, s = state) => (category === 'All' ? PRODUCTS : PRODUCTS.filter((p) => categoryOf(p, s) === category))

export const normCode = (code) => String(code ?? '').trim().toUpperCase()

export function findCoupon(code, s = state) {
  const c = s.coupons.find((x) => x.code === normCode(code))
  return c && c.active && c.percent > 0 && c.percent <= 90 ? c : null
}
