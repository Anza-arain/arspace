// Catalog data. Every product is a procedural Three.js model (see three/models.js),
// so `colors`, `finishes` and `option` map straight onto how the model is built.
// Finish keys refer to three/materials.js. Prices are USD.

const FABRICS = [
  { name: 'Moss', hex: '#5E6B4E' },
  { name: 'Oat', hex: '#CDBFA6' },
  { name: 'Ink', hex: '#2B3442' },
  { name: 'Rust', hex: '#9A4A2C' },
  { name: 'Fog', hex: '#A9B0AE' },
  { name: 'Teal', hex: '#2F5F5C' },
  { name: 'Mustard', hex: '#B98A2E' },
]

const GLAZES = [
  { name: 'Celadon', hex: '#9DB5A0' },
  { name: 'Ochre', hex: '#C08A2E' },
  { name: 'Cobalt', hex: '#2C4A9A' },
  { name: 'Chalk', hex: '#E8E4DA' },
  { name: 'Basalt', hex: '#3A3B3A' },
]
const PAINTS = [
  { name: 'Chalk', hex: '#E8E4DA' },
  { name: 'Sage', hex: '#8E9C84' },
  { name: 'Cobalt', hex: '#2C4A9A' },
  { name: 'Terra', hex: '#A4583A' },
]

const BEDDING = [
  { name: 'Linen', hex: '#E4DED2' },
  { name: 'Sage', hex: '#A7B39C' },
  { name: 'Clay', hex: '#B9805F' },
  { name: 'Charcoal', hex: '#45484A' },
]

const WOODS = [
  { key: 'oak', name: 'Natural oak', price: 0 },
  { key: 'walnut', name: 'Walnut', price: 120 },
  { key: 'ash', name: 'Black ash', price: 60 },
]

// Same glazes, different default, so the catalog doesn't open on one colour.
const startAt = (list, i) => [...list.slice(i), ...list.slice(0, i)]

export const CATEGORIES = ['Sofas', 'Seating', 'Beds', 'Tables', 'Desks', 'Lighting', 'Storage', 'Decor', 'Audio']

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
    category: 'Sofas',
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
  {
    id: 'haven',
    name: 'Haven Sectional',
    category: 'Sofas',
    price: 2490,
    blurb: 'An L-shaped sofa with a long chaise for stretching out. Seats four, sleeps one.',
    colorLabel: 'Upholstery',
    colors: startAt(FABRICS, 5),
    finishLabel: 'Feet',
    finishes: WOODS,
    option: { label: 'Chaise side', choices: [{ name: 'Left', price: 0 }, { name: 'Right', price: 0 }] },
    featured: true,
  },
  {
    id: 'loom',
    name: 'Loom Loveseat',
    category: 'Sofas',
    price: 1190,
    blurb: 'A compact two-seater for small living rooms and bedrooms, on slim tapered legs.',
    colorLabel: 'Upholstery',
    colors: startAt(FABRICS, 3),
    finishLabel: 'Legs',
    finishes: WOODS,
    option: { label: 'Arms', choices: [{ name: 'Rounded', price: 0 }, { name: 'Square', price: 0 }] },
  },
  {
    id: 'mara',
    name: 'Mara Rolled-Arm Sofa',
    category: 'Sofas',
    price: 1890,
    blurb: 'A classic three-seater with rolled arms, a tight back and turned legs.',
    colorLabel: 'Upholstery',
    colors: startAt(FABRICS, 2),
    finishLabel: 'Legs',
    finishes: [
      { key: 'walnut', name: 'Walnut', price: 0 },
      { key: 'oak', name: 'Natural oak', price: 0 },
      { key: 'brass', name: 'Brushed brass', price: 140 },
    ],
    option: { label: 'Length', choices: [{ name: '210 cm', price: 0 }, { name: '240 cm', price: 250 }] },
  },
  {
    id: 'rest',
    name: 'Rest Upholstered Bed',
    category: 'Beds',
    price: 1390,
    blurb: 'A soft channel-tufted headboard on a low upholstered frame. Mattress not included.',
    colorLabel: 'Upholstery',
    colors: startAt(FABRICS, 6),
    finishLabel: 'Feet',
    finishes: WOODS,
    option: { label: 'Size', choices: [{ name: 'Queen', price: 0 }, { name: 'King', price: 260 }] },
    featured: true,
  },
  {
    id: 'timber',
    name: 'Timber Slat Bed',
    category: 'Beds',
    price: 1190,
    blurb: 'Solid timber frame with a slatted headboard. Bedding shown is sold separately.',
    colorLabel: 'Bedding',
    colors: startAt(BEDDING, 1),
    finishLabel: 'Frame',
    finishes: WOODS,
    option: {
      label: 'Size',
      choices: [
        { name: 'Double', price: 0 },
        { name: 'Queen', price: 150 },
        { name: 'King', price: 320 },
      ],
    },
  },
  {
    id: 'atelier',
    name: 'Atelier Study Desk',
    category: 'Desks',
    price: 640,
    blurb: 'A study desk with three deep drawers on one side and room for a monitor and lamp.',
    colorLabel: 'Drawers',
    colors: startAt(PAINTS, 1),
    finishLabel: 'Top',
    finishes: WOODS,
    option: { label: 'Shelf', choices: [{ name: 'No shelf', price: 0 }, { name: 'With shelf', price: 120 }] },
    featured: true,
  },
  {
    id: 'nook',
    name: 'Nook Writing Desk',
    category: 'Desks',
    price: 390,
    blurb: 'A slim desk on steel hairpin legs with a shallow drawer. Fits a 50 cm deep corner.',
    colors: [],
    finishLabel: 'Top',
    finishes: [
      { key: 'oak', name: 'Natural oak', price: 0 },
      { key: 'walnut', name: 'Walnut', price: 60 },
      { key: 'marble', name: 'Carrara marble', price: 180 },
    ],
    option: { label: 'Width', choices: [{ name: '100 cm', price: 0 }, { name: '120 cm', price: 40 }] },
  },
  {
    id: 'arlo',
    name: 'Arlo Desk Chair',
    category: 'Seating',
    price: 420,
    blurb: 'A bent-wood desk chair with a padded seat. Pairs with every desk in the store.',
    colorLabel: 'Seat pad',
    colors: FABRICS,
    finishLabel: 'Shell',
    finishes: WOODS,
    option: { label: 'Base', choices: [{ name: 'Four legs', price: 0 }, { name: 'Swivel', price: 60 }] },
  },
  {
    id: 'slab',
    name: 'Slab Dining Table',
    category: 'Tables',
    price: 1290,
    blurb: 'A thick-topped dining table on two trestle legs, so chairs slide in anywhere.',
    colors: [],
    finishLabel: 'Material',
    finishes: [
      { key: 'oak', name: 'Natural oak', price: 0 },
      { key: 'walnut', name: 'Walnut', price: 220 },
      { key: 'ash', name: 'Black ash', price: 120 },
    ],
    option: { label: 'Seats', choices: [{ name: '4 seats, 160 cm', price: 0 }, { name: '6 seats, 220 cm', price: 280 }] },
  },
  {
    id: 'orb',
    name: 'Orb Coffee Table',
    category: 'Tables',
    price: 560,
    blurb: 'A low coffee table on a solid drum base, in stone or timber.',
    colors: [],
    finishLabel: 'Material',
    finishes: [
      { key: 'walnut', name: 'Walnut', price: 0 },
      { key: 'travertine', name: 'Travertine', price: 40 },
      { key: 'marble', name: 'Carrara marble', price: 90 },
      { key: 'oak', name: 'Natural oak', price: 0 },
    ],
    option: { label: 'Shape', choices: [{ name: 'Round', price: 0 }, { name: 'Oval', price: 60 }] },
  },
]

export const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]))

// Merchandising labels shown on cards.
const NEW_IN = new Set(['loom', 'nook', 'arlo', 'orb', 'timber', 'slab'])
export function badgeOf(p) {
  if (p.featured) return 'Trending'
  if (p.price >= 1500) return 'Premium'
  if (NEW_IN.has(p.id)) return 'New'
  return null
}

// Every finish key a product offers, for the material filter.
export const MATERIALS = [
  { key: 'oak', name: 'Oak' },
  { key: 'walnut', name: 'Walnut' },
  { key: 'ash', name: 'Black ash' },
  { key: 'marble', name: 'Marble' },
  { key: 'travertine', name: 'Travertine' },
  { key: 'brass', name: 'Brass' },
]

export const DEFAULT_CFG = { color: 0, finish: 0, option: 0 }

export function priceOf(p, cfg) {
  return p.price + p.finishes[cfg.finish].price + p.option.choices[cfg.option].price
}

export const money = (n) => '$' + n.toLocaleString('en-US')
