import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CFormInput,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CRow,
  CFormSelect,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilDescription } from '@coreui/icons'
import axios from 'axios'
import SupplierSelector from '../modals/SupplierSelector'
import Pagination from '../../components/Pagination'
import { formatRupiahWithoutDecimal } from '../../utils/Number'
import DatePicker from '../base/datepicker/DatePicker'

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const KonfirmasiHutang = () => {
  // Load initial state from localStorage with fallbacks
  const [search, setSearch] = useState(() => localStorage.getItem('konfirmasiHutang_search') || '')
  const [page, setPage] = useState(() => {
    const saved = localStorage.getItem('konfirmasiHutang_page')
    return saved ? Math.max(1, parseInt(saved, 10)) : 1
  })
  const [perPage, setPerPage] = useState(() => {
    const saved = localStorage.getItem('konfirmasiHutang_perPage')
    return saved ? parseInt(saved, 10) : 10
  })
  const [selectedSupplier, setSelectedSupplier] = useState(() => {
    try {
      const raw = localStorage.getItem('konfirmasiHutang_selectedSupplier')
      return raw ? JSON.parse(raw) : []
    } catch (err) {
      return []
    }
  })
  const [hutangList, setHutangList] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState(localStorage.getItem('konfirmasiHutang_startDate') || '')
  const [endDate, setEndDate] = useState(localStorage.getItem('konfirmasiHutang_endDate') || '')
  const [selectorKey, setSelectorKey] = useState(0)

  const navigate = useNavigate()

  // Memoized params to avoid recreating object on every render
  const queryParams = useMemo(() => {
    const params = new URLSearchParams()
    params.append('page', page)
    params.append('per_page', perPage)

    if (search.trim()) params.append('search', search.trim())
    if (selectedSupplier.length > 0) params.append('vendor', selectedSupplier.join(','))
    if (startDate && endDate) {
      params.append('start_date', startDate)
      params.append('end_date', endDate)
    }

    return params.toString()
  }, [page, perPage, search, selectedSupplier, startDate, endDate])

  // Debounced fetch to prevent too many requests
  const fetchData = useCallback(async () => {
    if (!ENDPOINT_URL) return

    setLoading(true)
    try {
      const response = await axios.get(`${ENDPOINT_URL}hutang/konfirmasihutang?${queryParams}`)
      setHutangList(response.data.data || [])
      setTotalPages(response.data?.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error fetching hutang data:', error)
      setHutangList([])
      setTotalPages(1)
      // Optional: show toast notification
    } finally {
      setLoading(false)
    }
  }, [queryParams])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handlers
  const handleStartDateChange = (value) => {
    const val = value || ''
    setStartDate(val)
    if (val) {
      localStorage.setItem('konfirmasiHutang_startDate', val)
    } else {
      localStorage.removeItem('konfirmasiHutang_startDate')
    }
    setPage(1)
  }

  const handleEndDateChange = (value) => {
    const val = value || ''
    setEndDate(val)
    if (val) {
      localStorage.setItem('konfirmasiHutang_endDate', val)
    } else {
      localStorage.removeItem('konfirmasiHutang_endDate')
    }
    setPage(1)
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearch(value)
    localStorage.setItem('konfirmasiHutang_search', value)
    setPage(1)
  }

  const handlePerPageChange = (e) => {
    const newPerPage = parseInt(e.target.value, 10)
    setPerPage(newPerPage)
    setPage(1)
    localStorage.setItem('konfirmasiHutang_perPage', newPerPage.toString())
    localStorage.setItem('konfirmasiHutang_page', '1')
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    localStorage.setItem('konfirmasiHutang_page', newPage.toString())
  }

  const handleClearFilter = () => {
    setSelectedSupplier([])
    setSearch('')
    setStartDate('')
    setEndDate('')
    setPage(1)
    setSelectorKey(prev => prev + 1)

    localStorage.removeItem('konfirmasiHutang_search')
    localStorage.removeItem('konfirmasiHutang_startDate')
    localStorage.removeItem('konfirmasiHutang_endDate')
    localStorage.removeItem('konfirmasiHutang_selectedSupplier')
    localStorage.setItem('konfirmasiHutang_page', '1')
  }

  const handlePrint = () => {
    if (!startDate || !endDate) {
      alert('Pilih tanggal mulai dan akhir terlebih dahulu untuk cetak!')
      return
    }
    const supplierParam = selectedSupplier.length > 0 ? selectedSupplier.join(',') : 'all'
    navigate(`/hutang/konfirmasihutang/${startDate}/${endDate}/${supplierParam}/print`)
  }

  const getRowKey = (item, index) => {
    // Combine multiple fields to ensure unique key, always include index as fallback
    const parts = [
      item.NoFaktur,
      item.NoFakturSupplier,
      item.TglTrn,
      item.NamaLgn,
      item.SupplierId || item.CustomerId || item.KodeLgn,
      index
    ].filter(Boolean)
    return parts.join('-') || `row-${index}`
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Data Konfirmasi Hutang Supplier</strong>
          </CCardHeader>
          <CCardBody>
            {/* Filter Row 1: Supplier, Dates, Actions */}
            <CRow className="g-3 mb-3 align-items-end">
              <CCol xs={12} md={2}>
                <SupplierSelector
                  className="w-100"
                  key={selectorKey}
                  mode="all"
                  selected={selectedSupplier}
                  onSelect={(items) => {
                    setSelectedSupplier(items)
                    try {
                      localStorage.setItem('konfirmasiHutang_selectedSupplier', JSON.stringify(items))
                    } catch (err) {
                      // ignore storage errors
                    }
                    setPage(1)
                  }}
                />
              </CCol>
              <CCol xs={12} md={2}>
                <DatePicker
                  label="Tgl Mulai"
                  value={startDate}
                  onChange={handleStartDateChange}
                  placeholder="Pilih tanggal mulai"
                />
              </CCol>
              <CCol xs={12} md={2}>
                <DatePicker
                  label="Tgl Akhir"
                  value={endDate}
                  onChange={handleEndDateChange}
                  placeholder="Pilih tanggal akhir"
                />
              </CCol>
              <CCol xs={12} md={2}>
                <CButton color="primary" className="w-100" onClick={handlePrint}>
                  <CIcon icon={cilDescription} className="me-2" />
                  Cetak
                </CButton>
              </CCol>
              <CCol xs={12} md={2}>
                <CButton color="secondary" variant="outline" className="w-100" onClick={handleClearFilter}>
                  Clear Filter
                </CButton>
              </CCol>
            </CRow>

            {/* Search & Per Page */}
            <CRow className="g-3 mb-3">
              <CCol xs={12} md={2}>
                <CFormSelect value={perPage} onChange={handlePerPageChange}>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="10000">Semua</option>
                </CFormSelect>
              </CCol>
              <CCol xs={12} md={10}>
                <CFormInput
                  type="search"
                  placeholder="Cari nama supplier atau no faktur..."
                  value={search}
                  onChange={handleSearchChange}
                />
              </CCol>
            </CRow>

            {/* Table */}
            <div className="table-responsive">
              <CTable hover striped bordered responsive>
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell className="text-center">No</CTableHeaderCell>
                    <CTableHeaderCell>Nama Langganan</CTableHeaderCell>
                    <CTableHeaderCell>No Faktur</CTableHeaderCell>
                    <CTableHeaderCell>No Faktur Supplier</CTableHeaderCell>
                    <CTableHeaderCell>Tanggal Transaksi</CTableHeaderCell>
                    <CTableHeaderCell>Jatuh Tempo</CTableHeaderCell>
                    <CTableHeaderCell>Overdue</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Nominal</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {loading ? (
                    <CTableRow>
                      <CTableDataCell colSpan={8} className="text-center">
                        Loading...
                      </CTableDataCell>
                    </CTableRow>
                  ) : hutangList.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan={8} className="text-center text-muted">
                        Tidak ada data hutang yang ditemukan
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    hutangList.map((item, idx) => (
                      <CTableRow key={getRowKey(item, idx)}>
                        <CTableDataCell className="text-center">
                          {idx + 1 + (page - 1) * perPage}
                        </CTableDataCell>
                        <CTableDataCell>{item.NamaLgn || '-'}</CTableDataCell>
                        <CTableDataCell>{item.NoFaktur || '-'}</CTableDataCell>
                        <CTableDataCell>{item.NoFakturSupplier || '-'}</CTableDataCell>
                        <CTableDataCell>{item.TglTrn || '-'}</CTableDataCell>
                        <CTableDataCell>{item.TglJthTmp || '-'}</CTableDataCell>
                        <CTableDataCell>{item.UmurHutang ?? '-'}</CTableDataCell>
                        <CTableDataCell className="text-end text-nowrap">
                          {formatRupiahWithoutDecimal(item.Nominal)}
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  )}
                </CTableBody>
              </CTable>
            </div>

            {/* Pagination */}
            {!loading && hutangList.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-3">
                <div className="text-muted small">
                  Menampilkan {(page - 1) * perPage + 1} -{' '}
                  {Math.min(page * perPage, (totalPages - 1) * perPage + hutangList.length)} dari{' '}
                  {totalPages > 1 ? 'banyak' : hutangList.length} data
                </div>
                <Pagination page={page} totalPages={totalPages} setPage={handlePageChange} />
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default KonfirmasiHutang