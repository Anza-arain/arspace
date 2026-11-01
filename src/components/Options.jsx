import { useEffect, useState } from 'react'
import { money } from '../data/products.js'
import { clampQty, MAX_QTY } from '../account.js'

export function Swatches({ label, colors, value, onChange }) {
  return (
    <fieldset className="option">
      <legend>
        {label} <span className="muted">{colors[value].name}</span>
      </legend>
      <div className="swatches">
        {colors.map((c, i) => (
          <label key={c.name} className="swatch" title={c.name}>
            <input type="radio" name={label} checked={value === i} onChange={() => onChange(i)} />
            <span style={{ background: c.hex }} />
            <span className="sr-only">{c.name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

// Segmented choice with the price difference shown on each option.
export function Choices({ label, choices, value, onChange }) {
  return (
    <fieldset className="option">
      <legend>{label}</legend>
      <div className="segments">
        {choices.map((c, i) => (
          <label key={c.name} className="segment">
            <input type="radio" name={label} checked={value === i} onChange={() => onChange(i)} />
            <span>
              {c.name}
              {c.price > 0 && <small>+{money(c.price)}</small>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

// Quantity stepper with a typeable box, for bulk orders.
export function Qty({ value, onChange, label, className = '' }) {
  const [draft, setDraft] = useState(String(value))
  useEffect(() => setDraft(String(value)), [value])
  const commit = (n) => onChange(clampQty(n))
  return (
    <div className={`qty ${className}`} role="group" aria-label={label}>
      <button type="button" onClick={() => commit(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        min="1"
        max={MAX_QTY}
        value={draft}
        aria-label={label}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          setDraft(e.target.value)
          if (parseInt(e.target.value, 10) >= 1) commit(e.target.value)
        }}
        onBlur={() => setDraft(String(value))}
      />
      <button type="button" onClick={() => commit(value + 1)} disabled={value >= MAX_QTY} aria-label="Increase quantity">
        +
      </button>
    </div>
  )
}
