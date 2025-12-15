import React, { useState, useEffect } from 'react'
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CFormInput,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CFormSelect,
} from '@coreui/react'
import axios from 'axios'
import Pagination from '../../components/Pagination'

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const CabangAlkes = () => {
  const [search, setSearch] = useState(() => {
    const saved = localStorage.getItem('cabangAlkes_search')
    return saved || ''
  })
  const [page, setPage] = useState(() => {
    const saved = localStorage.getItem('cabangAlkes_page')
    return saved ? parseInt(saved, 10) : 1
  })
  const [perPage, setPerPage] = useState(() => {
    const saved = localStorage.getItem('cabangAlkes_perPage')
    return saved ? parseInt(saved, 10) : 10
  })

  const [list, setList] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(false)
  const [data, setData] = useState({
    id: null,
    CabangSumber: '',
    NamaCabangSumber: '',
    CabangTarget: '',
    NamaCabangTarget: '',
    KodeUpline: '',
    NamaUpline: '',
  })

  // handle page change and save to localStorage
  const handlePageChange = (newPage) => {
    setPage(newPage)
    localStorage.setItem('cabangAlkes_page', newPage.toString())
  }

  const fetchData = async () => {
    console.log('Fetching data with', { page, perPage, search })
    const params = new URLSearchParams()
    params.append('page', page)
    params.append('per_page', perPage)
    if (search) params.append('search', search)

    try {
      const response = await axios.get(`${ENDPOINT_URL}master/cabangalkes?${params.toString()}`)
      setList(response.data.data || [])
      setTotalPages(response.data.pagination?.totalPages || 1)
    } catch (err) {
      console.error('Error fetching cabangalkes:', err)
    }
  }

  useEffect(() => {
    console.log('useEffect triggered with', { search, page, perPage })
    fetchData()
  }, [search, page, perPage])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this mapping?')) return
    try {
      await axios.delete(`${ENDPOINT_URL}master/cabangalkes/${id}`)
      await fetchData()
    } catch (err) {
      console.error('Error deleting:', err)
      alert('Failed to delete')
    }
  }

  const handleCreate = async () => {
    try {
      await axios.post(`${ENDPOINT_URL}master/cabangalkes`, data)
      setModal(false)
      setData({
        id: null,
        CabangSumber: '',
        NamaCabangSumber: '',
        CabangTarget: '',
        NamaCabangTarget: '',
        KodeUpline: '',
        NamaUpline: '',
      })
      await fetchData()
    } catch (err) {
      console.error('Error creating:', err)
      alert('Failed to create')
    }
  }

  const handleUpdate = async () => {
    try {
      await axios.put(`${ENDPOINT_URL}master/cabangalkes/${data.id}`, data)
      setModal(false)
      setEditing(false)
      setData({
        id: null,
        CabangSumber: '',
        NamaCabangSumber: '',
        CabangTarget: '',
        NamaCabangTarget: '',
        KodeUpline: '',
        NamaUpline: '',
      })
      await fetchData()
    } catch (err) {
      console.error('Error updating:', err)
      alert('Failed to update')
    }
  }

  const handleEdit = (item) => {
    setData({
      id: item.id,
      CabangSumber: item.CabangSumber || '',
      NamaCabangSumber: item.NamaCabangSumber || '',
      CabangTarget: item.CabangTarget || '',
      NamaCabangTarget: item.NamaCabangTarget || '',
      KodeUpline: item.KodeUpline || '',
      NamaUpline: item.NamaUpline || '',
    })
    setEditing(true)
    setModal(true)
  }

  return (
    <>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>
              <span>Cabang Alkes Mapping</span>
              <CButton color="info" size='sm' onClick={() => {
                setEditing(false)
                setData({
                  id: null,
                  CabangSumber: '',
                  NamaCabangSumber: '',
                  CabangTarget: '',
                  NamaCabangTarget: '',
                  KodeUpline: '',
                  NamaUpline: '',
                })
                setModal(true)
              }} className="float-end">
                
                Add New</CButton>
            </CCardHeader>
            <CCardBody>
              <CRow className="g-1 mb-3 justify-content-between">
                <CCol xs="auto">
                  <CFormSelect
                    value={perPage}
                    onChange={(e) => {
                      const newPer = parseInt(e.target.value, 10)
                      setPerPage(newPer)
                      setPage(1)
                      localStorage.setItem('cabangAlkes_perPage', newPer.toString())
                      localStorage.setItem('cabangAlkes_page', '1')
                    }}
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="10000">All</option>
                  </CFormSelect>
                </CCol>
                <CCol xs="auto">
                  <CFormInput
                    type="text"
                    placeholder="Search mapping..."
                    value={search}
                    onChange={(e) => {
                      const v = e.target.value
                      setSearch(v)
                      setPage(1)
                      localStorage.setItem('cabangAlkes_search', v)
                    }}
                  />
                </CCol>
              </CRow>

              <CTable hover striped bordered>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>No</CTableHeaderCell>
                    <CTableHeaderCell>Cabang Sumber</CTableHeaderCell>
                    <CTableHeaderCell>Nama Cabang Sumber</CTableHeaderCell>
                    <CTableHeaderCell>Cabang Target</CTableHeaderCell>
                    <CTableHeaderCell>Nama Cabang Target</CTableHeaderCell>
                    <CTableHeaderCell>Kode Upline</CTableHeaderCell>
                    <CTableHeaderCell>Nama Upline</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {list.map((item, idx) => (
                    <CTableRow key={item.id}>
                      <CTableDataCell>{idx + 1 + (page - 1) * perPage}</CTableDataCell>
                      <CTableDataCell>{item.CabangSumber}</CTableDataCell>
                      <CTableDataCell>{item.NamaCabangSumber}</CTableDataCell>
                      <CTableDataCell>{item.CabangTarget}</CTableDataCell>
                      <CTableDataCell>{item.NamaCabangTarget}</CTableDataCell>
                      <CTableDataCell>{item.KodeUpline}</CTableDataCell>
                      <CTableDataCell>{item.NamaUpline}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" size="sm" onClick={() => handleEdit(item)} className="me-2">Edit</CButton>
                        <CButton color="danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              <div className="d-flex justify-content-between mt-3">
                <div>
                  <Pagination page={page} totalPages={totalPages} setPage={handlePageChange} />
                </div>
              </div>

            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal visible={modal} onClose={() => setModal(false)} size="lg">
        <CModalHeader onClose={() => setModal(false)}>
          <CModalTitle>{editing ? 'Edit Mapping' : 'Add New Mapping'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol md={6} className="mb-3">
              <CFormInput label="Cabang Sumber" placeholder="Enter Cabang Sumber" value={data.CabangSumber} onChange={(e) => setData({ ...data, CabangSumber: e.target.value })} />
            </CCol>
            <CCol md={6} className="mb-3">
              <CFormInput label="Nama Cabang Sumber" placeholder="Enter Nama Cabang Sumber" value={data.NamaCabangSumber} onChange={(e) => setData({ ...data, NamaCabangSumber: e.target.value })} />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={6} className="mb-3">
              <CFormInput label="Cabang Target" placeholder="Enter Cabang Target" value={data.CabangTarget} onChange={(e) => setData({ ...data, CabangTarget: e.target.value })} />
            </CCol>
            <CCol md={6} className="mb-3">
              <CFormInput label="Nama Cabang Target" placeholder="Enter Nama Cabang Target" value={data.NamaCabangTarget} onChange={(e) => setData({ ...data, NamaCabangTarget: e.target.value })} />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={6} className="mb-3">
              <CFormInput label="Kode Upline" placeholder="Enter Kode Upline (optional)" value={data.KodeUpline} onChange={(e) => setData({ ...data, KodeUpline: e.target.value })} />
            </CCol>
            <CCol md={6} className="mb-3">
              <CFormInput label="Nama Upline" placeholder="Enter Nama Upline (optional)" value={data.NamaUpline} onChange={(e) => setData({ ...data, NamaUpline: e.target.value })} />
            </CCol>
          </CRow>
        </CModalBody>
        <CModalHeader>
          <CButton color="primary" onClick={editing ? handleUpdate : handleCreate}>{editing ? 'Update' : 'Create'}</CButton>
        </CModalHeader>
      </CModal>
    </>
  )
}

export default CabangAlkes
