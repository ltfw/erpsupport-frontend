import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton, CModal, CModalHeader, CModalTitle, CModalBody,
  CFormInput, CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CRow, CFormSelect, CCol,
  CCard, CCardHeader, CCardBody,
} from '@coreui/react'
import axios from 'axios'
import CabangSelector from '../modals/CabangSelector'
import CIcon from '@coreui/icons-react'
import { cilPlus } from '@coreui/icons'
import Pagination from '../../components/Pagination'

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL
const INITIAL_ALKES_STATE = {
  id: null, KodeMas: '', NamaProdukKemenkes: '', KodeCabang: '',
  NamaCabang: '', IdProdukKemenkes: '', Nie: '', NamaProduk: '', TipeUkuran: '',
}

const MasterAlkes = () => {
  // --- State ---
  const [search, setSearch] = useState(() => localStorage.getItem('masterAlkes_search') || '')
  const [page, setPage] = useState(() => parseInt(localStorage.getItem('masterAlkes_page'), 10) || 1)
  const [perPage, setPerPage] = useState(() => parseInt(localStorage.getItem('masterAlkes_perPage'), 10) || 10)
  const [selectedCabang, setSelectedCabang] = useState([])
  const [alkesList, setAlkesList] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(false)
  const [alkesData, setAlkesData] = useState(INITIAL_ALKES_STATE)

  // --- Memoized Values ---
  const queryParams = useMemo(() => {
    const params = new URLSearchParams()
    params.append('page', page)
    params.append('per_page', perPage)
    if (search) params.append('search', search)
    if (selectedCabang.length > 0) params.append('cabang', selectedCabang.join(','))
    return params.toString()
  }, [page, perPage, search, selectedCabang])

  // --- Callbacks ---
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`${ENDPOINT_URL}master/alkes?${queryParams}`)
      setAlkesList(response.data.data)
      setTotalPages(response.data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching alkes data:', error)
    }
  }, [queryParams])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage)
    localStorage.setItem('masterAlkes_page', newPage.toString())
  }, [])

  const handleSearchChange = useCallback((e) => {
    const val = e.target.value
    setSearch(val)
    setPage(1)
    localStorage.setItem('masterAlkes_search', val)
    localStorage.setItem('masterAlkes_page', '1')
  }, [])

  const handleCreateOrUpdate = useCallback(async () => {
    try {
      const url = `${ENDPOINT_URL}master/alkes${editing ? `/${alkesData.id}` : ''}`
      const method = editing ? 'put' : 'post'
      
      await axios[method](url, alkesData)
      setModal(false)
      setAlkesData(INITIAL_ALKES_STATE)
      fetchData() // Refresh list
    } catch (error) {
      console.error(`Error ${editing ? 'updating' : 'creating'} alkes:`, error)
      alert("Action failed. Please try again.")
    }
  }, [editing, alkesData, fetchData])

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Are you sure?")) return
    try {
      await axios.delete(`${ENDPOINT_URL}master/alkes/${id}`)
      fetchData()
    } catch (error) {
      console.error("Error deleting alkes:", error)
    }
  }, [fetchData])

  const handleEditOpen = useCallback((item) => {
    setAlkesData({
      id: item.id,
      KodeMas: item.KodeMas || '',
      NamaProdukKemenkes: item.NamaProdukKemenkes || '',
      KodeCabang: item.KodeCabang || '',
      NamaCabang: item.NamaCabang || '',
      IdProdukKemenkes: item.IdProdukKemenkes || '',
      Nie: item.Inventory?.Nie || '',
      NamaProduk: item.Inventory?.NamaBarang || '',
      TipeUkuran: item.Inventory?.TipeUkuran || '',
    })
    setEditing(true)
    setModal(true)
  }, [])

  const handleAddNewOpen = useCallback(() => {
    setEditing(false)
    setAlkesData(INITIAL_ALKES_STATE)
    setModal(true)
  }, [])

  return (
    <>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>
              Master Data Alkes
              <CButton className='float-end' color="primary" onClick={handleAddNewOpen}>
                <CIcon icon={cilPlus} className='me-2' />Add New
              </CButton>
            </CCardHeader>
            <CCardBody>
              {/* Filter Controls */}
              <CRow className='g-1 mb-3'>
                <CCol xs={12} sm={2} className='d-grid'>
                  <CabangSelector onSelect={setSelectedCabang} />
                </CCol>
              </CRow>
              
              <CRow className="g-1 mb-3">
                <CCol xs={1}>
                  <CFormSelect
                    value={perPage}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10)
                      setPerPage(val)
                      setPage(1)
                      localStorage.setItem('masterAlkes_perPage', val.toString())
                    }}
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="10000">All</option>
                  </CFormSelect>
                </CCol>
                <CCol xs={11}>
                  <CFormInput
                    placeholder="Search Alkes..."
                    value={search}
                    onChange={handleSearchChange}
                  />
                </CCol>
              </CRow>

              {/* Table Section */}
              <CTable hover striped bordered responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>No</CTableHeaderCell>
                    <CTableHeaderCell>Kode MAS</CTableHeaderCell>
                    <CTableHeaderCell>Nama Produk Alkes MAS</CTableHeaderCell>
                    <CTableHeaderCell>Kode Cabang</CTableHeaderCell>
                    <CTableHeaderCell>Nama Cabang</CTableHeaderCell>
                    <CTableHeaderCell>ID KEMENKES</CTableHeaderCell>
                    <CTableHeaderCell>NIE</CTableHeaderCell>
                    <CTableHeaderCell>Nama Produk</CTableHeaderCell>
                    <CTableHeaderCell>Tipe & Ukuran</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {alkesList.map((item, idx) => (
                    <CTableRow key={item.id}>
                      <CTableDataCell>{idx + 1 + (page - 1) * perPage}</CTableDataCell>
                      <CTableDataCell>{item.KodeMas}</CTableDataCell>
                      <CTableDataCell>{item.NamaProdukKemenkes}</CTableDataCell>
                      <CTableDataCell>{item.KodeCabang}</CTableDataCell>
                      <CTableDataCell>{item.NamaCabang}</CTableDataCell>
                      <CTableDataCell>{item.IdProdukKemenkes}</CTableDataCell>
                      <CTableDataCell>{item.Inventory?.Nie}</CTableDataCell>
                      <CTableDataCell>{item.Inventory?.NamaBarang}</CTableDataCell>
                      <CTableDataCell>{item.Inventory?.TipeUkuran}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" size="sm" onClick={() => handleEditOpen(item)} className="me-2">Edit</CButton>
                        <CButton color="danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              <Pagination page={page} totalPages={totalPages} setPage={handlePageChange} />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Shared Modal for Create/Update */}
      <CModal visible={modal} onClose={() => setModal(false)} size="lg">
        <CModalHeader onClose={() => setModal(false)}>
          <CModalTitle>{editing ? 'Edit Alkes' : 'Add New Alkes'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="g-3">
            {[
              { label: 'Kode MAS', key: 'KodeMas' },
              { label: 'Nama Produk Alkes MAS', key: 'NamaProdukKemenkes' },
              { label: 'Kode Cabang', key: 'KodeCabang' },
              { label: 'Nama Cabang', key: 'NamaCabang' },
              { label: 'ID Produk Kemenkes', key: 'IdProdukKemenkes' },
              { label: 'NIE', key: 'Nie', disabled: true },
              { label: 'Nama Produk', key: 'NamaProduk', disabled: true },
              { label: 'Tipe dan Ukuran', key: 'TipeUkuran', disabled: true },
            ].map((field) => (
              <CCol md={6} key={field.key}>
                <CFormInput
                  label={field.label}
                  disabled={field.disabled}
                  value={alkesData[field.key]}
                  onChange={(e) => setAlkesData({ ...alkesData, [field.key]: e.target.value })}
                />
              </CCol>
            ))}
          </CRow>
        </CModalBody>
        <div className="p-3 text-end">
          <CButton color="secondary" className="me-2" onClick={() => setModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleCreateOrUpdate}>
            {editing ? 'Update' : 'Create'}
          </CButton>
        </div>
      </CModal>
    </>
  )
}

export default MasterAlkes