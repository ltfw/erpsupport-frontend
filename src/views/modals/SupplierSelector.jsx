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
import Pagination from '../../components/Pagination'

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const SupplierSelector = ({ onSelect, mode = '', className = '' }) => {
  const [visible, setVisible] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [itemList, setItemList] = useState([])
  const [totalPages, setTotalPages] = useState(1)

  const [selectedItems, setSelectedItems] = useState([])

  const handlePageChange = (newPage) => {
    setPage(newPage)
    localStorage.setItem('supplierSelector_page', newPage.toString())
  }

  useEffect(() => {
    const fetchData = async () => {
      let response = null;
      if (mode === 'all') {
        response = await axios.get(
          `${ENDPOINT_URL}suppliers/all?page=${page}&per_page=${perPage}&search=${encodeURIComponent(search)}`
        )
      } else {
        response = await axios.get(
          `${ENDPOINT_URL}customers?page=${page}&per_page=${perPage}&search=${encodeURIComponent(search)}`
        )
      }
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
      <CButton color='info' className={className} onClick={() => setVisible(true)}>
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
              <Pagination page={page} totalPages={totalPages} setPage={handlePageChange} />
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
