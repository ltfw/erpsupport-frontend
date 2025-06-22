import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const GuestRoute = ({ children }) => {
  const { token, authChecked } = useAuth()

  if (!authChecked) return null // or a loading spinner

  return token ? <Navigate to="/dashboard" replace /> : children
}

export default GuestRoute
