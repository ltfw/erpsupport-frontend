import CIcon from '@coreui/icons-react'
import { cilApplications, cilChart, cilPeople } from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

// Get the mode from env
const mode = import.meta.env.VITE_APP_MODE || 'development'

const _nav = [
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
      {
        component: CNavItem,
        name: 'Rekualifikasi Customer',
        to: '/customer/requalify',
      },
    ],
  },
]

// If not production, add more menu items
if (mode !== 'production') {
  _nav.push(
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
  )
}


export default _nav
