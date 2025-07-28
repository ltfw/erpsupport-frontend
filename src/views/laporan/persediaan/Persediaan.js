import { useEffect, useState } from 'react'

import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'
import { useNavigate } from 'react-router-dom'

import { DataTable } from 'src/components'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPrint, cilTrash } from '@coreui/icons'
import { getCurrentDateFormatted } from '../../../utils/Date'
import CabangSelector from '../../modals/CabangSelector'
import SupplierSelector from '../../modals/SupplierSelector'
import BarangSelector from '../../modals/BarangSelector'
import DatePicker from '../../base/datepicker/DatePicker'
const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const Persediaan = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const [selectedBarang, setSelectedBarang] = useState([])
  const [selectedCabang, setSelectedCabang] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState([]);
  const [endDate, setEndDate] = useState(getCurrentDateFormatted());

  const column = [
    {
      name: 'No',
      selector: (row, index) => (page - 1) * perPage + index + 1,
      sortable: true,
      width: '6%',
    },
    {
      name: 'Business Center',
      selector: (row) => row.BusinessCentreName,
      sortable: true,
    },
    {
      name: 'Kode Gudang',
      selector: (row) => row.KodeGudang,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Nama Gudang',
      selector: (row) => row.NamaGudang,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Kode Barang',
      selector: (row) => row.KodeItem,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Nama Barang',
      selector: (row) => row.NamaBarang,
      sortable: true,
    },
    {
      name: 'Batch Number',
      selector: (row) => row.BatchNumber,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Tgl Expired',
      selector: (row) => row.TglExpired,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Qty',
      selector: (row) => row.Qty,
      sortable: true,
      wrap: true,
    },
  ]

  const loadDataPersediaan = async (page, perPage, keyword = '', cabangIds = [], supplierIds = [], barangIds = [],  endDate = null) => {
    setLoading(true)
    setPage(page)
    const fetchData = await fetchPersediaan(page, perPage, keyword, cabangIds, supplierIds, barangIds, endDate)
    setData(fetchData.data)
    setTotalRows(fetchData.total)
    setLoading(false)
  }

  const fetchPersediaan = async (page, perPage, keyword = '', cabangIds = [], supplierIds = [], barangIds = [],  endDate = null) => {
    console.log('fetchSales called with page:', page, 'keyword:', keyword, 'cabangIds:', cabangIds, 'barangIds:', barangIds, 'endDate:', endDate)
    const params = new URLSearchParams()
    params.append('page', page)
    params.append('per_page', perPage)
    if (keyword) params.append('search', keyword)
    if (cabangIds.length > 0) {
      params.append('cabang', cabangIds.join(',')) // or whatever your API expects
    }
    if (supplierIds.length > 0) {
      params.append('vendor', supplierIds.join(',')) // or whatever your API expects
    }
    if (barangIds.length > 0) {
      params.append('barang', barangIds.join(',')) // or whatever your API expects
    }
    if (endDate) {
      params.append('date', endDate)
    }

    const response = await axios.get(`${ENDPOINT_URL}stocks/perbatch?${params.toString()}`)

    return { data: response.data.data, total: response.data.pagination.total }
  }

  const handlePageChange = (page) => {
    loadDataPersediaan(page, perPage, search, selectedCabang, selectedSupplier, selectedBarang,  endDate)
  }

  const handlePerRowsChange = async (newPerPage, page) => {
    setPerPage(newPerPage)
    loadDataPersediaan(page, newPerPage, search, selectedCabang, selectedSupplier, selectedBarang,  endDate)
  }

  useEffect(() => {
    setPerPage(perPage)
    if (endDate) {
      loadDataPersediaan(1, perPage, '', selectedCabang, selectedSupplier, selectedBarang,  endDate)
    }
  }, [perPage, selectedCabang, selectedSupplier, selectedBarang, endDate])

  return (
    <>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Data Customers</CCardHeader>
            <CCardBody>
              <div className="mb-3">
                <CRow>
                  <CCol xs={12} sm={2} className='d-grid'>
                    <CabangSelector
                      onSelect={(items) => {
                        console.log('Selected items:', items)
                        setSelectedCabang(items)
                      }}
                    />
                  </CCol>
                  <CCol xs={12} sm={2} className='d-grid'>
                    <SupplierSelector onSelect={(items) => {
                      console.log('Selected items:', items)
                      setSelectedSupplier(items)
                    }} />
                  </CCol>
                  <CCol xs={12} sm={2} className='d-grid'>
                    <BarangSelector onSelect={(items) => {
                      console.log('Selected items:', items)
                      setSelectedBarang(items)
                    }} />
                  </CCol>
                  <CCol xs={12} sm={2}>
                    <DatePicker onChange={setEndDate} value={endDate} />
                  </CCol>
                </CRow>
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or code"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    fetchPersediaan(1, e.target.value) // reset to page 1 on search
                  }}
                />
              </div>

              <DataTable
                dense
                title="Data Barang Per Batch"
                columns={column}
                data={data}
                progressPending={loading}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                onChangeRowsPerPage={handlePerRowsChange}
                onChangePage={handlePageChange}
                button
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Persediaan
