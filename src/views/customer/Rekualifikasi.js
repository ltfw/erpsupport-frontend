import React, { useState, useEffect } from 'react'
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

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const Rekualifikasi = ({ onSelect }) => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [customerList, setCustomerList] = useState([])
  const [totalPages, setTotalPages] = useState(1)


  // Fetch Customer data
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(
        `${ENDPOINT_URL}customer/requalify?page=${page}&per_page=${perPage}&search=${encodeURIComponent(search)}`
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
              <CRow className="g-1">
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
                <CCol xs={8} className="mb-3">
                  <CFormInput
                    type="text"
                    placeholder="Search Customer..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                    className="mb-3"
                  />
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
                    <CTableHeaderCell scope="col">Periode</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Edit</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Delete</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {customerList.map((item) => (
                    <CTableRow key={item.KodeItem}>
                      <CTableDataCell>
                        <CFormCheck
                          checked={selectedItems.includes(item.KodeItem)}
                          onChange={() => toggleItem(item)}
                        />
                      </CTableDataCell>
                      <CTableDataCell>{item.KodeItem}</CTableDataCell>
                      <CTableDataCell>{item.NamaBarang}</CTableDataCell>
                      <CTableDataCell>{item.Keterangan}</CTableDataCell>
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
