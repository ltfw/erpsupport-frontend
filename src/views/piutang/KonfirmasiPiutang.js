import React, { useState, useEffect, usenav } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CFormInput,
  CFormCheck,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CPagination,
  CPaginationItem,
  CRow,
  CFormSelect,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
} from '@coreui/react'
import axios from 'axios'
import CabangSelector from '../modals/CabangSelector'
import CIcon from '@coreui/icons-react'
import { cilDescription } from '@coreui/icons'
import Pagination from '../../components/Pagination'
import { formatRupiah } from '../../utils/Number'

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const KonfirmasiPiutang = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [selectedCabang, setSelectedCabang] = useState([]);
  const [customerList, setCustomerList] = useState([])
  const [totalPages, setTotalPages] = useState(1)

  const navigate = useNavigate()

  // Fetch Customer data
  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams()
      params.append('page', page)
      params.append('per_page', perPage)
      if (search) params.append('search', search)
      if (selectedCabang.length > 0) {
        params.append('cabang', selectedCabang.join(','))
      }

      const response = await axios.get(
        `${ENDPOINT_URL}piutang/konfirmasipiutang?${params.toString()}`,
      )
      console.log('response.data', response.data)
      setCustomerList(response.data.data)
      setTotalPages(response.data.pagination.totalPages)
    }
    fetchData()
  }, [search, page, perPage, selectedCabang])

  return (
    <>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Data Customers</CCardHeader>
            <CCardBody>
              <CRow className='g-1 mb-3'>
                <CCol xs={12} sm={2} className='d-grid'>
                  <CabangSelector
                    onSelect={(items) => {
                      console.log('Selected items:', items)
                      setSelectedCabang(items)
                    }}
                  />
                </CCol>
              </CRow>
              <CRow className="g-1 mb-3">
                <CCol xs={1}>
                  <CFormSelect onChange={(e) => {
                    setPage(1)
                    setPerPage(parseInt(e.target.value, 10))
                  }}>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="10000">All</option>
                  </CFormSelect>
                </CCol>
                <CCol xs={11}>
                  <CFormInput
                    type="text"
                    placeholder="Search Customer..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                  />
                </CCol>
              </CRow>

              <CTable hover striped bordered>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">No</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Nama Cabang</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Kode Customer</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Nama Customer</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Badan Usaha</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Salesman</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Nominal Piutang</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {customerList.map((item, idx) => (
                    <CTableRow key={item.CustomerId}>
                      <CTableDataCell>
                        {idx + 1 + (page - 1) * perPage}
                      </CTableDataCell>
                      <CTableDataCell>{item.NamaDept}</CTableDataCell>
                      <CTableDataCell>{item.KodeLgn}</CTableDataCell>
                      <CTableDataCell>{item.NamaLgn}</CTableDataCell>
                      <CTableDataCell>{item.BusinessEntityName}</CTableDataCell>
                      <CTableDataCell>{item.NamaSales}</CTableDataCell>
                      <CTableDataCell className='text-end'>{formatRupiah(item.nominal)}</CTableDataCell>
                      <CTableDataCell className='text-center'>
                        <CButton
                          color="primary"
                          size="sm"
                          onClick={() => navigate(`/piutang/konfirmasipiutang/${item.CustomerId}/print`)}
                        >
                          <CIcon icon={cilDescription} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              <div className="d-flex justify-content-between mt-3">
                <div>
                  <Pagination page={page} totalPages={totalPages} setPage={setPage} />
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

    </>
  )
}

export default KonfirmasiPiutang