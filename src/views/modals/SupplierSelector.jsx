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

const SupplierSelector = ({ onSelect }) => {
  const [visible, setVisible] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [itemList, setItemList] = useState([])
  const [totalPages, setTotalPages] = useState(1)

  const [selectedItems, setSelectedItems] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(
        `${ENDPOINT_URL}suppliers?page=${page}&per_page=${perPage}&search=${encodeURIComponent(search)}`
      )
      console.log('response.data', response.data)
      setItemList(response.data.data)
      setTotalPages(response.data.pagination.totalPages)
    }
    fetchData()
  }, [search, page, perPage])

  // Check all toggle
  const isAllSelected = itemList.length > 0 && itemList.every(item =>
    selectedItems.includes(item.KodeLgn)
  )

  const toggleSelectAll = () => {
    if (isAllSelected) {
      // Unselect all
      setSelectedItems(selectedItems.filter(kode =>
        !itemList.find(b => b.KodeLgn === kode)
      ))
    } else {
      // Add all
      const newItems = itemList
        .map(b => b.KodeLgn)
        .filter(kode => !selectedItems.includes(kode))
      setSelectedItems([...selectedItems, ...newItems])
    }
  }

  const toggleItem = (item) => {
    if (selectedItems.includes(item.KodeLgn)) {
      setSelectedItems(selectedItems.filter(kode => kode !== item.KodeLgn))
    } else {
      setSelectedItems([...selectedItems, item.KodeLgn])
    }
  }


  return (
    <>
      <CButton color='info' onClick={() => setVisible(true)}>
        {selectedItems.length > 0
          ? `${selectedItems.length} Supplier Dipilih`
          : 'Pilih Supplier'}
      </CButton>


      <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Pilih Supplier</CModalTitle>
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
                placeholder="Cari Supplier..."
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
                <CTableHeaderCell scope="col">Kode Supplier</CTableHeaderCell>
                <CTableHeaderCell scope="col">Nama Supplier</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {itemList.map((item) => (
                <CTableRow key={item.KodeLgn}>
                  <CTableDataCell>
                    <CFormCheck
                      checked={selectedItems.includes(item.KodeLgn)}
                      onChange={() => toggleItem(item)}
                    />
                  </CTableDataCell>
                  <CTableDataCell>{item.KodeLgn}</CTableDataCell>
                  <CTableDataCell>{item.NamaLgn}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          <div className="d-flex justify-content-between mt-3">
            <div>
              <CPagination>
                <CPaginationItem
                  disabled={page === 1}
                  onClick={() => setPage(1)}
                >
                  First
                </CPaginationItem>
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
                <CPaginationItem
                  disabled={page === totalPages}
                  onClick={() => setPage(totalPages)}
                >
                  Last
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

export default SupplierSelector
