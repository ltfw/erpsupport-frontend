import { createContext, useState, useContext, useEffect, useRef } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user')
    try {
      return storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null
    } catch (err) {
      console.error('Failed to parse stored user:', storedUser)
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const logoutTimer = useRef(null)
  const [authChecked, setAuthChecked] = useState(false)

  // Helper: decode JWT and get expiration
  const getTokenExpiration = (jwt) => {
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1]))
      return payload.exp * 1000 // ms
    } catch {
      return null
    }
  }

  // Helper: check if token is valid
  const isTokenValid = () => {
    if (!token) return false
    const exp = getTokenExpiration(token)
    if (!exp) return false
    return Date.now() < exp
  }

  // Auto-logout when token expires
  useEffect(() => {
    if (!token) {
      delete axios.defaults.headers.common['Authorization']
      return
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

    const exp = getTokenExpiration(token)
    if (!exp) {
      logout()
      return
    }

    if (logoutTimer.current) clearTimeout(logoutTimer.current)

    const timeout = exp - Date.now()
    if (timeout > 0) {
      logoutTimer.current = setTimeout(() => logout(), timeout)
    } else {
      logout()
    }

    return () => clearTimeout(logoutTimer.current)
  }, [token])

  useEffect(() => {
    if (!isTokenValid()) logout()
    setAuthChecked(true)
  }, [])

  const login = async (credentials) => {
    try {
      const response = await fetch(`${ENDPOINT_URL}auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()
      const isValid = getTokenExpiration(data.token) > Date.now()
      if (!isValid) throw new Error('Received expired token')

      // Store
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setAuthChecked(true)
      return data.user
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    if (logoutTimer.current) clearTimeout(logoutTimer.current)
  }

  const checkAuth = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser && isTokenValid()) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      return true
    }
    logout()
    return false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        checkAuth,
        isTokenValid,
        authChecked,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
