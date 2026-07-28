import { useEffect, useState, useCallback } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableFoot,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import axios from 'axios'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import DatePicker, { registerLocale } from 'react-datepicker'
import { id as localeId } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'
import Pagination from '../../components/Pagination'
import CabangSelector from '../modals/CabangSelector'

registerLocale('id', localeId)

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const STORAGE_KEY = 'evaluasiAR'

const firstDayOfMonth = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

const lastDayOfMonth = () => {
  const d = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

const formatThousand = (num) => {
  if (num == null || isNaN(num)) return '0,00'
  return Number(num).toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const formatTanggal = (isoDate) => {
  if (!isoDate) return '-'
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}/${y}`
}

// 'yyyy-mm-dd' <-> Date (lokal, tanpa geser timezone)
const parseISO = (isoDate) => {
  if (!isoDate) return null
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const toISO = (date) => {
  if (!date) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`
}

const EvaluasiAR = () => {
  const [selectedCabang, setSelectedCabang] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_cabang`)
    return saved ? JSON.parse(saved) : []
  })
  const [tglAwal, setTglAwal] = useState(
    () => localStorage.getItem(`${STORAGE_KEY}_tglAwal`) || firstDayOfMonth(),
  )
  const [tglAkhir, setTglAkhir] = useState(
    () => localStorage.getItem(`${STORAGE_KEY}_tglAkhir`) || lastDayOfMonth(),
  )
  const [search, setSearch] = useState(() => localStorage.getItem(`${STORAGE_KEY}_search`) || '')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_perPage`)
    return saved ? parseInt(saved, 10) : 10
  })

  const [data, setData] = useState([])
  const [summary, setSummary] = useState(null)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchEvaluasiAR = useCallback(
    async (pageNum, pageSize, keyword, cabangIds, awal, akhir) => {
      const params = new URLSearchParams()
      params.append('page', pageNum)
      params.append('per_page', pageSize)
      params.append('tgl_awal', awal)
      params.append('tgl_akhir', akhir)
      if (keyword) params.append('search', keyword)
      if (cabangIds.length > 0) params.append('cabang', cabangIds.join(','))

      const response = await axios.get(`${ENDPOINT_URL}piutang/evaluasiar?${params.toString()}`)
      return {
        data: response.data.data || [],
        summary: response.data.summary || null,
        total: response.data.pagination?.total || 0,
        totalPages: response.data.pagination?.totalPages || 1,
      }
    },
    [],
  )

  const loadData = useCallback(
    async (pageNum, pageSize, keyword, cabangIds, awal, akhir) => {
      setLoading(true)
      try {
        const result = await fetchEvaluasiAR(pageNum, pageSize, keyword, cabangIds, awal, akhir)
        setData(result.data)
        setSummary(result.summary)
        setTotalRows(result.total)
        setTotalPages(result.totalPages)
      } catch (error) {
        console.error('Error loading Evaluasi AR:', error)
        setData([])
        setSummary(null)
        setTotalRows(0)
        setTotalPages(1)
      } finally {
        setLoading(false)
      }
    },
    [fetchEvaluasiAR],
  )

  useEffect(() => {
    loadData(page, perPage, search, selectedCabang, tglAwal, tglAkhir)
  }, [page, perPage, search, selectedCabang, tglAwal, tglAkhir, loadData])

  const handlePageChange = useCallback((newPage) => setPage(newPage), [])

  const handlePerPageChange = (e) => {
    const newPerPage = parseInt(e.target.value, 10)
    setPerPage(newPerPage)
    localStorage.setItem(`${STORAGE_KEY}_perPage`, newPerPage.toString())
    setPage(1)
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearch(value)
    localStorage.setItem(`${STORAGE_KEY}_search`, value)
    setPage(1)
  }

  const handleCabangSelect = useCallback((items) => {
    setSelectedCabang((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(items)) return prev
      localStorage.setItem(`${STORAGE_KEY}_cabang`, JSON.stringify(items))
      return items
    })
    setPage(1)
  }, [])

  const handleTglAwalChange = (date) => {
    if (!date) return
    const value = toISO(date)
    setTglAwal(value)
    localStorage.setItem(`${STORAGE_KEY}_tglAwal`, value)
    setPage(1)
  }

  const handleTglAkhirChange = (date) => {
    if (!date) return
    const value = toISO(date)
    setTglAkhir(value)
    localStorage.setItem(`${STORAGE_KEY}_tglAkhir`, value)
    setPage(1)
  }

  const exportToExcel = async () => {
    document.body.style.cursor = 'wait'
    try {
      const result = await fetchEvaluasiAR(1, -1, search, selectedCabang, tglAwal, tglAkhir)
      const allData = result.data

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Evaluasi AR')

      worksheet.columns = [
        { key: 'KodeCustomer', width: 18 },
        { key: 'BadanUsaha', width: 18 },
        { key: 'NamaCustomer', width: 30 },
        { key: 'CustomerGroup', width: 20 },
        { key: 'TOP', width: 10 },
        { key: 'Cabang', width: 18 },
        { key: 'SaldoAwal', width: 18, style: { numFmt: '#,##0.00' } },
        { key: 'Penjualan', width: 18, style: { numFmt: '#,##0.00' } },
        { key: 'Tunai', width: 18, style: { numFmt: '#,##0.00' } },
        { key: 'SSP', width: 18, style: { numFmt: '#,##0.00' } },
        { key: 'SaldoAkhir', width: 18, style: { numFmt: '#,##0.00' } },
      ]

      // ---- Blok informasi laporan ----
      const tahunAkhir = parseInt(tglAkhir.slice(0, 4), 10)
      const info = [
        ['Gen/Tahun', ':', `${tahunAkhir - 1} / ${tahunAkhir}`],
        ['Periode', ':', `${formatTanggal(tglAwal)} s/d ${formatTanggal(tglAkhir)}`],
        ['Cabang', ':', selectedCabang.length > 0 ? selectedCabang.join(', ') : 'Semua Cabang'],
        ['Nama Outlet', ':', search ? search : 'Semua Customer'],
      ]
      info.forEach((line) => {
        const row = worksheet.addRow(line)
        row.getCell(1).font = { bold: true }
      })
      worksheet.addRow([])

      // ---- Header tabel (2 baris, kolom Pembayaran di-merge) ----
      const headerTopRowNumber = worksheet.rowCount + 1
      const headerBottomRowNumber = headerTopRowNumber + 1

      const headerTop = worksheet.addRow([
        'Kode Customer',
        'Badan Usaha',
        'Nama Customer',
        'Customer Group',
        'TOP',
        'Cabang',
        'Saldo Awal',
        'Penjualan',
        'Pembayaran',
        '',
        'Saldo Akhir',
      ])
      const headerBottom = worksheet.addRow(['', '', '', '', '', '', '', '', 'Tunai', 'SSP', ''])

      // Merge kolom tunggal secara vertikal, dan "Pembayaran" secara horizontal
      const singleColumns = [1, 2, 3, 4, 5, 6, 7, 8, 11]
      singleColumns.forEach((col) => {
        worksheet.mergeCells(headerTopRowNumber, col, headerBottomRowNumber, col)
      })
      worksheet.mergeCells(headerTopRowNumber, 9, headerTopRowNumber, 10)

      const styleHeaderCell = (cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F6389' } }
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
          left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
          bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
          right: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        }
      }
      for (let col = 1; col <= 11; col += 1) {
        styleHeaderCell(headerTop.getCell(col))
        styleHeaderCell(headerBottom.getCell(col))
      }
      headerTop.height = 20
      headerBottom.height = 20

      // ---- Data ----
      allData.forEach((row) => {
        worksheet.addRow({
          KodeCustomer: row.KodeCustomer,
          BadanUsaha: row.BadanUsaha,
          NamaCustomer: row.NamaCustomer,
          CustomerGroup: row.CustomerGroup,
          TOP: row.TOP,
          Cabang: row.Cabang,
          SaldoAwal: Number(row.SaldoAwal || 0),
          Penjualan: Number(row.Penjualan || 0),
          Tunai: Number(row.Tunai || 0),
          SSP: Number(row.SSP || 0),
          SaldoAkhir: Number(row.SaldoAkhir || 0),
        })
      })

      // ---- Baris total ----
      const totals = result.summary || {}
      const totalRow = worksheet.addRow({
        KodeCustomer: 'TOTAL',
        SaldoAwal: Number(totals.SaldoAwal || 0),
        Penjualan: Number(totals.Penjualan || 0),
        Tunai: Number(totals.Tunai || 0),
        SSP: Number(totals.SSP || 0),
        SaldoAkhir: Number(totals.SaldoAkhir || 0),
      })
      totalRow.font = { bold: true }
      totalRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEDF2F7' } }
      })

      worksheet.views = [{ state: 'frozen', ySplit: headerBottomRowNumber }]

      const buffer = await workbook.xlsx.writeBuffer()
      saveAs(new Blob([buffer]), `Evaluasi AR ${tglAwal} sd ${tglAkhir}.xlsx`)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      alert('Gagal mengunduh data!')
    } finally {
      document.body.style.cursor = 'default'
    }
  }

  return (
    <>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <span>Evaluasi AR</span>
              <CButton color="success" size="sm" onClick={exportToExcel}>
                Export Excel
              </CButton>
            </CCardHeader>
            <CCardBody>
              <CRow className="g-2 mb-3 align-items-end">
                <CCol xs={12} sm={2}>
                  <CFormLabel>Cabang</CFormLabel>
                  <div className="d-grid">
                    <CabangSelector
                      fullWidth
                      onSelect={handleCabangSelect}
                      selectedItems={selectedCabang}
                    />
                  </div>
                </CCol>
                <CCol xs={12} sm={2}>
                  <CFormLabel>Tgl. Awal</CFormLabel>
                  <DatePicker
                    selected={parseISO(tglAwal)}
                    onChange={handleTglAwalChange}
                    maxDate={parseISO(tglAkhir)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/mm/yyyy"
                    locale="id"
                    className="form-control"
                    wrapperClassName="w-100"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                </CCol>
                <CCol xs={12} sm={2}>
                  <CFormLabel>Tgl. Akhir</CFormLabel>
                  <DatePicker
                    selected={parseISO(tglAkhir)}
                    onChange={handleTglAkhirChange}
                    minDate={parseISO(tglAwal)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/mm/yyyy"
                    locale="id"
                    className="form-control"
                    wrapperClassName="w-100"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                </CCol>
                <CCol xs={12} sm={2}>
                  <CFormLabel>Tampil</CFormLabel>
                  <CFormSelect value={perPage} onChange={handlePerPageChange}>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="10000">All</option>
                  </CFormSelect>
                </CCol>
                <CCol xs={12} sm={4}>
                  <CFormLabel>Nama / Kode Customer</CFormLabel>
                  <CFormInput
                    type="text"
                    placeholder="Search Customer..."
                    value={search}
                    onChange={handleSearchChange}
                  />
                </CCol>
              </CRow>

              <div className="table-responsive">
                <CTable hover striped bordered small>
                  <CTableHead>
                    <CTableRow className="text-center align-middle">
                      <CTableHeaderCell scope="col" rowSpan={2}>
                        No
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" rowSpan={2}>
                        Kode Customer
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" rowSpan={2}>
                        Badan Usaha
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" rowSpan={2}>
                        Nama Customer
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" rowSpan={2}>
                        Customer Group
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" rowSpan={2}>
                        TOP
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" rowSpan={2}>
                        Cabang
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" rowSpan={2}>
                        Saldo Awal
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" rowSpan={2}>
                        Penjualan
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" colSpan={2}>
                        Pembayaran
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" rowSpan={2}>
                        Saldo Akhir
                      </CTableHeaderCell>
                    </CTableRow>
                    <CTableRow className="text-center align-middle">
                      <CTableHeaderCell scope="col">Tunai</CTableHeaderCell>
                      <CTableHeaderCell scope="col">SSP</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {loading && (
                      <CTableRow>
                        <CTableDataCell colSpan={12} className="text-center py-4">
                          Memuat data...
                        </CTableDataCell>
                      </CTableRow>
                    )}

                    {!loading && data.length === 0 && (
                      <CTableRow>
                        <CTableDataCell colSpan={12} className="text-center py-4">
                          Tidak ada data
                        </CTableDataCell>
                      </CTableRow>
                    )}

                    {!loading &&
                      data.map((item, idx) => (
                        <CTableRow key={`${item.KodeCustomer}-${idx}`}>
                          <CTableDataCell className="text-center">
                            {idx + 1 + (page - 1) * perPage}
                          </CTableDataCell>
                          <CTableDataCell>{item.KodeCustomer}</CTableDataCell>
                          <CTableDataCell>{item.BadanUsaha}</CTableDataCell>
                          <CTableDataCell>{item.NamaCustomer}</CTableDataCell>
                          <CTableDataCell>{item.CustomerGroup}</CTableDataCell>
                          <CTableDataCell>{item.TOP}</CTableDataCell>
                          <CTableDataCell>{item.Cabang}</CTableDataCell>
                          <CTableDataCell className="text-end">
                            {formatThousand(item.SaldoAwal)}
                          </CTableDataCell>
                          <CTableDataCell className="text-end">
                            {formatThousand(item.Penjualan)}
                          </CTableDataCell>
                          <CTableDataCell className="text-end">
                            {formatThousand(item.Tunai)}
                          </CTableDataCell>
                          <CTableDataCell className="text-end">
                            {formatThousand(item.SSP)}
                          </CTableDataCell>
                          <CTableDataCell className="text-end">
                            {formatThousand(item.SaldoAkhir)}
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                  </CTableBody>

                  {summary && (
                    <CTableFoot>
                      <CTableRow className="fw-bold">
                        <CTableDataCell colSpan={7} className="text-end">
                          TOTAL
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          {formatThousand(summary.SaldoAwal)}
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          {formatThousand(summary.Penjualan)}
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          {formatThousand(summary.Tunai)}
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          {formatThousand(summary.SSP)}
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          {formatThousand(summary.SaldoAkhir)}
                        </CTableDataCell>
                      </CTableRow>
                    </CTableFoot>
                  )}
                </CTable>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  <Pagination page={page} totalPages={totalPages} setPage={handlePageChange} />
                </div>
                <div className="text-muted small">Total {totalRows} customer</div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default EvaluasiAR
