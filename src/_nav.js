import CIcon from '@coreui/icons-react'
import { cilApplications, cilChart, cilPeople } from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

// Get the mode from env
const mode = import.meta.env.VITE_APP_MODE || 'development'

// Base menu always present
const baseNav = [
  {
    component: CNavGroup,
    name: 'Customer',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Data Customer',
        to: '/customer/customers',
      },
      // Only show Rekualifikasi Customer if not production
      ...(mode !== 'production' ? [{
        component: CNavItem,
        name: 'Rekualifikasi Customer',
        to: '/customer/requalify',
      }] : []),
    ],
  },
  {
    component: CNavGroup,
    name: 'Tools',
    icon: <CIcon icon={cilApplications} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Import Faktur Pajak',
        to: '/tools/importpajak',
      },
    ],
  },
]

// Additional menu only for non-production
const devNav = (mode !== 'production') ? [
  {
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
  },
] : []

// Final nav
const _nav = [
  ...baseNav,
  ...devNav,
]

export default _nav
