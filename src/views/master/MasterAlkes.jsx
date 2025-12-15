import React, { useState, useEffect } from 'react'
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

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const MasterAlkes = () => {
  // Load search value from localStorage on component mount
  const [search, setSearch] = useState(() => {
    const savedSearch = localStorage.getItem('masterAlkes_search')
    return savedSearch || ''
  })
  // Load pagination values from localStorage on component mount
  const [page, setPage] = useState(() => {
    const savedPage = localStorage.getItem('masterAlkes_page')
    return savedPage ? parseInt(savedPage, 10) : 1
  })
  const [perPage, setPerPage] = useState(() => {
    const savedPerPage = localStorage.getItem('masterAlkes_perPage')
    return savedPerPage ? parseInt(savedPerPage, 10) : 10
  })
  const [selectedCabang, setSelectedCabang] = useState([])
  const [alkesList, setAlkesList] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [modal, setModal] = useState(false)
  const [alkesData, setAlkesData] = useState({
    id: null,
    KodeMas: '',
    NamaProdukKemenkes: '',
    KodeCabang: '',
    NamaCabang: '',
    IdProdukKemenkes: '',
    Nie: '',
    NamaProduk: '',
    TipeUkuran: '',
  })
  const [editing, setEditing] = useState(false)

  const navigate = useNavigate()

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`${ENDPOINT_URL}master/alkes/${id}`);
        setAlkesList(alkesList.filter(item => item.id !== id));
        // Refresh data
        const params = new URLSearchParams()
        params.append('page', page)
        params.append('per_page', perPage)
        if (search) params.append('search', search)
        if (selectedCabang.length > 0) {
          params.append('cabang', selectedCabang.join(','))
        }
        const response = await axios.get(
          `${ENDPOINT_URL}master/alkes?${params.toString()}`,
        )
        setAlkesList(response.data.data)
        setTotalPages(response.data.pagination.totalPages)
      } catch (error) {
        console.error("Error deleting alkes:", error);
      }
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post(`${ENDPOINT_URL}master/alkes`, alkesData);
      setModal(false);
      setAlkesData({
        id: null,
        KodeMas: '',
        NamaProdukKemenkes: '',
        KodeCabang: '',
        NamaCabang: '',
        IdProdukKemenkes: '',
        Nie: '',
        NamaProduk: '',
        TipeUkuran: '',
      });
      // Refresh data
      const params = new URLSearchParams()
      params.append('page', page)
      params.append('per_page', perPage)
      if (search) params.append('search', search)
      if (selectedCabang.length > 0) {
        params.append('cabang', selectedCabang.join(','))
      }
      const response = await axios.get(
        `${ENDPOINT_URL}master/alkes?${params.toString()}`,
      )
      setAlkesList(response.data.data)
      setTotalPages(response.data.pagination.totalPages)
    } catch (error) {
      console.error("Error creating alkes:", error);
      alert("Failed to create alkes. Please try again.");
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${ENDPOINT_URL}master/alkes/${alkesData.id}`, alkesData);
      setModal(false);
      setEditing(false);
      setAlkesData({
        id: null,
        KodeMas: '',
        NamaProdukKemenkes: '',
        KodeCabang: '',
        NamaCabang: '',
        IdProdukKemenkes: '',
        Nie: '',
        NamaProduk: '',
        TipeUkuran: '',
      });
      // Refresh data
      const params = new URLSearchParams()
      params.append('page', page)
      params.append('per_page', perPage)
      if (search) params.append('search', search)
      if (selectedCabang.length > 0) {
        params.append('cabang', selectedCabang.join(','))
      }
      const response = await axios.get(
        `${ENDPOINT_URL}master/alkes?${params.toString()}`,
      )
      setAlkesList(response.data.data)
      setTotalPages(response.data.pagination.totalPages)
    } catch (error) {
      console.error("Error updating alkes:", error);
      alert("Failed to update alkes. Please try again.");
    }
  };

  const handleEdit = (item) => {
    setAlkesData({
      id: item.id,
      KodeMas: item.KodeMas || '',
      NamaProdukKemenkes: item.NamaProdukKemenkes || '',
      KodeCabang: item.KodeCabang || '',
      NamaCabang: item.NamaCabang || '',
      IdProdukKemenkes: item.IdProdukKemenkes || '',
      Nie: item.Inventory.Nie || '',
      NamaProduk: item.Inventory.NamaBarang || '',
      TipeUkuran: item.Inventory.TipeUkuran || '',
    });
    setEditing(true);
    setModal(true);
  };

  // Custom setPage function that saves to localStorage
  const handlePageChange = (newPage) => {
    setPage(newPage)
    localStorage.setItem('masterAlkes_page', newPage.toString())
  }

  // Fetch Alkes data
  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams()
      params.append('page', page)
      params.append('per_page', perPage)
      if (search) params.append('search', search)
      if (selectedCabang.length > 0) {
        params.append('cabang', selectedCabang.join(','))
      }

      try {
        const response = await axios.get(
          `${ENDPOINT_URL}master/alkes?${params.toString()}`,
        )
        console.log('response.data', response.data)
        setAlkesList(response.data.data)
        setTotalPages(response.data.pagination.totalPages)
      } catch (error) {
        console.error('Error fetching alkes data:', error)
        // Set mock data for development if API fails
        // setAlkesList([
        //   {
        //     id: 1,
        //     KodeMas: 'MAS001',
        //     NamaProdukKemenkes: 'Alat Kesehatan MAS 1',
        //     KodeCabang: 'CB001',
        //     NamaCabang: 'Cabang Jakarta',
        //     IdProdukKemenkes: 'KEM001',
        //     Nie: 'NIE001',
        //     NamaProduk: 'Alat Kesehatan 1',
        //     TipeUkuran: 'Type A - Medium'
        //   },
        //   {
        //     id: 2,
        //     KodeMas: 'MAS002',
        //     NamaProdukKemenkes: 'Alat Kesehatan MAS 2',
        //     KodeCabang: 'CB002',
        //     NamaCabang: 'Cabang Surabaya',
        //     IdProdukKemenkes: 'KEM002',
        //     Nie: 'NIE002',
        //     NamaProduk: 'Alat Kesehatan 2',
        //     TipeUkuran: 'Type B - Large'
        //   }
        // ])
        // setTotalPages(1)
      }
    }
    fetchData()
  }, [search, page, perPage, selectedCabang])

  return (
    <>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Master Data Alkes</CCardHeader>
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
                  <CFormSelect
                    value={perPage}
                    onChange={(e) => {
                      const newPerPage = parseInt(e.target.value, 10)
                      setPage(1)
                      setPerPage(newPerPage)
                      // Save pagination values to localStorage
                      localStorage.setItem('masterAlkes_perPage', newPerPage.toString())
                      localStorage.setItem('masterAlkes_page', '1')
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
                    type="text"
                    placeholder="Search Alkes..."
                    value={search}
                    onChange={(e) => {
                      const newSearchValue = e.target.value
                      setSearch(newSearchValue)
                      setPage(1)
                      // Save search value to localStorage
                      localStorage.setItem('masterAlkes_search', newSearchValue)
                    }}
                  />
                </CCol>
              </CRow>

              <CTable hover striped bordered>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">No</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Kode MAS</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Nama Produk Alkes MAS</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Kode Cabang</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Nama Cabang</CTableHeaderCell>
                    <CTableHeaderCell scope="col">ID PRODUK KEMENKES</CTableHeaderCell>
                    <CTableHeaderCell scope="col">NIE</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Nama Produk</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Tipe dan Ukuran</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {alkesList.map((item, idx) => (
                    <CTableRow key={item.id}>
                      <CTableDataCell>
                        {idx + 1 + (page - 1) * perPage}
                      </CTableDataCell>
                      <CTableDataCell>{item.KodeMas}</CTableDataCell>
                      <CTableDataCell>{item.NamaProdukKemenkes}</CTableDataCell>
                      <CTableDataCell>{item.KodeCabang}</CTableDataCell>
                      <CTableDataCell>{item.NamaCabang}</CTableDataCell>
                      <CTableDataCell>{item.IdProdukKemenkes}</CTableDataCell>
                      <CTableDataCell>{item.Inventory.Nie}</CTableDataCell>
                      <CTableDataCell>{item.Inventory.NamaBarang}</CTableDataCell>
                      <CTableDataCell>{item.Inventory.TipeUkuran}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="warning"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="me-2"
                        >
                          Edit
                        </CButton>
                        <CButton
                          color="danger"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </CButton>
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
              <CButton color="success" onClick={() => {
                setEditing(false);
                setAlkesData({
                  id: null,
                  KodeMas: '',
                  NamaProdukKemenkes: '',
                  KodeCabang: '',
                  NamaCabang: '',
                  IdProdukKemenkes: '',
                  Nie: '',
                  NamaProduk: '',
                  TipeUkuran: '',
                });
                setModal(true);
              }}>
                Add New
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal visible={modal} onClose={() => setModal(false)} size="lg">
        <CModalHeader onClose={() => setModal(false)}>
          <CModalTitle>{editing ? 'Edit Alkes' : 'Add New Alkes'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol md={6} className="mb-3">
              <CFormInput
                label="Kode MAS"
                placeholder="Enter Kode MAS"
                value={alkesData.KodeMas}
                onChange={(e) =>
                  setAlkesData({ ...alkesData, KodeMas: e.target.value })
                }
              />
            </CCol>
            <CCol md={6} className="mb-3">
              <CFormInput
                label="Nama Produk Alkes MAS"
                placeholder="Enter Nama Produk Alkes MAS"
                value={alkesData.NamaProdukKemenkes}
                onChange={(e) =>
                  setAlkesData({ ...alkesData, NamaProdukKemenkes: e.target.value })
                }
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={6} className="mb-3">
              <CFormInput
                label="Kode Cabang"
                placeholder="Enter Kode Cabang"
                value={alkesData.KodeCabang}
                onChange={(e) =>
                  setAlkesData({ ...alkesData, KodeCabang: e.target.value })
                }
              />
            </CCol>
            <CCol md={6} className="mb-3">
              <CFormInput
                label="Nama Cabang"
                placeholder="Enter Nama Cabang"
                value={alkesData.NamaCabang}
                onChange={(e) =>
                  setAlkesData({ ...alkesData, NamaCabang: e.target.value })
                }
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={6} className="mb-3">
              <CFormInput
                label="ID Produk Kemenkes"
                placeholder="Enter ID Produk Kemenkes"
                value={alkesData.IdProdukKemenkes}
                onChange={(e) =>
                  setAlkesData({ ...alkesData, IdProdukKemenkes: e.target.value })
                }
              />
            </CCol>
            <CCol md={6} className="mb-3">
              <CFormInput
                disabled
                label="NIE"
                placeholder="Enter NIE"
                value={alkesData.Nie}
                onChange={(e) => setAlkesData({ ...alkesData, Nie: e.target.value })}
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={6} className="mb-3">
              <CFormInput
              disabled
                label="Nama Produk"
                placeholder="Enter Nama Produk"
                value={alkesData.NamaProduk}
                onChange={(e) =>
                  setAlkesData({ ...alkesData, NamaProduk: e.target.value })
                }
              />
            </CCol>
            <CCol md={6} className="mb-3">
              <CFormInput
              disabled
                label="Tipe dan Ukuran"
                placeholder="Enter Tipe dan Ukuran"
                value={alkesData.TipeUkuran}
                onChange={(e) =>
                  setAlkesData({ ...alkesData, TipeUkuran: e.target.value })
                }
              />
            </CCol>
          </CRow>
        </CModalBody>
        <CModalHeader>
          <CButton color="primary" onClick={editing ? handleUpdate : handleCreate}>
            {editing ? 'Update' : 'Create'}
          </CButton>
        </CModalHeader>
      </CModal>
    </>
  )
}

export default MasterAlkes