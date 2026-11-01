import { money } from '../data/products.js'

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
