// Catalog data. Every product is a procedural Three.js model (see three/models.js),
// so `colors`, `finishes` and `option` map straight onto how the model is built.
// Finish keys refer to three/materials.js. Prices are USD.

const FABRICS = [
  { name: 'Moss', hex: '#5E6B4E' },
  { name: 'Oat', hex: '#CDBFA6' },
  { name: 'Ink', hex: '#2B3442' },
  { name: 'Rust', hex: '#9A4A2C' },
  { name: 'Fog', hex: '#A9B0AE' },
]

const GLAZES = [
  { name: 'Celadon', hex: '#9DB5A0' },
  { name: 'Ochre', hex: '#C08A2E' },
  { name: 'Cobalt', hex: '#2C4A9A' },
  { name: 'Chalk', hex: '#E8E4DA' },
  { name: 'Basalt', hex: '#3A3B3A' },
]
// Same glazes, different default, so the catalog doesn't open on one colour.
const startAt = (list, i) => [...list.slice(i), ...list.slice(0, i)]

export const CATEGORIES = ['Seating', 'Tables', 'Lighting', 'Storage', 'Decor', 'Audio']

export const PRODUCTS = [
  {
    id: 'orbit',
    name: 'Orbit Lounge Chair',
    category: 'Seating',
    price: 890,
    blurb: 'A low, deep lounge chair with a solid timber frame and removable wool covers.',
    colorLabel: 'Upholstery',
    colors: FABRICS,
    finishLabel: 'Frame',
    finishes: [
      { key: 'oak', name: 'Natural oak', price: 0 },
      { key: 'walnut', name: 'Walnut', price: 120 },
      { key: 'ash', name: 'Black ash', price: 60 },
    ],
    option: { label: 'Base', choices: [{ name: 'Tapered legs', price: 0 }, { name: 'Steel sled', price: 90 }] },
    featured: true,
  },
  {
    id: 'dune',
    name: 'Dune Sofa',
    category: 'Seating',
    price: 1690,
    blurb: 'Feather-wrapped cushions on a low timber plinth. Seat depth fits a full lie-down.',
    colorLabel: 'Upholstery',
    colors: FABRICS,
    finishLabel: 'Legs',
    finishes: [
      { key: 'oak', name: 'Natural oak', price: 0 },
      { key: 'walnut', name: 'Walnut', price: 180 },
      { key: 'ash', name: 'Black ash', price: 90 },
    ],
    option: { label: 'Seats', choices: [{ name: '2 seater', price: 0 }, { name: '3 seater', price: 420 }] },
  },
  {
    id: 'plinth',
    name: 'Plinth Side Table',
    category: 'Tables',
    price: 320,
    blurb: 'A single-pedestal side table, turned from one block. Heavy enough to stay put.',
    colors: [],
    finishLabel: 'Material',
    finishes: [
      { key: 'oak', name: 'Natural oak', price: 0 },
      { key: 'travertine', name: 'Travertine', price: 80 },
      { key: 'marble', name: 'Carrara marble', price: 140 },
      { key: 'blacksteel', name: 'Black steel', price: 40 },
    ],
    option: { label: 'Top', choices: [{ name: 'Round', price: 0 }, { name: 'Square', price: 0 }] },
  },
  {
    id: 'halo',
    name: 'Halo Table Lamp',
    category: 'Lighting',
    price: 240,
    blurb: 'A dome shade on a slim stem. Dims from a touch strip on the base.',
    colorLabel: 'Shade',
    colors: startAt(GLAZES, 1),
    finishLabel: 'Shade finish',
    finishes: [
      { key: 'matte', name: 'Matte lacquer', price: 0 },
      { key: 'gloss', name: 'Gloss lacquer', price: 30 },
      { key: 'brass', name: 'Brushed brass', price: 70 },
    ],
    option: { label: 'Height', choices: [{ name: 'Low', price: 0 }, { name: 'Tall', price: 40 }] },
    featured: true,
  },
  {
    id: 'arc',
    name: 'Arc Floor Lamp',
    category: 'Lighting',
    price: 460,
    blurb: 'A single steel arc that reaches over a sofa from a weighted stone base.',
    colorLabel: 'Shade',
    colors: startAt(GLAZES, 2),
    finishLabel: 'Arc',
    finishes: [
      { key: 'steel', name: 'Brushed steel', price: 0 },
      { key: 'brass', name: 'Brushed brass', price: 80 },
      { key: 'blacksteel', name: 'Black steel', price: 20 },
    ],
    option: { label: 'Shade shape', choices: [{ name: 'Dome', price: 0 }, { name: 'Cone', price: 0 }] },
  },
  {
    id: 'fold',
    name: 'Fold Bookshelf',
    category: 'Storage',
    price: 540,
    blurb: 'Open shelving with a coloured back panel. Shelves hold 25 kg each.',
    colorLabel: 'Back panel',
    colors: [
      { name: 'Chalk', hex: '#E8E4DA' },
      { name: 'Sage', hex: '#8E9C84' },
      { name: 'Cobalt', hex: '#2C4A9A' },
      { name: 'Terra', hex: '#A4583A' },
    ],
    finishLabel: 'Frame',
    finishes: [
      { key: 'oak', name: 'Natural oak', price: 0 },
      { key: 'walnut', name: 'Walnut', price: 110 },
      { key: 'ash', name: 'Black ash', price: 50 },
    ],
    option: { label: 'Tiers', choices: [{ name: '3 tiers', price: 0 }, { name: '4 tiers', price: 140 }] },
    featured: true,
  },
  {
    id: 'tide',
    name: 'Tide Vase',
    category: 'Decor',
    price: 85,
    blurb: 'Wheel-thrown stoneware. Each glaze pools a little differently at the shoulder.',
    colorLabel: 'Glaze',
    colors: GLAZES,
    finishLabel: 'Glaze finish',
    finishes: [
      { key: 'matte', name: 'Matte', price: 0 },
      { key: 'gloss', name: 'Gloss', price: 15 },
    ],
    option: { label: 'Form', choices: [{ name: 'Tall', price: 20 }, { name: 'Squat', price: 0 }, { name: 'Bulb', price: 10 }] },
  },
  {
    id: 'pebble',
    name: 'Pebble Speaker',
    category: 'Audio',
    price: 290,
    blurb: 'A wireless speaker wrapped in acoustic knit, with a solid top plate and one dial.',
    colorLabel: 'Knit',
    colors: FABRICS,
    finishLabel: 'Top plate',
    finishes: [
      { key: 'oak', name: 'Natural oak', price: 0 },
      { key: 'walnut', name: 'Walnut', price: 30 },
      { key: 'steel', name: 'Aluminium', price: 20 },
    ],
    option: { label: 'Size', choices: [{ name: 'Mini', price: 0 }, { name: 'Standard', price: 110 }] },
  },
]

export const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]))

export const DEFAULT_CFG = { color: 0, finish: 0, option: 0 }

export function priceOf(p, cfg) {
  return p.price + p.finishes[cfg.finish].price + p.option.choices[cfg.option].price
}

export const money = (n) => '$' + n.toLocaleString('en-US')
