import { useCallback, useState } from 'react'
import Stage from '../three/Stage.jsx'
import { ROOMS, buildRoom, roomLines, roomTotal } from '../three/rooms.js'
import ProductCard, { useThumbnail } from '../components/ProductCard.jsx'
import { PRODUCTS, byId, money } from '../data/products.js'

const HOME_CATEGORIES = ['Sofas', 'Beds', 'Tables', 'Desks', 'Seating', 'Lighting']
const TRENDING = PRODUCTS.filter((p) => p.featured).slice(0, 4)
const PREMIUM = PRODUCTS.filter((p) => p.price >= 1390).sort((a, b) => b.price - a.price).slice(0, 3)
const NEW_IN = ['loom', 'nook', 'arlo', 'orb'].map((id) => byId[id])

function Hero({ addRoom }) {
  const [roomId, setRoomId] = useState('living')
  const room = ROOMS.find((r) => r.id === roomId)
  const build = useCallback(() => buildRoom(room), [room])
  const lines = roomLines(room)

  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <h1>
            Furniture for every room,
            <br />
            made to fit yours.
          </h1>
          <p className="lede">
            Furnova is a furniture store where every sofa, bed, table and desk is a live 3D model. Pick the fabric, wood and size, check the exact
            measurements, then see the piece standing in your own room through your phone camera before you order.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#shop">
              Shop all furniture
            </a>
            <a className="btn btn-quiet" href="#rooms">
              Explore rooms
            </a>
          </div>
          <dl className="hero-facts">
            <div>
              <dt>Pieces</dt>
              <dd>{PRODUCTS.length}</dd>
            </div>
            <div>
              <dt>Fabrics and finishes</dt>
              <dd>20+</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>Free over $500</dd>
            </div>
          </dl>
        </div>

        <figure className="hero-room" id="rooms">
          <div className="room-tabs" role="tablist" aria-label="Rooms">
            {ROOMS.map((r) => (
              <button key={r.id} type="button" role="tab" aria-selected={r.id === roomId} onClick={() => setRoomId(r.id)}>
                {r.name}
              </button>
            ))}
          </div>
          <Stage className="stage room-stage" build={build} id={room.id} zoom={1.65} label={`3D ${room.name.toLowerCase()} set. Drag to look around.`} />
          <figcaption className="room-card">
            <div className="room-pieces">
              <p className="room-title">In this {room.name.toLowerCase()}</p>
              <ul>
                {lines.map((l) => (
                  <li key={l.key}>
                    <a href={`#${l.key}`}>
                      {l.qty > 1 && `${l.qty} × `}
                      {l.product.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="room-buy">
              <p>
                <small className="muted">Room total</small>
                <strong className="price">{money(roomTotal(room))}</strong>
              </p>
              <button type="button" className="btn btn-primary" onClick={() => addRoom(lines)}>
                Add the room to cart
              </button>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

const PERKS = [
  ['Free delivery', 'On every order over $500, to your door.'],
  ['30-day returns', 'Live with it for a month. Send it back if it is not right.'],
  ['Made to order', 'Built in your fabric and wood, shipped in 2 to 3 weeks.'],
  ['Secure checkout', 'Cash on delivery or bank transfer.'],
]

function CategoryTile({ category }) {
  const lead = PRODUCTS.find((p) => p.category === category && p.featured) ?? PRODUCTS.find((p) => p.category === category)
  const src = useThumbnail(lead)
  const n = PRODUCTS.filter((p) => p.category === category).length
  return (
    <a className="cat-tile" href={`#shop-${category.toLowerCase()}`}>
      <span className="cat-img">{src && <img src={src} alt="" width="560" height="560" />}</span>
      <span className="cat-text">
        <strong>{category}</strong>
        <small>
          {n} {n === 1 ? 'piece' : 'pieces'}
        </small>
      </span>
    </a>
  )
}

const FEATURES = [
  {
    title: 'Make it yours',
    text: 'Choose from fabrics, woods, stone and sizes. The 3D model and the price change the moment you do.',
    icon: 'M4 20h4l10-10-4-4L4 16v4zm12.5-15.5 3 3 1.4-1.4a1 1 0 0 0 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0L16.5 4.5z',
  },
  {
    title: 'See it in your room',
    text: 'Scan the code on any product page. Your phone camera opens and the piece stands in your room at its real size.',
    icon: 'M9 4 7.2 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.2L15 4H9zm3 5a4 4 0 1 1 0 8 4 4 0 0 1 0-8z',
  },
  {
    title: 'Know it fits',
    text: 'Every piece shows width, depth and height in centimetres, measured from the model itself.',
    icon: 'M3 8h18v8H3V8zm2 2v4h2v-2h1v2h2v-3h1v3h2v-2h1v2h2v-3h1v3h1v-4H5z',
  },
]

function Section({ title, link, children, className = '' }) {
  return (
    <section className={`wrap home-section ${className}`}>
      <div className="section-head">
        <h2>{title}</h2>
        {link}
      </div>
      {children}
    </section>
  )
}

export default function Home({ saved, toggleSaved, addToCart, addRoom, recent }) {
  const cardProps = { saved, toggleSaved, addToCart }
  const recentItems = recent.map((id) => byId[id]).filter(Boolean).slice(0, 4)
  return (
    <>
      <Hero addRoom={addRoom} />

      <section className="benefits" aria-label="Why shop with Furnova">
        <ul className="wrap">
          {PERKS.map(([t, d]) => (
            <li key={t}>
              <strong>{t}</strong>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </section>

      <Section
        title="Shop by category"
        link={
          <a className="link-more" href="#shop">
            View all
          </a>
        }
      >
        <div className="cat-grid">
          {HOME_CATEGORIES.map((c) => (
            <CategoryTile key={c} category={c} />
          ))}
        </div>
      </Section>

      <Section
        title="Trending now"
        link={
          <a className="link-more" href="#shop">
            Shop all
          </a>
        }
      >
        <div className="grid grid-4">
          {TRENDING.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} {...cardProps} />
          ))}
        </div>
      </Section>

      <section className="premium">
        <div className="wrap">
          <div className="section-head">
            <div>
              <h2>The premium edit</h2>
              <p>Our largest pieces, in the richest fabrics and solid walnut.</p>
            </div>
            <a className="link-more" href="#shop">
              See more
            </a>
          </div>
          <div className="grid grid-3">
            {PREMIUM.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} {...cardProps} />
            ))}
          </div>
        </div>
      </section>

      <Section title="Why people buy furniture from Furnova" className="features">
        <ul className="feature-list">
          {FEATURES.map((f) => (
            <li key={f.title}>
              <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                <path d={f.icon} />
              </svg>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="New in"
        link={
          <a className="link-more" href="#shop">
            Shop new pieces
          </a>
        }
      >
        <div className="grid grid-4">
          {NEW_IN.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} {...cardProps} />
          ))}
        </div>
      </Section>

      {recentItems.length > 0 && (
        <Section title="Recently viewed">
          <div className="grid grid-4">
            {recentItems.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} {...cardProps} />
            ))}
          </div>
        </Section>
      )}
    </>
  )
}
