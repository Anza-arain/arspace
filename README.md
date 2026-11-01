# ARSpace

**Live demo:** https://anza-arain.github.io/arspace/

A web-based 3D and AR product showroom. Customers configure furniture and objects in an interactive 3D viewer and, on a supported phone, place them in their own room at true scale.

Built with **React, Three.js, `<model-viewer>` and WebXR**. No 3D files ship with the app: every product is generated procedurally in Three.js and exported to glTF in the browser when the user opens AR.

## Features

- **Interactive 3D viewer** with orbit, zoom, soft shadows and studio lighting (Three.js, PBR materials, `RoomEnvironment` reflections)
- **Live configurator**: colour, material and product options rebuild the model instantly; price updates with each choice
- **Real dimensions** in centimetres, measured from the model's bounding box
- **AR preview**: the configured model is exported to GLB and opened in `<model-viewer>`, which uses WebXR on Android Chrome and Quick Look on iOS Safari, placed on the floor at 1:1 scale
- **Camera view on any phone**: when a phone has no full AR (or the QR link opens in a scanner's built-in browser), the back camera opens straight away with the piece drawn over the room; drag to move, pinch to resize, twist to turn
- **QR hand-off**: on a laptop, the AR dialog shows a QR code that opens the same configuration on a phone
- **Catalog of 18 pieces** (sofas, beds, dining and coffee tables, study desks, chairs, lighting, storage, decor) with category filter, text search, price slider and sorting
- **Accounts**: sign up, sign in and sign out, with inline validation, a password strength meter and show/hide password
- **Per-user data**: each account has its own saved pieces, cart and order history
- **Cart and checkout**: quantity steppers, live totals, free delivery threshold, address form with native validation, delivery and payment options, order confirmation page
- **Account page** with order history and status
- **Store navigation**: promo bar, Shop menu by category, header search, saved and cart badges, account menu, mobile drawer
- **Shareable configurations**: every choice is encoded in the URL hash (`#orbit-c2-m1-o1`), so a copied link reopens the exact product
- **Responsive** from 360px phones to wide desktops, with light and dark themes
- **Performance**: catalog thumbnails come from one shared offscreen WebGL renderer (browsers cap live WebGL contexts at about 16), viewers pause rendering when off screen, and `<model-viewer>` is lazy-loaded only when AR is opened

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/
node src/route.test.js     # URL parser self-check
node src/account.test.js   # password hashing, validation, cart totals
```

Deploy `dist/` to Vercel, Netlify or GitHub Pages. Hash routing means no server rewrites are needed.

**Set your public address before you deploy.** Copy `.env.example` to `.env` and put your live URL in `VITE_PUBLIC_URL` (on Vercel, add it under Project Settings → Environment Variables). The AR dialog's QR code and the share links use this address, and the QR opens the scanned piece straight in the AR view (`#orbit-c2-m1-o0-ar`). Without it, the app uses the address it is running on, and shows no QR code when it runs inside a preview frame.

> AR needs HTTPS and a real phone: an ARCore-capable Android phone with Chrome, or an iPhone/iPad with Safari. Use the QR code in the AR dialog to move from laptop to phone.

## Project structure

```
src/
  account.js            accounts, password hashing, saved, cart, orders (+ account.test.js)
  data/products.js      catalog: products, colours, finishes, options, prices
  route.js              hash routing and config encoding (+ route.test.js)
  three/
    materials.js        PBR materials with procedural wood, fabric and stone textures
    models.js           procedural builders for each product, in metres
    scene.js            studio lighting, shadow floor, thumbnail renderer, GLB export
    Stage.jsx           React wrapper around the Three.js viewer
  components/           ProductCard, Options (swatches, segmented choices), ARModal
  components/Header.jsx promo bar, menus, search, cart and account menu
  pages/                Home, Product, Saved, Auth (sign in / sign up), Cart, Checkout, Account + Order
```

## How the AR pipeline works

1. `buildProduct(product, config)` builds a `THREE.Group` from primitives, lathe profiles and tubes, sized in metres.
2. The same group is shown in the viewer and measured for the dimension readout.
3. On "View in your room", `GLTFExporter` turns the group into a binary glTF blob.
4. `<model-viewer>` loads the blob with `ar-scale="fixed"` and `ar-placement="floor"`, so the object appears at real size. iOS Quick Look receives a USDZ that model-viewer generates from the same model.

## Notes and limits

- Accounts are a front-end demo: they live in the browser's `localStorage`. Passwords are never stored in plain text, only a salted PBKDF2-SHA256 hash (210,000 iterations, Web Crypto). Login compares hashes in constant time and hashes even for unknown emails so timing doesn't reveal which accounts exist. To make accounts real, replace the functions in `src/account.js` with a backend such as Supabase Auth; the UI does not need to change.

- Android's Scene Viewer needs a public URL, so on Android the app relies on WebXR mode in Chrome. Hosting pre-exported GLBs would add Scene Viewer support.
- Products are procedural for portability. Real product scans or designer GLBs can replace `models.js` builders without changing the UI.

---

Portfolio project by Anza Arain.
