// Page numbers to show, with gaps marked as null: 1 … 4 5 6 … 9
export function pageList(page, pages) {
  const want = new Set([1, pages, page - 1, page, page + 1])
  const out = []
  for (let i = 1; i <= pages; i++) {
    if (!want.has(i)) continue
    if (out.length && i - out[out.length - 1] > 1) out.push(null)
    out.push(i)
  }
  return out
}
