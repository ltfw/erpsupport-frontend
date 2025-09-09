import React from 'react'
import RekualifikasiAdd from './views/customer/RekualifikasiAdd'
import NavigationAdmin from './views/admin/NavigationAdmin'
const Customer = React.lazy(() => import('./views/customer/Customer'))
const CustomerEdit = React.lazy(() => import('./views/customer/CustomerEdit'))
const CustomerPrint = React.lazy(() => import('./views/customer/CustomerPrint'))
const ProtectedRoute = React.lazy(() => import('./components/ProtectedRoute'))
const Penjualan = React.lazy(() => import('./views/laporan/penjualan/Penjualan'))
const Persediaan = React.lazy(() => import('./views/laporan/persediaan/Persediaan'))
const ImportPajak = React.lazy(() => import('./views/tools/ImportPajak'))
const Rekualifikasi = React.lazy(() => import('./views/customer/Rekualifikasi'))
const RayonCabang = React.lazy(() => import('./views/laporan/RayonCabang'))
const DaftarBarang = React.lazy(() => import('./views/laporan/persediaan/DaftarBarang'))
const KonfirmasiPiutang = React.lazy(() => import('./views/piutang/KonfirmasiPiutang'))
const KonfirmasiPiutangPrint = React.lazy(() => import('./views/piutang/KonfirmasiPiutangPrint'))
const ImportVA = React.lazy(() => import('./views/tools/ImportVA'))
const OutstandingSJ = React.lazy(() => import('./views/laporan/penjualan/OutstandingSJ'))
// Dashboard
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const ChangePassword = React.lazy(() => import('./views/pages/ChangePassword'))
const Colors = React.lazy(() => import('./views/theme/colors/Colors'))
const Typography = React.lazy(() => import('./views/theme/typography/Typography'))

// Base
const Accordion = React.lazy(() => import('./views/base/accordion/Accordion'))
const Breadcrumbs = React.lazy(() => import('./views/base/breadcrumbs/Breadcrumbs'))
const Cards = React.lazy(() => import('./views/base/cards/Cards'))
const Carousels = React.lazy(() => import('./views/base/carousels/Carousels'))
const Collapses = React.lazy(() => import('./views/base/collapses/Collapses'))
const ListGroups = React.lazy(() => import('./views/base/list-groups/ListGroups'))
const Navs = React.lazy(() => import('./views/base/navs/Navs'))
const Paginations = React.lazy(() => import('./views/base/paginations/Paginations'))
const Placeholders = React.lazy(() => import('./views/base/placeholders/Placeholders'))
const Popovers = React.lazy(() => import('./views/base/popovers/Popovers'))
const Progress = React.lazy(() => import('./views/base/progress/Progress'))
const Spinners = React.lazy(() => import('./views/base/spinners/Spinners'))
const Tabs = React.lazy(() => import('./views/base/tabs/Tabs'))
const Tables = React.lazy(() => import('./views/base/tables/Tables'))
const Tooltips = React.lazy(() => import('./views/base/tooltips/Tooltips'))

// Buttons
const Buttons = React.lazy(() => import('./views/buttons/buttons/Buttons'))
const ButtonGroups = React.lazy(() => import('./views/buttons/button-groups/ButtonGroups'))
const Dropdowns = React.lazy(() => import('./views/buttons/dropdowns/Dropdowns'))

//Forms
const ChecksRadios = React.lazy(() => import('./views/forms/checks-radios/ChecksRadios'))
const FloatingLabels = React.lazy(() => import('./views/forms/floating-labels/FloatingLabels'))
const FormControl = React.lazy(() => import('./views/forms/form-control/FormControl'))
const InputGroup = React.lazy(() => import('./views/forms/input-group/InputGroup'))
const Layout = React.lazy(() => import('./views/forms/layout/Layout'))
const Range = React.lazy(() => import('./views/forms/range/Range'))
const Select = React.lazy(() => import('./views/forms/select/Select'))
const Validation = React.lazy(() => import('./views/forms/validation/Validation'))

const Charts = React.lazy(() => import('./views/charts/Charts'))

// Icons
const CoreUIIcons = React.lazy(() => import('./views/icons/coreui-icons/CoreUIIcons'))
const Flags = React.lazy(() => import('./views/icons/flags/Flags'))
const Brands = React.lazy(() => import('./views/icons/brands/Brands'))

// Notifications
const Alerts = React.lazy(() => import('./views/notifications/alerts/Alerts'))
const Badges = React.lazy(() => import('./views/notifications/badges/Badges'))
const Modals = React.lazy(() => import('./views/notifications/modals/Modals'))
const Toasts = React.lazy(() => import('./views/notifications/toasts/Toasts'))

const Widgets = React.lazy(() => import('./views/widgets/Widgets'))

const routes = [
  // { path: '/', exact: true, name: 'Home' },
  {
    path: '/dashboard',
    name: 'Dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/change-password',
    name: 'Change Password',
    element: (
      <ProtectedRoute>
        <ChangePassword />
      </ProtectedRoute>
    ),
  },
  {
    path: '/customer/customers',
    name: 'Customer',
    element: (
      <ProtectedRoute>
        <Customer />
      </ProtectedRoute>
    ),
  },
  {
    path: '/customer/:id/edit',
    name: 'CustomerEdit',
    element: (
      <ProtectedRoute>
        <CustomerEdit />
      </ProtectedRoute>
    ),
  },
  {
    path: '/customer/:id/print',
    name: 'CustomerPrint',
    element: (
      <ProtectedRoute>
        <CustomerPrint />
      </ProtectedRoute>
    ),
  },
  {
    path: '/report/sales',
    name: 'Penjualan',
    element: (
      <ProtectedRoute>
        <Penjualan />
      </ProtectedRoute>
    ),
  },
  {
    path: '/report/stock',
    name: 'Persediaan Barang',
    element: (
      <ProtectedRoute>
        <Persediaan />
      </ProtectedRoute>
    ),
  },
  {
    path: '/tools/importpajak',
    name: 'Import Faktur Pajak',
    element: (
      <ProtectedRoute>
        <ImportPajak />
      </ProtectedRoute>
    ),
  },
  {
    path: '/tools/importva',
    name: 'Import VA',
    element: (
      <ProtectedRoute>
        <ImportVA />
      </ProtectedRoute>
    ),
  },
  {
    path: '/customer/requalify',
    name: 'Rekualifikasi Customer',
    element: (
      <ProtectedRoute>
        <Rekualifikasi />
      </ProtectedRoute>
    ),
  },
  {
    path: '/customer/requalify/add',
    name: 'Form Rekualifikasi Customer',
    element: (
      <ProtectedRoute>
        <RekualifikasiAdd />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/navigation',
    name: 'Navigation',
    element: (
      <ProtectedRoute>
        <NavigationAdmin />
      </ProtectedRoute>
    ),
  },
  {
    path: '/report/rayon',
    name: 'Rayon Cabang',
    element: (
      <ProtectedRoute>
        <RayonCabang />
      </ProtectedRoute>
    ),
  },
  {
    path: '/report/daftarbarang',
    name: 'Rayon Cabang',
    element: (
      <ProtectedRoute>
        <DaftarBarang />
      </ProtectedRoute>
    ),
  },
  {
    path: '/piutang/konfirmasipiutang',
    name: 'Konfirmasi Piutang',
    element: (
      <ProtectedRoute>
        <KonfirmasiPiutang />
      </ProtectedRoute>
    ),
  },
  {
    path: '/piutang/konfirmasipiutang/:customerId/print',
    name: 'Cetak Konfirmasi Piutang',
    element: (
      <ProtectedRoute>
        <KonfirmasiPiutangPrint />
      </ProtectedRoute>
    ),
  },
  {
    path: '/report/outstandingsj/',
    name: 'Outstanding SJ',
    element: (
      <ProtectedRoute>
        <OutstandingSJ />
      </ProtectedRoute>
    ),
  },
  

  // Theme
  { path: '/theme', name: 'Theme', element: Colors, exact: true },
  { path: '/theme/colors', name: 'Colors', element: Colors },
  { path: '/theme/typography', name: 'Typography', element: Typography },
  { path: '/base', name: 'Base', element: Cards, exact: true },
  { path: '/base/accordion', name: 'Accordion', element: Accordion },
  { path: '/base/breadcrumbs', name: 'Breadcrumbs', element: Breadcrumbs },
  { path: '/base/cards', name: 'Cards', element: Cards },
  { path: '/base/carousels', name: 'Carousel', element: Carousels },
  { path: '/base/collapses', name: 'Collapse', element: Collapses },
  { path: '/base/list-groups', name: 'List Groups', element: ListGroups },
  { path: '/base/navs', name: 'Navs', element: Navs },
  { path: '/base/paginations', name: 'Paginations', element: Paginations },
  { path: '/base/placeholders', name: 'Placeholders', element: Placeholders },
  { path: '/base/popovers', name: 'Popovers', element: Popovers },
  { path: '/base/progress', name: 'Progress', element: Progress },
  { path: '/base/spinners', name: 'Spinners', element: Spinners },
  { path: '/base/tabs', name: 'Tabs', element: Tabs },
  { path: '/base/tables', name: 'Tables', element: Tables },
  { path: '/base/tooltips', name: 'Tooltips', element: Tooltips },
  { path: '/buttons', name: 'Buttons', element: Buttons, exact: true },
  { path: '/buttons/buttons', name: 'Buttons', element: Buttons },
  { path: '/buttons/dropdowns', name: 'Dropdowns', element: Dropdowns },
  { path: '/buttons/button-groups', name: 'Button Groups', element: ButtonGroups },
  { path: '/charts', name: 'Charts', element: Charts },
  { path: '/forms', name: 'Forms', element: FormControl, exact: true },
  { path: '/forms/form-control', name: 'Form Control', element: FormControl },
  { path: '/forms/select', name: 'Select', element: Select },
  { path: '/forms/checks-radios', name: 'Checks & Radios', element: ChecksRadios },
  { path: '/forms/range', name: 'Range', element: Range },
  { path: '/forms/input-group', name: 'Input Group', element: InputGroup },
  { path: '/forms/floating-labels', name: 'Floating Labels', element: FloatingLabels },
  { path: '/forms/layout', name: 'Layout', element: Layout },
  { path: '/forms/validation', name: 'Validation', element: Validation },
  { path: '/icons', exact: true, name: 'Icons', element: CoreUIIcons },
  { path: '/icons/coreui-icons', name: 'CoreUI Icons', element: CoreUIIcons },
  { path: '/icons/flags', name: 'Flags', element: Flags },
  { path: '/icons/brands', name: 'Brands', element: Brands },
  { path: '/notifications', name: 'Notifications', element: Alerts, exact: true },
  { path: '/notifications/alerts', name: 'Alerts', element: Alerts },
  { path: '/notifications/badges', name: 'Badges', element: Badges },
  { path: '/notifications/modals', name: 'Modals', element: (<Modals /> )},
  { path: '/notifications/toasts', name: 'Toasts', element: Toasts },
  { path: '/widgets', name: 'Widgets', element: Widgets },
]

export default routes
