import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CImage,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { useAuth } from '../../../contexts/AuthContext'

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  })

  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(credentials)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Username or Password!')
    }
  }

  return (
    <div className="bg-primary bg-gradient min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8} lg={7}>
            <CCardGroup style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: '12px', overflow: 'hidden' }}>
              <CCard className="p-5" style={{ border: 'none', backgroundColor: '#fff' }}>
                <CCardBody className="p-0">
                  <CForm onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <h1 style={{ 
                        fontSize: '2rem', 
                        fontWeight: 600, 
                        color: '#212529',
                        marginBottom: '0.5rem',
                        letterSpacing: '-0.5px'
                      }}>
                        Welcome Back
                      </h1>
                      <p style={{ 
                        color: '#6c757d', 
                        fontSize: '0.95rem',
                        marginBottom: 0
                      }}>
                        Sign in to continue to your account
                      </p>
                    </div>

                    <CInputGroup className="mb-3" style={{ height: '48px' }}>
                      <CInputGroupText style={{ 
                        backgroundColor: '#f8f9fa', 
                        borderRight: 'none',
                        borderColor: '#dee2e6',
                        padding: '0 1rem'
                      }}>
                        <CIcon icon={cilUser} style={{ color: '#6c757d', fontSize: '18px' }} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Username"
                        autoComplete="username"
                        value={credentials.username}
                        onChange={(e) =>
                          setCredentials({
                            ...credentials,
                            username: e.target.value,
                          })
                        }
                        style={{ 
                          borderLeft: 'none',
                          height: '48px',
                          fontSize: '0.95rem',
                          borderColor: '#dee2e6'
                        }}
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-4" style={{ height: '48px' }}>
                      <CInputGroupText style={{ 
                        backgroundColor: '#f8f9fa', 
                        borderRight: 'none',
                        borderColor: '#dee2e6',
                        padding: '0 1rem'
                      }}>
                        <CIcon icon={cilLockLocked} style={{ color: '#6c757d', fontSize: '18px' }} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={credentials.password}
                        onChange={(e) =>
                          setCredentials({
                            ...credentials,
                            password: e.target.value,
                          })
                        }
                        style={{ 
                          borderLeft: 'none',
                          height: '48px',
                          fontSize: '0.95rem',
                          borderColor: '#dee2e6'
                        }}
                      />
                    </CInputGroup>

                    {error && (
                      <CAlert 
                        color="danger" 
                        className="mb-3"
                        style={{ 
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          border: 'none'
                        }}
                      >
                        {error}
                      </CAlert>
                    )}

                    <CRow>
                      <CCol>
                        <CButton 
                          color="primary" 
                          type="submit" 
                          className="w-100"
                          style={{ 
                            height: '48px',
                            fontWeight: 500,
                            fontSize: '1rem',
                            borderRadius: '6px',
                            letterSpacing: '0.3px'
                          }}
                        >
                          Sign In
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>

              <CCard 
                className="bg-white py-5 d-none d-md-flex" 
                style={{ 
                  width: '44%',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CCardBody className="text-center d-flex flex-column align-items-center justify-content-center">
                  <div style={{ 
                    padding: '2rem',
                    // backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    marginBottom: '1.5rem'
                  }}>
                    <CImage 
                      fluid 
                      src="/img/logo-sdl.png" 
                      alt="Logo"
                      style={{ 
                        maxWidth: '180px',
                        height: 'auto'
                      }}
                    />
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
