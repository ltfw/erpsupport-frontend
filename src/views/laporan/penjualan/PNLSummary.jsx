import { useEffect, useState, useCallback } from 'react'
import {
  CButton,
  CCol,
  CRow,
  CFormSelect,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import axios from 'axios'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import CIcon from '@coreui/icons-react'
import { cilSpreadsheet } from '@coreui/icons'
import { getCurrentDateTimeFormatted } from '../../../utils/Date'
import CabangSelector from '../../modals/CabangSelector'

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const SUMMARY_ROWS = [
  { key: 'Sales', label: 'Sales' },
  { key: 'Biaya', label: 'Biaya' },
  { key: 'PersenBiaya', label: '% Biaya', percent: true },
  { key: 'Laba', label: 'Laba' },
  { key: 'PersenLaba', label: '% Laba', percent: true },
]

const formatAmount = (num) => {
  if (num == null || Number(num) === 0) return '-'
  return Number(num).toLocaleString('en-US', { maximumFractionDigits: 0 })
}

const formatPercent = (num) => {
  if (num == null) return '-'
  return `${Number(num).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`
}

const PNLSummary = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [year, setYear] = useState(new Date().getFullYear())
  const [selectedCabangs, setSelectedCabangs] = useState([])

  const userData = JSON.parse(localStorage.getItem('user'))

  const loadSummary = useCallback(async (tahun, cabangs = []) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('tahun', tahun)
      if (cabangs && cabangs.length > 0) {
        params.append('cabang', cabangs.join(','))
      }
      const response = await axios.get(`${ENDPOINT_URL}pnl/summary?${params.toString()}`)
      setData(response.data.data)
    } catch (error) {
      console.error('Error loading PNL summary:', error)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSummary(year, selectedCabangs)
  }, [year, selectedCabangs, loadSummary])

  const generateYearOptions = () => {
    const years = []
    const now = new Date().getFullYear()
    for (let i = now - 5; i <= now + 1; i++) {
      years.push(i)
    }
    return years
  }

  const yearLabel = String(year).slice(-2)

  // kolom Total: jumlah 12 bulan, persentase dihitung ulang dari total Sales
  const sumOf = (key) => data.reduce((acc, d) => acc + (Number(d[key]) || 0), 0)
  const totalSales = sumOf('Sales')
  const totalBiaya = sumOf('Biaya')
  const totalLaba = sumOf('Laba')
  const total = {
    Sales: totalSales,
    Biaya: totalBiaya,
    PersenBiaya: totalSales === 0 ? null : (totalBiaya / totalSales) * 100,
    Laba: totalLaba,
    PersenLaba: totalSales === 0 ? null : (totalLaba / totalSales) * 100,
  }

  const exportToExcel = async () => {
    document.body.style.cursor = 'wait'
    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('PNL Summary')
      const lastCol = 'N' // Keterangan + 12 bulan + Total

      worksheet.mergeCells(`A2:${lastCol}2`)
      worksheet.getCell('A2').value = 'Summary Laporan PNL (Profit & Loss)'
      worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' }
      worksheet.getCell('A2').font = { size: 16, bold: true }

      worksheet.mergeCells(`A3:${lastCol}3`)
      const cabangLabel = selectedCabangs.length > 0 ? selectedCabangs.join(', ') : 'ALL'
      worksheet.getCell('A3').value = `Tahun: ${year} | Cabang: ${cabangLabel}`
      worksheet.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' }
      worksheet.getCell('A3').font = { size: 12, bold: true }

      worksheet.mergeCells(`A4:${lastCol}4`)
      worksheet.getCell('A4').value =
        `Exported at ${getCurrentDateTimeFormatted()} by ${userData?.UserName || '-'}`
      worksheet.getCell('A4').alignment = { horizontal: 'right', vertical: 'middle' }
      worksheet.getCell('A4').font = { italic: true, size: 10 }

      worksheet.columns = [{ width: 14 }, ...MONTHS.map(() => ({ width: 18 })), { width: 20 }]

      const border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }

      const headerRow = worksheet.getRow(6)
      headerRow.values = ['Keterangan', ...MONTHS.map((m) => `${yearLabel}-${m}`), 'Total']
      headerRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true }
        cell.border = border
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } }
        cell.alignment = { horizontal: colNumber === 1 ? 'left' : 'center' }
      })

      SUMMARY_ROWS.forEach((row, rowIdx) => {
        const values = [...MONTHS.map((m, idx) => data[idx]?.[row.key]), total[row.key]]
        const excelRow = worksheet.getRow(7 + rowIdx)
        excelRow.values = [
          row.label,
          // persen disimpan sebagai pecahan agar format % Excel benar
          ...values.map((v) => (v == null ? null : row.percent ? Number(v) / 100 : Number(v))),
        ]
        excelRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.border = border
          if (colNumber === 1) {
            cell.font = { bold: true }
            return
          }
          cell.numFmt = row.percent ? '0.00%;[Red]-0.00%' : '#,##0;[Red]-#,##0'
          cell.alignment = { horizontal: 'right' }
          if (colNumber === MONTHS.length + 2) cell.font = { bold: true }
        })
      })

      worksheet.views = [{ state: 'frozen', xSplit: 1, ySplit: 6 }]

      const buffer = await workbook.xlsx.writeBuffer()
      saveAs(new Blob([buffer]), `Summary Laporan PNL ${year}.xlsx`)
    } catch (error) {
      alert('Gagal mengunduh data!')
      console.error('Error exporting PNL summary to Excel:', error)
    } finally {
      document.body.style.cursor = 'default'
    }
  }

  return (
    <>
      <div className="mb-3">
        <CRow>
          <CCol xs={12} sm={2}>
            <label className="form-label">Cabang</label>
            <div>
              <CabangSelector
                fullWidth
                onSelect={(items) => setSelectedCabangs(items)}
                selectedItems={selectedCabangs}
              />
            </div>
          </CCol>
          <CCol xs={12} sm={3}>
            <label className="form-label">Year</label>
            <CFormSelect value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
              {generateYearOptions().map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol
            xs={12}
            sm={7}
            className="d-flex align-items-end justify-content-sm-end mt-2 mt-sm-0"
          >
            <CButton color="warning" size="sm" onClick={exportToExcel} disabled={loading}>
              <CIcon icon={cilSpreadsheet} className="me-2" />
              Export Excel
            </CButton>
          </CCol>
        </CRow>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <CSpinner />
        </div>
      ) : (
        <CTable bordered small responsive hover className="mb-0">
          <CTableHead color="light">
            <CTableRow>
              <CTableHeaderCell className="text-nowrap">Keterangan</CTableHeaderCell>
              {MONTHS.map((m) => (
                <CTableHeaderCell key={m} className="text-end text-nowrap">
                  {`${yearLabel}-${m}`}
                </CTableHeaderCell>
              ))}
              <CTableHeaderCell className="text-end text-nowrap">Total</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {SUMMARY_ROWS.map((row) => (
              <CTableRow key={row.key}>
                <CTableHeaderCell className="text-nowrap">{row.label}</CTableHeaderCell>
                {MONTHS.map((m, idx) => {
                  const value = data[idx]?.[row.key]
                  return (
                    <CTableDataCell
                      key={m}
                      className={`text-end text-nowrap${Number(value) < 0 ? ' text-danger' : ''}`}
                    >
                      {row.percent ? formatPercent(value) : formatAmount(value)}
                    </CTableDataCell>
                  )
                })}
                <CTableDataCell
                  className={`text-end text-nowrap fw-bold${Number(total[row.key]) < 0 ? ' text-danger' : ''}`}
                >
                  {row.percent ? formatPercent(total[row.key]) : formatAmount(total[row.key])}
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      )}
    </>
  )
}

export default PNLSummary
