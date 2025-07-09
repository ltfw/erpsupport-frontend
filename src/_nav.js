import CIcon from '@coreui/icons-react'
import { cilApplications, cilChart } from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

// Get the mode from env
const mode = import.meta.env.VITE_APP_MODE || 'development'
// if using CRA, use: const mode = process.env.REACT_APP_MODE || 'development'

// Base menu
const _nav = [
  {
    component: CNavItem,
    name: 'Customer',
    to: '/customer',
    icon: <CIcon icon={cilApplications} customClassName="nav-icon" />,
  }
]

// If not production, add more menu items
if (mode !== 'production') {
  _nav.push({
    component: CNavGroup,
    name: 'Daftar Laporan',
    icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Penjualan',
        to: '/report/sales',
      },
      {
        component: CNavItem,
        name: 'Persediaan Barang',
        to: '/report/stock',
      },
    ],
  })
}

export default _nav
