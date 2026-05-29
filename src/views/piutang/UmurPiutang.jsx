import { useEffect, useState, useCallback } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormSelect,
  CRow,
} from '@coreui/react'
import axios from 'axios'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { DataTable } from 'src/components'
import CabangSelector from '../modals/CabangSelector'

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const UmurPiutang = () => {
  const [search, setSearch] = useState(() => localStorage.getItem('umurPiutang_search') || '')
  const [page, setPage] = useState(() => {
    const saved = localStorage.getItem('umurPiutang_page')
    return saved ? parseInt(saved, 10) : 1
  })
  const [perPage, setPerPage] = useState(() => {
    const saved = localStorage.getItem('umurPiutang_perPage')
    return saved ? parseInt(saved, 10) : 10
  })
  const [selectedCabang, setSelectedCabang] = useState(() => {
    const saved = localStorage.getItem('umurPiutang_cabang')
    return saved ? JSON.parse(saved) : []
  })
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)

  const columns = [
    {
      name: 'No',
      selector: (row, index) => (page - 1) * perPage + index + 1,
      sortable: true,
      width: '5%',
    },
    { name: 'NamaDept', selector: (row) => row.NamaDept, sortable: true, wrap: true },
    { name: 'KodeLgn', selector: (row) => row.KodeLgn, sortable: true, wrap: true },
    { name: 'NamaLgn', selector: (row) => row.NamaLgn, sortable: true, wrap: true },
    { name: 'Badan Usaha', selector: (row) => row.BusinessEntityName, sortable: true, wrap: true },
    { name: 'No Faktur', selector: (row) => row.NoFaktur, sortable: true, wrap: true },
    { name: 'Tgl Faktur', selector: (row) => row.TglFaktur, sortable: true, wrap: true },
    { name: 'Tgl Jtp Internal', selector: (row) => row.TglJtpFakturInternal, sortable: true, wrap: true },
    { name: 'Outstanding AR', selector: (row) => row.OutstandingAR, sortable: true },
    { name: 'Overdue Internal', selector: (row) => row.OverDueInternal, sortable: true },
    { name: 'Salesman', selector: (row) => row.NamaSales, sortable: true, wrap: true },
    { name: 'Rayon', selector: (row) => row.RayonCode, sortable: true, wrap: true },
  ]

  const normalizeCabang = (cabangs) =>
    cabangs.map((item) => (typeof item === 'object' ? item.id || item.value || item : item))

  const fetchUmurPiutang = useCallback(async (page, perPage, keyword, cabangIds) => {
    const params = new URLSearchParams()
    params.append('page', page)
    params.append('per_page', perPage)
    if (keyword) params.append('search', keyword)
    if (cabangIds.length > 0) params.append('cabang', cabangIds.join(','))

    const response = await axios.get(`${ENDPOINT_URL}piutang/umurpiutang?${params.toString()}`)
    return {
      data: response.data.data || [],
      total: response.data.pagination?.total || 0,
    }
  }, [])

  const loadData = useCallback(
    async (page, perPage, keyword, cabangIds) => {
      setLoading(true)
      try {
        const result = await fetchUmurPiutang(page, perPage, keyword, cabangIds)
        setData(result.data)
        setTotalRows(result.total)
      } finally {
        setLoading(false)
      }
    },
    [fetchUmurPiutang],
  )

  const exportToExcel = async () => {
    document.body.style.cursor = 'wait'
    try {
      const result = await fetchUmurPiutang(1, 1000000, search, normalizeCabang(selectedCabang))
      const allData = result.data
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Umur Piutang')

      worksheet.columns = [
        { header: 'No', key: 'no', width: 6 },
        { header: 'NamaDept', key: 'NamaDept', width: 20 },
        { header: 'KodeLgn', key: 'KodeLgn', width: 15 },
        { header: 'NamaLgn', key: 'NamaLgn', width: 25 },
        { header: 'Badan Usaha', key: 'BusinessEntityName', width: 25 },
        { header: 'No Faktur', key: 'NoFaktur', width: 20 },
        { header: 'Tgl Faktur', key: 'TglFaktur', width: 15 },
        { header: 'Tgl Jtp Asli', key: 'TglJtpFakturAsli', width: 18 },
        { header: 'Tgl Jtp Internal', key: 'TglJtpFakturInternal', width: 18 },
        { header: 'Outstanding AR', key: 'OutstandingAR', width: 18 },
        { header: 'Overdue Asli', key: 'OverDueAsli', width: 18 },
        { header: 'Overdue Internal', key: 'OverDueInternal', width: 18 },
        { header: 'Salesman', key: 'NamaSales', width: 20 },
        { header: 'Rayon', key: 'RayonCode', width: 12 },
      ]

      allData.forEach((row, index) => {
        worksheet.addRow({ no: index + 1, ...row })
      })

      const buffer = await workbook.xlsx.writeBuffer()
      saveAs(
        new Blob([buffer]),
        `UmurPiutang ${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.xlsx`,
      )
    } catch (error) {
      console.error('Error exporting to Excel:', error)
    } finally {
      document.body.style.cursor = 'default'
    }
  }

  useEffect(() => {
    loadData(page, perPage, search, normalizeCabang(selectedCabang))
  }, [page, perPage, search, selectedCabang, loadData])

  const handlePageChange = (newPage) => {
    setPage(newPage)
    localStorage.setItem('umurPiutang_page', newPage.toString())
  }

  const handlePerRowsChange = (newPerPage, newPage) => {
    setPerPage(newPerPage)
    setPage(newPage)
    localStorage.setItem('umurPiutang_perPage', newPerPage.toString())
    localStorage.setItem('umurPiutang_page', newPage.toString())
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearch(value)
    localStorage.setItem('umurPiutang_search', value)
    setPage(1)
    localStorage.setItem('umurPiutang_page', '1')
  }

  const handleCabangSelect = useCallback((items) => {
    setSelectedCabang(items)
    localStorage.setItem('umurPiutang_cabang', JSON.stringify(items))
    setPage(1)
    localStorage.setItem('umurPiutang_page', '1')
  }, [])

  return (
    <CRow>
      <CCol xs>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <span>Umur Piutang</span>
            <CButton color="success" size="sm" onClick={exportToExcel}>
              Export Excel
            </CButton>
          </CCardHeader>
          <CCardBody>
            <div className="mb-3">
              <CRow>
                <CCol xs={12} sm={2} className="d-grid">
                  <CabangSelector onSelect={handleCabangSelect} />
                </CCol>
                <CCol xs={12} sm={2}>
                  <CFormSelect value={perPage} onChange={(e) => handlePerRowsChange(parseInt(e.target.value, 10), 1)}>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="10000">All</option>
                  </CFormSelect>
                </CCol>
                <CCol xs={12} sm={8}>
                  <CFormInput
                    type="text"
                    placeholder="Search Customer..."
                    value={search}
                    onChange={handleSearchChange}
                  />
                </CCol>
              </CRow>
            </div>

            <DataTable
              dense
              title="Daftar Umur Piutang"
              columns={columns}
              data={data}
              progressPending={loading}
              pagination
              paginationServer
              paginationTotalRows={totalRows}
              onChangeRowsPerPage={handlePerRowsChange}
              onChangePage={handlePageChange}
            />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default UmurPiutang
