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
import { useAuth } from '../../contexts/AuthContext'

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const CabangSelector = ({ onSelect,selectedItems:initialSelectedItems = [] }) => {
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [itemList, setItemList] = useState([])
  const [totalPages, setTotalPages] = useState(1)

  const [selectedItems, setSelectedItems] = useState(initialSelectedItems)

  useEffect(() => {
    setSelectedItems(initialSelectedItems)
  }, [initialSelectedItems])

  useEffect(() => {
    const fetchData = async () => {
      // If user has no access to all branches, filter by user's branch
      const userBranch = user?.KodeDept || ''
      const accessFilter = userBranch ? `&cabang=${userBranch}` : ''

      const response = await axios.get(
        `${ENDPOINT_URL}departments?page=${page}&per_page=${perPage}&search=${encodeURIComponent(search)}${accessFilter}`
      )
      console.log('response.data', response.data)
      setItemList(response.data.data)
      setTotalPages(response.data.pagination.totalPages)
    }
    fetchData()
  }, [search, page, perPage])

  // Check all toggle
  const isAllSelected = itemList.length > 0 && itemList.every(item =>
    selectedItems.includes(item.KodeDept)
  )

  const toggleSelectAll = () => {
    if (isAllSelected) {
      // Unselect all
      setSelectedItems(selectedItems.filter(kode =>
        !itemList.find(b => b.KodeDept === kode)
      ))
    } else {
      // Add all
      const newItems = itemList
        .map(b => b.KodeDept)
        .filter(kode => !selectedItems.includes(kode))
      setSelectedItems([...selectedItems, ...newItems])
    }
  }

  const toggleItem = (item) => {
    if (selectedItems.includes(item.KodeDept)) {
      setSelectedItems(selectedItems.filter(kode => kode !== item.KodeDept))
    } else {
      setSelectedItems([...selectedItems, item.KodeDept])
    }
  }


  return (
    <>
      <CButton color='info' onClick={() => setVisible(true)}>
        {selectedItems.length > 0
          ? `${selectedItems.length} Cabang Dipilih`
          : 'Pilih Cabang'}
      </CButton>


      <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Pilih Cabang</CModalTitle>
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
                placeholder="Cari Cabang..."
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
                <CTableHeaderCell scope="col">Kode Cabang</CTableHeaderCell>
                <CTableHeaderCell scope="col">Nama Cabang</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {itemList.map((item) => (
                <CTableRow key={item.KodeDept}>
                  <CTableDataCell>
                    <CFormCheck
                      checked={selectedItems.includes(item.KodeDept)}
                      onChange={() => toggleItem(item)}
                    />
                  </CTableDataCell>
                  <CTableDataCell>{item.KodeDept}</CTableDataCell>
                  <CTableDataCell>{item.NamaDept}</CTableDataCell>
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

export default CabangSelector
