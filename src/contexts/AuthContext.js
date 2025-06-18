import { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  console.log(import.meta.env.VITE_BACKEND_URL)
  const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL;
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))

  const login = async (credentials) => {
    try {
      const response = await fetch(`${ENDPOINT_URL}auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()

      // Store token and user data
      setToken(data.token)
      setUser(data)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data))

      return data
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
  }

  const checkAuth = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      return true
    }
    return false
  }

  // Check token expiration
  const isTokenValid = () => {
    const token = localStorage.getItem('token')
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const exp = payload.exp * 1000 // Convert to milliseconds
      return Date.now() < exp
    } catch (e) {
      return false
    }
  }

  useEffect(() => {
    if (!isTokenValid()) {
      logout()
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        checkAuth,
        isTokenValid,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
