import React, { useState, useEffect,usenav } from 'react'
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
import { cilPencil } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { formatISODateToDDMMYYYY } from '../../utils/Date'

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const Rekualifikasi = ({ onSelect }) => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [customerList, setCustomerList] = useState([])
  const [totalPages, setTotalPages] = useState(1)

  const navigate = useNavigate()

  // Fetch Customer data
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(
        `${ENDPOINT_URL}customers/requalify?page=${page}&per_page=${perPage}&search=${encodeURIComponent(search)}`
      )
      console.log('response.data', response.data)
      setCustomerList(response.data.data)
      setTotalPages(response.data.pagination.totalPages)
    }
    fetchData()
  }, [search, page, perPage])

  return (
    <>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Data Customers</CCardHeader>
            <CCardBody>
              <CRow className="g-1 mb-3">
                <CCol xs={2}>
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
                <CCol xs={8}>
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
                <CCol xs={2} className="d-grid gap-2">
                  <CButton
                    color="primary"
                    onClick={() => {
                      navigate('/customer/requalify/add')
                    }}
                  >
                    Add New
                  </CButton>
                </CCol>
              </CRow>

              <CTable hover striped bordered>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">No Transaksi</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Tgl Transaksi</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Cabang</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Rayon</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Salesman</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Edit</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {customerList.map((item) => (
                    <CTableRow key={item.NoTransaksi}>
                      <CTableDataCell>{item.NoTransaksi}</CTableDataCell>
                      <CTableDataCell>{formatISODateToDDMMYYYY(item.TglInput)}</CTableDataCell>
                      <CTableDataCell>{item.NamaDept}</CTableDataCell>
                      <CTableDataCell>{item.Rayon}</CTableDataCell>
                      <CTableDataCell>{item.Salesman}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="info" size="sm" onClick={() => navigate(`/customer/requalify/edit/${item.NoTransaksi}`)}>
                          <CIcon icon={cilPencil} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              <div className="d-flex justify-content-between mt-3">
                <div>
                  <CPagination>
                    <CPaginationItem
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </CPaginationItem>
                    {[...Array(totalPages)].map((_, index) => (
                      <CPaginationItem
                        key={index}
                        active={page === index + 1}
                        onClick={() => setPage(index + 1)}
                      >
                        {index + 1}
                      </CPaginationItem>
                    ))}
                    <CPaginationItem
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </CPaginationItem>
                  </CPagination>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

    </>
  )
}

export default Rekualifikasi
