import { useEffect, useState, useCallback, useRef } from 'react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
import { cilPrint, cilSpreadsheet } from '@coreui/icons'
import { useReactToPrint } from 'react-to-print'
import Pagination from '../../components/Pagination'
import { formatRupiah } from '../../utils/Number'
import {
  formatDateToDDMMYYYY,
  getCurrentDateTimeFormatted,
  getFirstDayOfMonthFormatted,
  getLastDayOfMonthFormatted,
} from '../../utils/Date'
import CabangSelector from '../modals/CabangSelector'
import DatePicker from '../base/datepicker/DatePicker'
import SalesInvoicePrint, { PEMBULATAN, SALES_INVOICE_PAGE_STYLE } from './SalesInvoicePrint'

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const EXPORT_COLUMNS = [
  { key: 'NoBukti', header: 'No Faktur', width: 22 },
  { key: 'TglFaktur', header: 'Tgl Faktur', width: 12 },
  { key: 'TglJthtmp', header: 'Tgl Jatuh Tempo', width: 15 },
  { key: 'NamaDept', header: 'Cabang', width: 18 },
  { key: 'KodeLgn', header: 'Kode Customer', width: 14 },
  { key: 'NamaLgn', header: 'Nama Customer', width: 35 },
  { key: 'NamaSales', header: 'Salesman', width: 25 },
  { key: 'PoLanggan', header: 'No PO', width: 25 },
  { key: 'NoFakturP', header: 'No Faktur Pajak', width: 20 },
  { key: 'TglFakturP', header: 'Tgl Faktur Pajak', width: 15 },
  { key: 'TypeTrn', header: 'Tipe', width: 8 },
  { key: 'NoFjDulu', header: 'No Faktur Asal', width: 22 },
  { key: 'Dpp', header: 'DPP', width: 16, numeric: true },
  { key: 'PPN', header: 'PPN', width: 16, numeric: true },
  { key: 'GrandTotal', header: 'Grand Total', width: 16, numeric: true },
  { key: 'Keterangan', header: 'Keterangan', width: 30 },
]

const SalesInvoice = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [totalRows, setTotalRows] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const [selectedCabang, setSelectedCabang] = useState([])
  const [startDate, setStartDate] = useState(getFirstDayOfMonthFormatted())
  const [endDate, setEndDate] = useState(getLastDayOfMonthFormatted())

  const userData = JSON.parse(localStorage.getItem('user'))

  const printRef = useRef(null)
  const printPending = useRef(false)
  const [printData, setPrintData] = useState(null)
  const [printingId, setPrintingId] = useState(null)
  const [pilihPembulatan, setPilihPembulatan] = useState(null)

  const triggerPrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: printData?.data?.header?.NoBukti?.replace(/\//g, '-') || 'Sales Invoice',
    pageStyle: SALES_INVOICE_PAGE_STYLE,
    onAfterPrint: () => setPrintData(null),
  })

  useEffect(() => {
    if (printData && printPending.current) {
      printPending.current = false
      triggerPrint()
    }
  }, [printData, triggerPrint])

  const printInvoice = async (item, pembulatan) => {
    setPilihPembulatan(null)
    setPrintingId(item.SalesInvoiceHeaderId)
    try {
      const year = (item.TglFaktur || '').slice(0, 4)
      const response = await axios.get(
        `${ENDPOINT_URL}tools/salesinvoice/${item.SalesInvoiceHeaderId}?year=${year}`,
      )
      printPending.current = true
      setPrintData({ data: response.data, pembulatan })
    } catch (err) {
      console.error('Error fetching sales invoice detail:', err)
      alert(err.response?.data?.error || 'Gagal memuat data cetak invoice')
    } finally {
      setPrintingId(null)
    }
  }

  const fetchSalesInvoice = useCallback(
    async (page, perPage, keyword, cabangIds, startDate, endDate) => {
      const params = new URLSearchParams()
      params.append('page', page)
      params.append('per_page', perPage)
      params.append('start_date', startDate)
      params.append('end_date', endDate)
      if (keyword) params.append('search', keyword)
      if (cabangIds.length > 0) params.append('cabang', cabangIds.join(','))

      const response = await axios.get(`${ENDPOINT_URL}tools/salesinvoice?${params.toString()}`)
      return { data: response.data.data, total: response.data.pagination.total }
    },
    [],
  )

  useEffect(() => {
    if (!startDate || !endDate) return

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const result = await fetchSalesInvoice(
          page,
          perPage,
          search,
          selectedCabang,
          startDate,
          endDate,
        )
        setData(result.data)
        setTotalRows(result.total)
      } catch (err) {
        console.error('Error fetching sales invoice:', err)
        setData([])
        setTotalRows(0)
        setError(err.response?.data?.error || 'Gagal memuat data sales invoice')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page, perPage, search, selectedCabang, startDate, endDate, fetchSalesInvoice])

  const totalPages = Math.max(1, Math.ceil(totalRows / perPage))

  const resetToFirstPage = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  const periodeText = () =>
    `Periode ${formatDateToDDMMYYYY(startDate)} s.d. ${formatDateToDDMMYYYY(endDate)}`

  const exportToExcel = async () => {
    document.body.style.cursor = 'wait'
    try {
      const { data: allData } = await fetchSalesInvoice(
        1,
        -1,
        search,
        selectedCabang,
        startDate,
        endDate,
      )

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Sales Invoice')
      const lastCol = worksheet.getColumn(EXPORT_COLUMNS.length + 1).letter

      worksheet.mergeCells(`A2:${lastCol}2`)
      worksheet.getCell('A2').value = 'Daftar Sales Invoice'
      worksheet.getCell('A2').alignment = { horizontal: 'center' }
      worksheet.getCell('A2').font = { size: 16, bold: true }

      worksheet.mergeCells(`A3:${lastCol}3`)
      worksheet.getCell('A3').value = periodeText()
      worksheet.getCell('A3').alignment = { horizontal: 'center' }
      worksheet.getCell('A3').font = { size: 12, bold: true }

      worksheet.mergeCells(`A4:${lastCol}4`)
      worksheet.getCell('A4').value =
        `Exported at ${getCurrentDateTimeFormatted()} by ${userData?.UserName || '-'}`
      worksheet.getCell('A4').alignment = { horizontal: 'right' }
      worksheet.getCell('A4').font = { italic: true, size: 10 }

      worksheet.columns = [
        { key: 'no', width: 6 },
        ...EXPORT_COLUMNS.map(({ key, width }) => ({ key, width })),
      ]
      EXPORT_COLUMNS.filter((c) => c.numeric).forEach((c) => {
        worksheet.getColumn(c.key).numFmt = '#,##0.00'
      })

      const headerRow = worksheet.getRow(6)
      headerRow.values = ['No', ...EXPORT_COLUMNS.map((c) => c.header)]
      headerRow.font = { bold: true }

      allData.forEach((row, idx) => {
        const values = { no: idx + 1 }
        EXPORT_COLUMNS.forEach(({ key, numeric }) => {
          values[key] = numeric ? parseFloat(row[key] || 0) : row[key]
        })
        worksheet.addRow(values)
      })

      worksheet.views = [{ state: 'frozen', ySplit: 6 }]
      worksheet.autoFilter = { from: 'A6', to: `${lastCol}6` }

      const buffer = await workbook.xlsx.writeBuffer()
      saveAs(new Blob([buffer]), `Sales Invoice ${startDate} - ${endDate}.xlsx`)
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal mengunduh data!')
      console.error('Error exporting to Excel:', err)
    } finally {
      document.body.style.cursor = 'default'
    }
  }

  return (
    <CRow>
      <CCol xs>
        <CCard className="mb-4">
          <CCardHeader>
            Sales Invoice
            <CButton
              color="warning"
              size="sm"
              className="float-end"
              onClick={exportToExcel}
              disabled={!startDate || !endDate}
            >
              <CIcon icon={cilSpreadsheet} className="me-2" />
              Excel
            </CButton>
          </CCardHeader>
          <CCardBody>
            <div className="mb-3">
              <CRow className="g-2">
                <CCol xs={12} sm={2} className="d-grid">
                  <CabangSelector onSelect={resetToFirstPage(setSelectedCabang)} />
                </CCol>
                <CCol xs={12} sm={2}>
                  <DatePicker
                    onChange={resetToFirstPage(setStartDate)}
                    value={startDate}
                    placeholder="Tanggal awal"
                  />
                </CCol>
                <CCol xs={12} sm={2}>
                  <DatePicker
                    onChange={resetToFirstPage(setEndDate)}
                    value={endDate}
                    placeholder="Tanggal akhir"
                  />
                </CCol>
              </CRow>
            </div>
            <CRow className="g-1 mb-3">
              <CCol xs={1}>
                <CFormSelect
                  value={perPage}
                  onChange={(e) => resetToFirstPage(setPerPage)(parseInt(e.target.value, 10))}
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
                  placeholder="Cari no faktur, customer, no faktur pajak, atau no PO..."
                  value={search}
                  onChange={(e) => resetToFirstPage(setSearch)(e.target.value)}
                />
              </CCol>
            </CRow>

            {error && <CAlert color="danger">{error}</CAlert>}
            {(!startDate || !endDate) && (
              <CAlert color="info">Pilih tanggal awal dan tanggal akhir.</CAlert>
            )}

            <CTable hover striped bordered responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col" style={{ width: '1%' }}></CTableHeaderCell>
                  <CTableHeaderCell scope="col">No</CTableHeaderCell>
                  <CTableHeaderCell scope="col">No Faktur</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Tgl Faktur</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Jatuh Tempo</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Nama Cabang</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Kode Customer</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Nama Customer</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Salesman</CTableHeaderCell>
                  <CTableHeaderCell scope="col">No PO</CTableHeaderCell>
                  <CTableHeaderCell scope="col">No Faktur Pajak</CTableHeaderCell>
                  <CTableHeaderCell scope="col">DPP</CTableHeaderCell>
                  <CTableHeaderCell scope="col">PPN</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Grand Total</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {loading && (
                  <CTableRow>
                    <CTableDataCell colSpan={14} className="text-center">
                      Memuat data...
                    </CTableDataCell>
                  </CTableRow>
                )}
                {!loading && data.length === 0 && (
                  <CTableRow>
                    <CTableDataCell colSpan={14} className="text-center">
                      Tidak ada data
                    </CTableDataCell>
                  </CTableRow>
                )}
                {!loading &&
                  data.map((item, idx) => (
                    <CTableRow key={item.SalesInvoiceHeaderId}>
                      <CTableDataCell>
                        <CButton
                          color="primary"
                          variant="outline"
                          size="sm"
                          title={`Cetak ${item.NoBukti}`}
                          onClick={() => setPilihPembulatan(item)}
                          disabled={printingId !== null}
                        >
                          <CIcon icon={cilPrint} />
                        </CButton>
                      </CTableDataCell>
                      <CTableDataCell>{idx + 1 + (page - 1) * perPage}</CTableDataCell>
                      <CTableDataCell className="text-nowrap">{item.NoBukti}</CTableDataCell>
                      <CTableDataCell className="text-nowrap">
                        {formatDateToDDMMYYYY(item.TglFaktur || '')}
                      </CTableDataCell>
                      <CTableDataCell className="text-nowrap">
                        {formatDateToDDMMYYYY(item.TglJthtmp || '')}
                      </CTableDataCell>
                      <CTableDataCell>{item.NamaDept}</CTableDataCell>
                      <CTableDataCell>{item.KodeLgn}</CTableDataCell>
                      <CTableDataCell>{item.NamaLgn}</CTableDataCell>
                      <CTableDataCell>{item.NamaSales}</CTableDataCell>
                      <CTableDataCell>{item.PoLanggan}</CTableDataCell>
                      <CTableDataCell className="text-nowrap">{item.NoFakturP}</CTableDataCell>
                      <CTableDataCell className="text-end">{formatRupiah(item.Dpp)}</CTableDataCell>
                      <CTableDataCell className="text-end">{formatRupiah(item.PPN)}</CTableDataCell>
                      <CTableDataCell className="text-end">
                        {formatRupiah(item.GrandTotal)}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
              </CTableBody>
            </CTable>

            <div className="d-flex justify-content-between mt-3">
              <div>
                <Pagination page={page} totalPages={totalPages} setPage={setPage} />
              </div>
              <div className="text-body-secondary small">Total {totalRows} faktur</div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          {printData && (
            <SalesInvoicePrint data={printData.data} pembulatan={printData.pembulatan} />
          )}
        </div>
      </div>

      <CModal
        visible={!!pilihPembulatan}
        onClose={() => setPilihPembulatan(null)}
        alignment="center"
      >
        <CModalHeader>
          <CModalTitle>Cetak {pilihPembulatan?.NoBukti}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Pilih pembulatan DPP. DPP Lain, PPN, dan Jumlah Tagihan dihitung ulang dari DPP yang sudah
          dibulatkan.
          <ul className="mb-0 mt-2">
            <li>Ke atas: 100,10 menjadi 101,00</li>
            <li>Ke bawah: 100,10 menjadi 100,00 (100,50 tetap menjadi 101,00)</li>
          </ul>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="outline"
            onClick={() => printInvoice(pilihPembulatan, PEMBULATAN.BAWAH)}
          >
            Pembulatan ke Bawah
          </CButton>
          <CButton color="primary" onClick={() => printInvoice(pilihPembulatan, PEMBULATAN.ATAS)}>
            Pembulatan ke Atas
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default SalesInvoice
