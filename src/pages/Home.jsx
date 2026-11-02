import { useCallback, useState } from "react";
import Stage from "../three/Stage.jsx";
import { ROOMS, buildRoom, roomLines, roomTotal } from "../three/rooms.js";
import ProductCard, { useThumbnail } from "../components/ProductCard.jsx";
import { PRODUCTS, byId, money } from "../data/products.js";
import { useSettings, productsIn, offerOf } from "../store.js";
import { toHash } from "../route.js";

const TRENDING = PRODUCTS.filter((p) => p.featured).slice(0, 4);
const NEW_IN = ["loom", "nook", "arlo", "orb"]
  .map((id) => byId[id])
  .filter(Boolean);
const slug = (c) => c.toLowerCase().replace(/[^a-z0-9]+/g, "-");

// One editorial block per room. cfg objects live here so thumbnails stay cached.
const STORIES = [
  {
    room: "Living room",
    id: "haven",
    cfg: { color: 0, finish: 1, option: 0 },
    title: "Sink in.",
    text: "The Haven sofa is deep enough for a nap, firm enough for your coffee. Kick your feet up on the chaise, the dog will find his own corner.",
    link: "Shop sofas",
    href: "#shop-sofas",
  },
  {
    room: "Bedroom",
    id: "rest",
    cfg: { color: 2, finish: 1, option: 0 },
    title: "Beds for the long sleep-in after a long week.",
    text: "A padded headboard to lean on with a book, a frame that stays quiet when you turn over, and room underneath for the spare blankets.",
    link: "Shop beds",
    href: "#shop-beds",
  },
  {
    room: "Study",
    id: "atelier",
    cfg: { color: 1, finish: 1, option: 1 },
    title: "A desk for the work that comes home with you.",
    text: "Space for the laptop, the lamp and the four o’clock tea. The shelf keeps the notebooks off the top, so Friday ends with a clear desk.",
    link: "Shop desks",
    href: "#shop-desks",
  },
  {
    room: "Dining",
    id: "slab",
    cfg: { color: 0, finish: 1, option: 1 },
    title: "A table that remembers every dinner.",
    text: "Solid wood that takes the hot dishes, the homework and the long Sunday lunches, and gets better looking with every mark.",
    link: "Shop tables",
    href: "#shop-tables",
  },
];

const AR_PIECE = { id: "orbit", cfg: { color: 3, finish: 1, option: 0 } };

function Hero({ banner, addRoom }) {
  const [roomId, setRoomId] = useState(ROOMS[0].id);
  const room = ROOMS.find((r) => r.id === roomId);
  const build = useCallback(() => buildRoom(room), [room]);
  const lines = roomLines(room);

  return (
    <section className="hero" aria-label="Furnova rooms">
      <div className="hero-copy">
        <h1>{banner.title}</h1>
        <p>{banner.text}</p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#shop">
            {banner.cta}
          </a>
          <a className="ul hero-walk" href="#rooms">
            Walk through the rooms
          </a>
        </div>
      </div>

      <div className="hero-scene">
        <div className="room-tabs" role="tablist" aria-label="Choose a room">
          {ROOMS.map((r) => (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={r.id === roomId}
              onClick={() => setRoomId(r.id)}
            >
              {r.name}
            </button>
          ))}
        </div>
        <Stage
          className="stage hero-stage"
          build={build}
          id={room.id}
          zoom={1.65}
          label={`3D ${room.name.toLowerCase()}. Drag to look around.`}
        />
        <div className="room-strip">
          <div className="room-pieces">
            <p>In this room</p>
            <ul>
              {lines.map((l) => (
                <li key={l.key}>
                  <a className="ul" href={`#${l.key}`}>
                    {l.qty > 1
                      ? `${l.product.name} (${l.qty})`
                      : l.product.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="room-buy">
            <p>
              <span>Room total</span>
              <strong className="price">{money(roomTotal(room))}</strong>
            </p>
            <button
              type="button"
              className="btn btn-quiet"
              onClick={() => addRoom(lines)}
            >
              Add the room to cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryTile({ category, s }) {
  const items = productsIn(category, s);
  const lead = items.find((p) => p.featured) ?? items[0];
  const src = useThumbnail(lead);
  return (
    <a className="cat-tile" href={`#shop-${slug(category)}`}>
      <span className="cat-img" data-reveal>
        {src && (
          <img src={src} alt="" width="560" height="700" loading="lazy" />
        )}
      </span>
      <span className="cat-text">
        <strong>{category}</strong>
        <span>
          {items.length} {items.length === 1 ? "piece" : "pieces"}
        </span>
      </span>
    </a>
  );
}

function Story({ story, flip }) {
  const product = byId[story.id];
  const src = useThumbnail(product, story.cfg);
  return (
    <article className={`story${flip ? " story-flip" : ""}`}>
      <figure className="story-img" data-reveal>
        {src && (
          <img
            src={src}
            alt={`${product.name} in the ${story.room.toLowerCase()}`}
            width="900"
            height="900"
            loading="lazy"
          />
        )}
      </figure>
      <div className="story-text">
        <p className="story-room">{story.room}</p>
        <h3 data-reveal="text">{story.title}</h3>
        <p>{story.text}</p>
        <a className="ul" href={story.href}>
          {story.link}
        </a>
      </div>
    </article>
  );
}

function SeeItHome() {
  const product = byId[AR_PIECE.id];
  const src = useThumbnail(product, AR_PIECE.cfg);
  const href = `#${toHash(product, AR_PIECE.cfg)}`;
  return (
    <section className="see-it" aria-labelledby="see-it-title">
      <div className="wrap see-it-inner">
        <div className="see-it-text">
          <h2 id="see-it-title" data-reveal="text">
            See it in your room
          </h2>
          <p className="see-it-lede">
            Every piece here is a 3D model you can turn around and open up.
            Point your phone at the floor and it stands there at its real size,
            next to the radiator and the cat.
          </p>
          <ol className="steps">
            <li>
              <strong>Choose it</strong>
              <span>
                Pick the fabric, the wood and the size. The model changes as you
                go.
              </span>
            </li>
            <li>
              <strong>Scan the code</strong>
              <span>
                Open “See it in your room” on the product page and scan the code
                with your phone camera.
              </span>
            </li>
            <li>
              <strong>Place it</strong>
              <span>
                Set it down on your floor, walk around it, and check it clears
                the door.
              </span>
            </li>
          </ol>
          <a className="ul" href={href}>
            Try it with the {product.name}
          </a>
        </div>
        <figure className="see-it-img" data-reveal>
          {src && (
            <img
              src={src}
              alt={`${product.name}, rendered in 3D`}
              width="900"
              height="900"
              loading="lazy"
            />
          )}
        </figure>
      </div>
    </section>
  );
}

function Row({ title, note, link, items, cardProps }) {
  return (
    <section className="home-section wrap">
      <div className="section-head">
        <div>
          <h2 data-reveal="text">{title}</h2>
          {note && <p>{note}</p>}
        </div>
        {link}
      </div>
      <div className="home-grid">
        {items.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} {...cardProps} />
        ))}
      </div>
    </section>
  );
}

export default function Home({
  saved,
  toggleSaved,
  addToCart,
  addRoom,
  recent = [],
}) {
  const s = useSettings();
  const cardProps = { saved, toggleSaved, addToCart };
  // Whole rows of four only (admin order decides which come first); the rest are a click away in the shop.
  const filled = s.categories.filter((c) => productsIn(c, s).length > 0);
  const categories = filled.length > 4 ? filled.slice(0, Math.floor(filled.length / 4) * 4) : filled;
  const onOffer = PRODUCTS.filter((p) => offerOf(p, s) > 0).slice(0, 8);
  const bestOffer = Math.max(0, ...onOffer.map((p) => offerOf(p, s)));
  const recentItems = recent
    .map((id) => byId[id])
    .filter(Boolean)
    .slice(0, 4);
  const shopLink = (label, href = "#shop") => (
    <a className="ul section-link" href={href}>
      {label}
    </a>
  );

  return (
    <div className="home">
      <Hero banner={s.banner} addRoom={addRoom} />

      <section className="manifesto" aria-label="Our promise">
        <div className="wrap">
          <p data-reveal="text">
            Made to be leaned on, spilled on and handed down.
          </p>
          <ul>
            <li>
              <strong>Free delivery over $500</strong>
              <span>Carried in, unwrapped, and the cardboard taken away.</span>
            </li>
            <li>
              <strong>30 days to live with it</strong>
              <span>
                If it doesn’t suit the room, we collect it and refund you.
              </span>
            </li>
            <li>
              <strong>Made to order in 2 to 3 weeks</strong>
              <span>
                Built in your fabric and wood, not pulled from a warehouse.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="home-section wrap" aria-labelledby="shop-by-title">
          <div className="section-head">
            <h2 id="shop-by-title" data-reveal="text">
              Shop by room and piece
            </h2>
            {shopLink("See everything")}
          </div>
          <div className="cat-grid">
            {categories.map((c) => (
              <CategoryTile key={c} category={c} s={s} />
            ))}
          </div>
        </section>
      )}

      <Row
        title="Trending now"
        note="What people are sitting on, sleeping in and eating at this month."
        link={shopLink("Shop all")}
        items={TRENDING}
        cardProps={cardProps}
      />

      {onOffer.length > 0 && (
        <Row
          title="On offer now"
          note={`Up to ${bestOffer}% off, while the workshop has them in.`}
          link={shopLink("Shop all")}
          items={onOffer}
          cardProps={cardProps}
        />
      )}

      <section
        className="home-section stories"
        id="rooms"
        aria-labelledby="rooms-title"
      >
        <div className="wrap">
          <h2 id="rooms-title" className="stories-title" data-reveal="text">
            A walk through the rooms
          </h2>
          {STORIES.map((story, i) => (
            <Story key={story.id} story={story} flip={i % 2 === 1} />
          ))}
        </div>
      </section>

      <SeeItHome />

      <Row
        title="New in"
        note="Fresh from the workshop."
        link={shopLink("Shop new pieces")}
        items={NEW_IN}
        cardProps={cardProps}
      />

      {recentItems.length > 0 && (
        <Row
          title="Recently viewed"
          note="Still thinking it over? Here’s where you left off."
          items={recentItems}
          cardProps={cardProps}
        />
      )}
    </div>
  );
}
