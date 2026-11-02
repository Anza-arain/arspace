import { useState } from 'react'
import { passwordStrength, validateSignup } from '../account.js'
import { useThumbnail } from '../components/ProductCard.jsx'
import { byId } from '../data/products.js'

const STRENGTH = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong']

function Password({ id, label, value, onChange, error, autoComplete, hint }) {
  const [show, setShow] = useState(false)
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className="password">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          required
        />
        <button type="button" className="reveal" onClick={() => setShow(!show)} aria-pressed={show}>
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      {hint}
      {error && (
        <p className="error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}

function Field({ id, label, error, ...input }) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} required {...input} />
      {error && (
        <p className="error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}

export default function Auth({ mode, account, message }) {
  const signup = mode === 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const art = useThumbnail(byId.orbit, { color: 2, finish: 1, option: 0 })
  const set = (key) => (v) => setForm((f) => ({ ...f, [key]: typeof v === 'string' ? v : v.target.value }))

  if (account.user && !busy)
    return (
      <section className="wrap auth-done">
        <h1>You're signed in as {account.user.name}.</h1>
        <a className="btn btn-primary" href="#account">
          Go to my account
        </a>
      </section>
    )

  async function submit(e) {
    e.preventDefault()
    setFormError('')
    const errs = signup ? validateSignup(form) : {}
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    try {
      if (signup) await account.signup(form)
      else await account.login(form.email, form.password)
    } catch (err) {
      setFormError(err.message)
    }
    setBusy(false)
  }

  const strength = passwordStrength(form.password)

  return (
    <section className="wrap auth">
      <div className="auth-card">
        <div className="tabs" role="tablist" aria-label="Account">
          <a role="tab" href="#login" aria-selected={!signup}>
            Sign in
          </a>
          <a role="tab" href="#signup" aria-selected={signup}>
            Create account
          </a>
        </div>

        <h1>{signup ? 'Create your account' : 'Welcome back'}</h1>
        {message && <p className="notice">{message}</p>}

        <form onSubmit={submit} noValidate>
          {signup && <Field id="name" label="Full name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />}
          <Field id="email" label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
          <Password
            id="password"
            label="Password"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            autoComplete={signup ? 'new-password' : 'current-password'}
            hint={
              signup &&
              form.password && (
                <div className="strength" data-level={strength}>
                  <span />
                  <span />
                  <span />
                  <span />
                  <small>{STRENGTH[strength]}</small>
                </div>
              )
            }
          />
          {signup && (
            <Password id="confirm" label="Confirm password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} autoComplete="new-password" />
          )}
          {formError && (
            <p className="error form-error" role="alert">
              {formError}
            </p>
          )}
          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? (signup ? 'Creating account…' : 'Signing in…') : signup ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="switch">
          {signup ? 'Already have an account? ' : 'New to Furnova? '}
          <a href={signup ? '#login' : '#signup'}>{signup ? 'Sign in' : 'Create an account'}</a>
        </p>
        <p className="fine-print">Demo store: accounts are kept in this browser only and passwords are stored as salted hashes. Use a password you don't use anywhere else.</p>
      </div>

      <aside className="auth-side" aria-label="Why create an account">
        <div className="auth-art">{art && <img src={art} alt="" width="560" height="560" />}</div>
        <ul>
          <li>
            <strong>Save pieces</strong> with the exact fabric and finish you chose.
          </li>
          <li>
            <strong>Keep your cart</strong> between visits.
          </li>
          <li>
            <strong>Track orders</strong> from checkout to delivery.
          </li>
        </ul>
      </aside>
    </section>
  )
}
