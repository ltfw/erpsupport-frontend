import CIcon from '@coreui/icons-react'
import { cilApplications } from '@coreui/icons'
import { CNavItem } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Customer',
    to: '/customer',
    icon: <CIcon icon={cilApplications} customClassName="nav-icon" />,
  },
]

export default _nav
