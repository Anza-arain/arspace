// Motion by attributes alone. No React.
//   [data-reveal]        image reveal: clips up from the bottom and settles from 1.04 scale
//   [data-reveal="text"] rises 12px and fades in
// Each runs once, when 15% of the element is visible. Elements are only hidden while
// <html> has .motion-ready, which is set here, so content never sticks invisible.
// `main` fades in again whenever the hash route changes.
const root = document.documentElement

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        // 15% of the element, or 15% of the screen for elements taller than it.
        if (e.intersectionRatio >= 0.15 || e.intersectionRect.height >= innerHeight * 0.15) {
          e.target.setAttribute('data-revealed', '')
          io.unobserve(e.target)
        }
      }
    },
    { threshold: [0, 0.05, 0.15] },
  )

  let queued = false
  const scan = () => {
    queued = false
    document.querySelectorAll('[data-reveal]:not([data-revealed])').forEach((el) => io.observe(el))
  }
  // ponytail: rescans the document once per frame of DOM changes; fine at store size.
  new MutationObserver(() => {
    if (!queued) (queued = true), requestAnimationFrame(scan)
  }).observe(document.body, { childList: true, subtree: true })

  root.classList.add('motion-ready')
  scan()
}

// Page enter: restart the fade on <main> when the route changes.
function enter() {
  const main = document.querySelector('main')
  if (!main) return
  main.classList.remove('page-enter')
  void main.offsetWidth
  main.classList.add('page-enter')
}
addEventListener('hashchange', enter)
requestAnimationFrame(enter)
