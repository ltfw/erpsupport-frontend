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
  CFormSwitch,
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

const STORAGE_KEY = 'agingArCollection'

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

// Kolom tanggal dikirim sebagai ISO (tengah malam UTC); potong dulu supaya tidak tergeser timezone
const formatTanggalISO = (value) => {
  if (!value) return '-'
  return formatTanggal(String(value).slice(0, 10))
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

// Satu sumber kebenaran untuk 43 kolom: dipakai header tabel, body, footer, dan export Excel.
// type: 'text' | 'multiline' | 'date' | 'int' | 'money'. sum: ikut ditotal di footer.
const COLUMNS = [
  { key: 'KodeCustomer', label: 'Kode Customer', type: 'text', width: 14 },
  { key: 'BadanUsaha', label: 'Badan Usaha', type: 'text', width: 14 },
  { key: 'NamaCustomer', label: 'Nama Customer', type: 'text', width: 30 },
  { key: 'CustomerGroup', label: 'Customer Group', type: 'text', width: 24 },
  { key: 'NoFaktur', label: 'No. Faktur', type: 'text', width: 22 },
  { key: 'TglFaktur', label: 'Tgl Faktur', type: 'date', width: 13 },
  { key: 'JatuhTempo', label: 'Jatuh Tempo', type: 'date', width: 13 },
  { key: 'AgingAR', label: 'Aging AR', type: 'int', width: 10 },
  { key: 'NilaiFaktur', label: 'Nilai Faktur', type: 'money', width: 18, sum: true },
  { key: 'TotalBayar', label: 'Total Bayar', type: 'money', width: 18, sum: true },
  { key: 'TglBayar', label: 'Tgl. Bayar', type: 'date', width: 13 },
  { key: 'NilaiPiutang', label: 'Nilai Piutang', type: 'money', width: 18, sum: true },
  { key: 'DurasiOverdue', label: 'Durasi Overdue', type: 'int', width: 12 },
  { key: 'Bucket0_30', label: '0-30', type: 'money', width: 16, sum: true },
  { key: 'Bucket31_60', label: '31-60', type: 'money', width: 16, sum: true },
  { key: 'Bucket61_90', label: '61-90', type: 'money', width: 16, sum: true },
  { key: 'Bucket91_120', label: '91-120', type: 'money', width: 16, sum: true },
  { key: 'BucketOver120', label: '>120', type: 'money', width: 16, sum: true },
  { key: 'DPP', label: 'DPP', type: 'money', width: 18, sum: true },
  { key: 'PPh', label: 'PPh', type: 'money', width: 16, sum: true },
  { key: 'PPN', label: 'PPN', type: 'money', width: 16, sum: true },
  { key: 'SSPPPNDiterima', label: 'SSP PPN Diterima', type: 'money', width: 18, sum: true },
  { key: 'SSPPPhDiterima', label: 'SSP PPh Diterima', type: 'money', width: 18, sum: true },
  { key: 'EstimasiBulanIni', label: 'Estimasi Bulan Ini', type: 'money', width: 18 },
  { key: 'Keterangan', label: 'Keterangan', type: 'text', width: 30 },
  { key: 'TglTerimaT3F', label: 'Tgl Terima T3F / Pemberkasan', type: 'multiline', width: 18 },
  { key: 'DurasiTerimaT3F', label: 'Durasi Terima T3F', type: 'multiline', width: 14 },
  { key: 'TglVisitTerakhir', label: 'Tgl Visit Terakhir', type: 'multiline', width: 16 },
  { key: 'AlasanBelumTertagih', label: 'Alasan Belum Tertagih', type: 'multiline', width: 28 },
  { key: 'FrekuensiKunjungan', label: 'Frekuensi Kunjungan', type: 'int', width: 12 },
  { key: 'NamaSalesman', label: 'Nama Salesman', type: 'text', width: 26 },
  { key: 'Cabang', label: 'Cabang', type: 'text', width: 18 },
  { key: 'Area', label: 'Area', type: 'text', width: 12 },
  { key: 'Rayon', label: 'Rayon', type: 'text', width: 16 },
  { key: 'NamaRayon', label: 'Nama Rayon', type: 'text', width: 30 },
  { key: 'NoSP', label: 'No.SP', type: 'text', width: 18 },
  { key: 'Noted', label: 'Noted', type: 'text', width: 20 },
  { key: 'Pelunasan', label: 'Pelunasan', type: 'money', width: 18, sum: true },
  { key: 'PelunasanSSP', label: 'Pelunasan SSP', type: 'money', width: 18, sum: true },
  {
    key: 'SisaPiutangJTBlnSebelumnya',
    label: 'Sisa Piutang JT Bln Sebelumnya',
    type: 'money',
    width: 20,
    sum: true,
  },
  { key: 'StatusPembayaran', label: 'Status Pembayaran', type: 'text', width: 18 },
  { key: 'KeteranganT3F', label: 'Keterangan T3F', type: 'text', width: 18 },
  { key: 'StatusDue', label: 'Status Due', type: 'text', width: 18 },
]

const isNumeric = (type) => type === 'money' || type === 'int'

const cellText = (col, row) => {
  const value = row[col.key]
  if (col.type === 'date') return formatTanggalISO(value)
  if (col.type === 'money') return value == null ? '' : formatThousand(value)
  if (col.type === 'int') return value == null ? '' : value
  return value ?? ''
}

const AgingARCollection = () => {
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
  const [outstandingOnly, setOutstandingOnly] = useState(
    () => localStorage.getItem(`${STORAGE_KEY}_outstandingOnly`) === 'true',
  )
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

  const fetchAgingAR = useCallback(
    async (pageNum, pageSize, keyword, cabangIds, awal, akhir, onlyOutstanding) => {
      const params = new URLSearchParams()
      params.append('page', pageNum)
      params.append('per_page', pageSize)
      params.append('tgl_awal', awal)
      params.append('tgl_akhir', akhir)
      if (keyword) params.append('search', keyword)
      if (cabangIds.length > 0) params.append('cabang', cabangIds.join(','))
      if (onlyOutstanding) params.append('outstanding_only', '1')

      const response = await axios.get(
        `${ENDPOINT_URL}piutang/agingarcollection?${params.toString()}`,
      )
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
    async (pageNum, pageSize, keyword, cabangIds, awal, akhir, onlyOutstanding) => {
      setLoading(true)
      try {
        const result = await fetchAgingAR(
          pageNum,
          pageSize,
          keyword,
          cabangIds,
          awal,
          akhir,
          onlyOutstanding,
        )
        setData(result.data)
        setSummary(result.summary)
        setTotalRows(result.total)
        setTotalPages(result.totalPages)
      } catch (error) {
        console.error('Error loading Aging AR & Collection:', error)
        setData([])
        setSummary(null)
        setTotalRows(0)
        setTotalPages(1)
      } finally {
        setLoading(false)
      }
    },
    [fetchAgingAR],
  )

  useEffect(() => {
    loadData(page, perPage, search, selectedCabang, tglAwal, tglAkhir, outstandingOnly)
  }, [page, perPage, search, selectedCabang, tglAwal, tglAkhir, outstandingOnly, loadData])

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

  const handleOutstandingOnlyChange = (e) => {
    const value = e.target.checked
    setOutstandingOnly(value)
    localStorage.setItem(`${STORAGE_KEY}_outstandingOnly`, String(value))
    setPage(1)
  }

  const exportToExcel = async () => {
    document.body.style.cursor = 'wait'
    try {
      const result = await fetchAgingAR(
        1,
        -1,
        search,
        selectedCabang,
        tglAwal,
        tglAkhir,
        outstandingOnly,
      )
      const allData = result.data

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Aging AR & Collection')

      worksheet.columns = COLUMNS.map((col) => ({
        key: col.key,
        width: col.width,
        style: col.type === 'money' ? { numFmt: '#,##0.00' } : undefined,
      }))

      // ---- Blok informasi laporan ----
      const info = [
        ['Laporan', ':', 'Aging AR & Collection'],
        ['Posisi Piutang', ':', `per ${formatTanggal(tglAkhir)}`],
        ['Periode Pelunasan', ':', `${formatTanggal(tglAwal)} s/d ${formatTanggal(tglAkhir)}`],
        ['Cabang', ':', selectedCabang.length > 0 ? selectedCabang.join(', ') : 'Semua Cabang'],
        ['Nama Outlet', ':', search ? search : 'Semua Customer'],
        ['Faktur', ':', outstandingOnly ? 'Hanya yang outstanding' : 'Semua (termasuk lunas)'],
      ]
      info.forEach((line) => {
        const row = worksheet.addRow(line)
        row.getCell(1).font = { bold: true }
      })
      worksheet.addRow([])

      // ---- Header tabel ----
      const headerRow = worksheet.addRow(COLUMNS.map((col) => col.label))
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F6389' } }
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
          left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
          bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
          right: { style: 'thin', color: { argb: 'FFFFFFFF' } },
        }
      })
      headerRow.height = 30

      // ---- Data ----
      allData.forEach((row) => {
        const excelRow = worksheet.addRow(
          COLUMNS.reduce((acc, col) => {
            const value = row[col.key]
            if (col.type === 'money') acc[col.key] = value == null ? null : Number(value)
            else if (col.type === 'int') acc[col.key] = value == null ? null : Number(value)
            else if (col.type === 'date') acc[col.key] = value ? formatTanggalISO(value) : null
            else acc[col.key] = value ?? null
            return acc
          }, {}),
        )
        // Kolom riwayat kunjungan berisi banyak baris (dipisah newline) - biar kebaca di Excel
        COLUMNS.forEach((col, idx) => {
          if (col.type === 'multiline') {
            excelRow.getCell(idx + 1).alignment = { wrapText: true, vertical: 'top' }
          }
        })
      })

      // ---- Baris total ----
      const totals = result.summary || {}
      const totalRow = worksheet.addRow(
        COLUMNS.reduce((acc, col, idx) => {
          if (idx === 0) acc[col.key] = 'TOTAL'
          else if (col.sum) acc[col.key] = Number(totals[col.key] || 0)
          return acc
        }, {}),
      )
      totalRow.font = { bold: true }
      totalRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEDF2F7' } }
      })

      worksheet.views = [{ state: 'frozen', xSplit: 5, ySplit: headerRow.number }]

      const buffer = await workbook.xlsx.writeBuffer()
      saveAs(new Blob([buffer]), `Aging AR & Collection per ${tglAkhir}.xlsx`)
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
              <span>Aging AR &amp; Collection</span>
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

              <div className="d-flex justify-content-between align-items-center gap-3 mb-2">
                <div className="small text-muted">
                  Posisi piutang dihitung per {formatTanggal(tglAkhir)}. Kolom Pelunasan, Pelunasan
                  SSP, dan Sisa Piutang JT Bln Sebelumnya mengacu ke {formatTanggal(tglAwal)}.
                </div>
                <CFormSwitch
                  id="outstandingOnly"
                  className="flex-shrink-0 mb-0"
                  label="Hanya faktur outstanding"
                  checked={outstandingOnly}
                  onChange={handleOutstandingOnlyChange}
                />
              </div>

              <div className="table-responsive">
                <CTable hover striped bordered small>
                  <CTableHead>
                    <CTableRow className="text-center align-middle">
                      <CTableHeaderCell scope="col">No</CTableHeaderCell>
                      {COLUMNS.map((col) => (
                        <CTableHeaderCell
                          key={col.key}
                          scope="col"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {col.label}
                        </CTableHeaderCell>
                      ))}
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {loading && (
                      <CTableRow>
                        <CTableDataCell colSpan={COLUMNS.length + 1} className="text-center py-4">
                          Memuat data...
                        </CTableDataCell>
                      </CTableRow>
                    )}

                    {!loading && data.length === 0 && (
                      <CTableRow>
                        <CTableDataCell colSpan={COLUMNS.length + 1} className="text-center py-4">
                          Tidak ada data
                        </CTableDataCell>
                      </CTableRow>
                    )}

                    {!loading &&
                      data.map((item, idx) => (
                        <CTableRow key={`${item.NoFaktur}-${idx}`}>
                          <CTableDataCell className="text-center">
                            {idx + 1 + (page - 1) * perPage}
                          </CTableDataCell>
                          {COLUMNS.map((col) => (
                            <CTableDataCell
                              key={col.key}
                              className={
                                isNumeric(col.type)
                                  ? 'text-end'
                                  : col.type === 'date'
                                    ? 'text-center'
                                    : undefined
                              }
                              style={
                                col.type === 'multiline'
                                  ? { whiteSpace: 'pre-line' }
                                  : { whiteSpace: 'nowrap' }
                              }
                            >
                              {cellText(col, item)}
                            </CTableDataCell>
                          ))}
                        </CTableRow>
                      ))}
                  </CTableBody>

                  {summary && (
                    <CTableFoot>
                      <CTableRow className="fw-bold">
                        <CTableDataCell className="text-center">-</CTableDataCell>
                        {COLUMNS.map((col, idx) => (
                          <CTableDataCell
                            key={col.key}
                            className={col.sum ? 'text-end' : undefined}
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            {idx === 0 ? 'TOTAL' : col.sum ? formatThousand(summary[col.key]) : ''}
                          </CTableDataCell>
                        ))}
                      </CTableRow>
                    </CTableFoot>
                  )}
                </CTable>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  <Pagination page={page} totalPages={totalPages} setPage={handlePageChange} />
                </div>
                <div className="text-muted small">Total {totalRows} faktur</div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default AgingARCollection
