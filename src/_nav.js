import CIcon from '@coreui/icons-react'
import { cilApplications, cilChart } from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Customer',
    to: '/customer',
    icon: <CIcon icon={cilApplications} customClassName="nav-icon" />,
  },
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
]

export default _nav
