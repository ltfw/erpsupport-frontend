import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { useAuth } from '../../../contexts/AuthContext'
import './Login.scss'

const EyeIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path
      d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
    {!open && <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
  </svg>
)

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const update = (field) => (e) => setCredentials({ ...credentials, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(credentials)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Username or password is incorrect.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="sdl-login">
      <aside className="sdl-login__brand" aria-hidden="true">
        <div className="sdl-login__chevron">
          <span className="sdl-login__wing sdl-login__wing--top" />
          <span className="sdl-login__wing sdl-login__wing--bottom" />
        </div>
        <div className="sdl-login__brand-text">
          <p className="sdl-login__product">ERP Support</p>
          <p className="sdl-login__company">PT Satoria Distribusi Lestari</p>
        </div>
      </aside>

      <main className="sdl-login__panel">
        <form className="sdl-login__form" onSubmit={handleSubmit} noValidate>
          <img
            className="sdl-login__logo"
            src="/img/logo-sdl.png"
            alt="Satoria Distribusi Lestari"
          />

          <h1 className="sdl-login__title">Sign in</h1>
          <p className="sdl-login__subtitle">Use your ERP Support account.</p>

          <label className="sdl-login__label" htmlFor="login-username">
            Username
          </label>
          <div className="sdl-login__field">
            <CIcon icon={cilUser} className="sdl-login__field-icon" />
            <input
              id="login-username"
              className="sdl-login__input"
              autoComplete="username"
              autoFocus
              required
              value={credentials.username}
              onChange={update('username')}
            />
          </div>

          <label className="sdl-login__label" htmlFor="login-password">
            Password
          </label>
          <div className="sdl-login__field">
            <CIcon icon={cilLockLocked} className="sdl-login__field-icon" />
            <input
              id="login-password"
              className="sdl-login__input"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={credentials.password}
              onChange={update('password')}
            />
            <button
              type="button"
              className="sdl-login__reveal"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>

          {error && (
            <div className="sdl-login__error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="sdl-login__submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="sdl-login__footnote">
            Can&apos;t sign in? Contact the IT team to reset your account.
          </p>
        </form>
      </main>
    </div>
  )
}

export default Login
