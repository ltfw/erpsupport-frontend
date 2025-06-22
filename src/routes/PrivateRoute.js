import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const PrivateRoute = ({ children }) => {
  const { token, isTokenValid } = useAuth()
  if (!token || !isTokenValid()) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default PrivateRoute
