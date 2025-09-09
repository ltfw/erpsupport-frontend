import React from 'react'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
  cilAccountLogout,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

import avatar8 from './../../assets/images/avatars/avatar_def.png'

const AppHeaderDropdown = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  
  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatar8} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">Settings</CDropdownHeader>
        <CDropdownItem href="#">
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilSettings} className="me-2" />
          Settings
        </CDropdownItem>
        <CDropdownItem
          href="#"
          onClick={e => {
            e.preventDefault();
            navigate('/change-password');
          }}
        >
          <CIcon icon={cilLockLocked} className="me-2" />
          Change Password
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem
          href="#"
          onClick={(e) => {
            e.preventDefault()
            logout()
            navigate('/login')
          }}
        >
          <CIcon icon={cilAccountLogout} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
