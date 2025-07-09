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
} from '@coreui/react'
import axios from 'axios'

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const BarangSelector = ({ onSelect }) => {
  const [visible, setVisible] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [barangList, setBarangList] = useState([])
  const [totalPages, setTotalPages] = useState(1)

  const [selectedItems, setSelectedItems] = useState([])

  // Fetch barang data
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(
        `${ENDPOINT_URL}stocks?page=${page}&per_page=${perPage}&search=${encodeURIComponent(search)}`
      )
      console.log('response.data', response.data)
      setBarangList(response.data.data)
      setTotalPages(response.data.pagination.totalPages)
    }
    fetchData()
  }, [search, page, perPage])

  // Check all toggle
  const isAllSelected = barangList.length > 0 && barangList.every(item =>
    selectedItems.includes(item.KodeItem)
  )

  const toggleSelectAll = () => {
    if (isAllSelected) {
      // Unselect all
      setSelectedItems(selectedItems.filter(kode =>
        !barangList.find(b => b.KodeItem === kode)
      ))
    } else {
      // Add all
      const newItems = barangList
        .map(b => b.KodeItem)
        .filter(kode => !selectedItems.includes(kode))
      setSelectedItems([...selectedItems, ...newItems])
    }
  }

  const toggleItem = (item) => {
    if (selectedItems.includes(item.KodeItem)) {
      setSelectedItems(selectedItems.filter(kode => kode !== item.KodeItem))
    } else {
      setSelectedItems([...selectedItems, item.KodeItem])
    }
  }


  return (
    <>
      <CButton color='info' onClick={() => setVisible(true)}>
        {selectedItems.length > 0
          ? `${selectedItems.length} Barang Dipilih`
          : 'Pilih Barang'}
      </CButton>


      <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Select Barang</CModalTitle>
        </CModalHeader>
        <CModalBody>
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
            <CCol xs={10} className="mb-3">
              <CFormInput
                type="text"
                placeholder="Search barang..."
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
                <CTableHeaderCell scope="col">
                  <CFormCheck
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                  />
                </CTableHeaderCell>
                <CTableHeaderCell scope="col">Code</CTableHeaderCell>
                <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                <CTableHeaderCell scope="col">Keterangan</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {barangList.map((item) => (
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

            <div>
              <CButton
                color="primary"
                onClick={() => {
                  onSelect(selectedItems)
                  setVisible(false)
                }}
              >
                Pilih
              </CButton>
            </div>
          </div>
        </CModalBody>
      </CModal>
    </>
  )
}

export default BarangSelector
