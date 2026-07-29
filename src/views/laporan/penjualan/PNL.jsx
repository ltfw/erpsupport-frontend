import { useEffect, useState, useCallback } from 'react'
import pdfMake from 'pdfmake/build/pdfmake'
import 'pdfmake/build/vfs_fonts'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CRow,
  CFormSelect,
} from '@coreui/react'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { DataTable } from 'src/components'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
import { cilPrint, cilSpreadsheet } from '@coreui/icons'
import { getCurrentDateTimeFormatted } from '../../../utils/Date'
import CabangSelector from '../../modals/CabangSelector'

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const PNL = () => {
  const formatThousand = (num) => {
    if (num == null) return ''
    // nilai bertanda kurung (mis. KLAIM DISKON) dibiarkan apa adanya
    if (num.toString().startsWith('(')) return num
    if (isNaN(num)) return ''
    return Number(num).toLocaleString('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [perPage, setPerPage] = useState(30)
  const [page, setPage] = useState(1)

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [previousYear, setPreviousYear] = useState(new Date().getFullYear() - 1)
  const [selectedCabangs, setSelectedCabangs] = useState([])

  const userData = JSON.parse(localStorage.getItem('user'))

  const column = [
    {
      name: 'No',
      selector: (row, index) => (page - 1) * perPage + index + 1,
      sortable: true,
      width: '4%',
    },
    {
      name: 'Code',
      selector: (row) => row.KodeGl,
      sortable: true,
      wrap: true,
      width: '9%',
    },
    {
      name: 'Description',
      selector: (row) => row.NamaGl,
      sortable: true,
      wrap: true,
      width: '22%',
    },
    {
      name: `Year ${currentYear}`,
      selector: (row) => row.TahunIni,
      cell: (row) => {
        if (row.TahunIni && row.TahunIni.toString().startsWith('(')) return row.TahunIni;
        return parseFloat(row.TahunIni).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      },
      sortable: true,
      width: '12%',
      right: true,
    },
    {
      name: `Year ${previousYear}`,
      selector: (row) => row.TahunLalu,
      cell: (row) => {
        if (row.TahunLalu && row.TahunLalu.toString().startsWith('(')) return row.TahunLalu;
        return parseFloat(row.TahunLalu).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      },
      sortable: true,
      width: '12%',
      right: true,
    },
    {
      name: 'Growth %',
      selector: (row) => row.Growth ?? '-',
      sortable: true,
      width: '8%',
      right: true,
    },
    {
      name: `YTD ${currentYear}`,
      selector: (row) => row.Ytd,
      cell: (row) => {
        if (row.Ytd && row.Ytd.toString().startsWith('(')) return row.Ytd
        return parseFloat(row.Ytd).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      },
      sortable: true,
      width: '12%',
      right: true,
    },
    {
      name: `YTD ${previousYear}`,
      selector: (row) => row.YtdLalu,
      cell: (row) => {
        if (row.YtdLalu && row.YtdLalu.toString().startsWith('(')) return row.YtdLalu
        return parseFloat(row.YtdLalu).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      },
      sortable: true,
      width: '12%',
      right: true,
    },
    {
      name: 'YTD Growth %',
      selector: (row) => row.GrowthYtd ?? '-',
      sortable: true,
      width: '8%',
      right: true,
    },
  ]

  // ---- API call ----
  const fetchPNL = useCallback(async (page, perPage, month, yearNow, yearPrev, cabangs = []) => {
    const params = new URLSearchParams()
    params.append('page', page)
    params.append('per_page', perPage)
    params.append('bulan', month)
    params.append('tahun_now', yearNow)
    params.append('tahun_prev', yearPrev)
    if (cabangs && cabangs.length > 0) {
      params.append('cabang', cabangs.join(','))
    }

    const response = await axios.get(`${ENDPOINT_URL}pnl/report?${params.toString()}`)
    return {
      data: response.data.data,
      total: response.data.pagination.total,
    }
  }, [])

  const loadDataPNL = useCallback(
    async (page, perPage, month, yearNow, yearPrev, cabangs = []) => {
      setLoading(true)
      setPage(page)
      try {
        const fetchData = await fetchPNL(page, perPage, month, yearNow, yearPrev, cabangs)
        setData(fetchData.data)
        setTotalRows(fetchData.total)
      } catch (error) {
        console.error('Error loading PNL data:', error)
        setData([])
        setTotalRows(0)
      } finally {
        setLoading(false)
      }
    },
    [fetchPNL],
  )

  // ---- Load once on mount + when filters change ----
  useEffect(() => {
    loadDataPNL(page, perPage, currentMonth, currentYear, previousYear, selectedCabangs)
  }, [page, perPage, currentMonth, currentYear, previousYear, selectedCabangs, loadDataPNL])

  // ---- Handlers ----
  const handlePageChange = (newPage) => {
    setPage(newPage)
  }

  const handlePerRowsChange = (newPerPage, newPage) => {
    setPerPage(newPerPage)
    setPage(newPage)
  }

  const handleMonthChange = (e) => {
    setCurrentMonth(parseInt(e.target.value))
    setPage(1)
  }

  const handleCurrentYearChange = (e) => {
    const newYear = parseInt(e.target.value)
    setCurrentYear(newYear)
    setPage(1)
  }

  const handlePreviousYearChange = (e) => {
    setPreviousYear(parseInt(e.target.value))
    setPage(1)
  }

  const generateYearOptions = () => {
    const years = []
    const now = new Date().getFullYear()
    for (let i = now - 5; i <= now + 1; i++) {
      years.push(i)
    }
    return years
  }

  const generateMonthOptions = () => {
    const months = [
      { value: 1, label: 'January' },
      { value: 2, label: 'February' },
      { value: 3, label: 'March' },
      { value: 4, label: 'April' },
      { value: 5, label: 'May' },
      { value: 6, label: 'June' },
      { value: 7, label: 'July' },
      { value: 8, label: 'August' },
      { value: 9, label: 'September' },
      { value: 10, label: 'October' },
      { value: 11, label: 'November' },
      { value: 12, label: 'December' },
    ]
    return months
  }

  const exportToExcel = async () => {
    document.body.style.cursor = 'wait'
    try {
      const response = await fetchPNL(1, -1, currentMonth, currentYear, previousYear, selectedCabangs)
      const allData = response.data

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('PNL Report')

      // Row 2: Title
      worksheet.mergeCells('A2:I2')
      worksheet.getCell('A2').value = 'Laporan PNL (Profit & Loss)'
      worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' }
      worksheet.getCell('A2').font = { size: 16, bold: true }

      worksheet.mergeCells('A3:I3')
      const monthName = generateMonthOptions().find((m) => m.value === currentMonth)?.label || ''
      worksheet.getCell('A3').value =
        `Bulan: ${monthName} | Tahun Ini: ${currentYear} | Tahun Lalu: ${previousYear}`
      worksheet.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' }
      worksheet.getCell('A3').font = { size: 12, bold: true }

      // Row 4: Export info
      worksheet.mergeCells('A4:I4')
      worksheet.getCell('A4').value =
        `Exported at ${getCurrentDateTimeFormatted()} by ${userData?.UserName || '-'}`
      worksheet.getCell('A4').alignment = { horizontal: 'right', vertical: 'middle' }
      worksheet.getCell('A4').font = { italic: true, size: 10 }
      worksheet.mergeCells('A5:I5')

      // Set column widths
      worksheet.columns = [
        { key: 'no', width: 6 },
        { key: 'KodeGl', width: 12 },
        { key: 'NamaGl', width: 35 },
        { key: 'TahunIni', width: 15, style: { numFmt: '#,##0.00' } },
        { key: 'TahunLalu', width: 15, style: { numFmt: '#,##0.00' } },
        { key: 'Growth', width: 12 },
        { key: 'Ytd', width: 18, style: { numFmt: '#,##0.00' } },
        { key: 'YtdLalu', width: 18, style: { numFmt: '#,##0.00' } },
        { key: 'GrowthYtd', width: 14 },
      ]

      // Row 5: Write headers manually
      worksheet.addRow([
        'No',
        'Code',
        'Description',
        `Year ${currentYear}`,
        `Year ${previousYear}`,
        'Growth %',
        `YTD ${currentYear}`,
        `YTD ${previousYear}`,
        'YTD Growth %',
      ])

      // Row 6+: Add data
      allData.forEach((row, idx) => {
        worksheet.addRow({
          no: idx + 1,
          KodeGl: row.KodeGl,
          NamaGl: row.NamaGl,
          TahunIni: row.TahunIni,
          TahunLalu: row.TahunLalu,
          Growth: row.Growth,
          Ytd: row.Ytd,
          YtdLalu: row.YtdLalu,
          GrowthYtd: row.GrowthYtd,
        })
      })

      // Freeze title and header
      worksheet.views = [{ state: 'frozen', ySplit: 6 }]

      worksheet.autoFilter = {
        from: 'A6',
        to: 'I6',
      }

      // Generate and save
      const buffer = await workbook.xlsx.writeBuffer()
      saveAs(new Blob([buffer]), `Laporan PNL ${monthName} ${currentYear}.xlsx`)
    } catch (error) {
      alert('Gagal mengunduh data!')
      console.error('Error exporting to Excel:', error)
    } finally {
      document.body.style.cursor = 'default'
    }
  }

  const exportToPDF = async () => {
    try {
      document.body.style.cursor = 'wait'

      const response = await fetchPNL(1, -1, currentMonth, currentYear, previousYear, selectedCabangs)
      const allData = response.data

      // Define columns
      const headers = [
        { text: 'No', bold: true, fillColor: '#f2f2f2', alignment: 'center', margin: [0, 5, 0, 5] },
        { text: 'Code', bold: true, fillColor: '#f2f2f2', margin: [0, 5, 0, 5] },
        { text: 'Description', bold: true, fillColor: '#f2f2f2', margin: [0, 5, 0, 5] },
        {
          text: `Year ${currentYear}`,
          bold: true,
          fillColor: '#f2f2f2',
          alignment: 'right',
          margin: [0, 5, 0, 5],
        },
        {
          text: `Year ${previousYear}`,
          bold: true,
          fillColor: '#f2f2f2',
          alignment: 'right',
          margin: [0, 5, 0, 5],
        },
        {
          text: 'Growth %',
          bold: true,
          fillColor: '#f2f2f2',
          alignment: 'right',
          margin: [0, 5, 0, 5],
        },
        {
          text: `YTD ${currentYear}`,
          bold: true,
          fillColor: '#f2f2f2',
          alignment: 'right',
          margin: [0, 5, 0, 5],
        },
        {
          text: `YTD ${previousYear}`,
          bold: true,
          fillColor: '#f2f2f2',
          alignment: 'right',
          margin: [0, 5, 0, 5],
        },
        {
          text: 'YTD Growth %',
          bold: true,
          fillColor: '#f2f2f2',
          alignment: 'right',
          margin: [0, 5, 0, 5],
        },
      ]

      // Prepare table body
      const body = [
        headers,
        ...allData.map((row, idx) => [
          { text: idx + 1, alignment: 'center', margin: [0, 5, 0, 5] },
          { text: row.KodeGl ?? '', margin: [0, 5, 0, 5] },
          { text: row.NamaGl ?? '', margin: [0, 5, 0, 5] },
          { text: formatThousand(row.TahunIni), alignment: 'right', margin: [0, 5, 0, 5] },
          { text: formatThousand(row.TahunLalu), alignment: 'right', margin: [0, 5, 0, 5] },
          { text: row.Growth ?? '-', alignment: 'right', margin: [0, 5, 0, 5] },
          { text: formatThousand(row.Ytd), alignment: 'right', margin: [0, 5, 0, 5] },
          { text: formatThousand(row.YtdLalu), alignment: 'right', margin: [0, 5, 0, 5] },
          { text: row.GrowthYtd ?? '-', alignment: 'right', margin: [0, 5, 0, 5] },
        ]),
      ]

      const monthName = generateMonthOptions().find((m) => m.value === currentMonth)?.label || ''

      const docDefinition = {
        content: [
          {
            text: 'Laporan PNL (Profit & Loss)',
            style: 'header',
            alignment: 'center',
          },
          {
            text: `Bulan: ${monthName} | Tahun Ini: ${currentYear} | Tahun Lalu: ${previousYear}`,
            style: 'subheader',
            alignment: 'center',
            margin: [0, 0, 0, 10],
          },
          {
            text: `Printed at ${getCurrentDateTimeFormatted()} by ${userData?.UserName || '-'}`,
            style: 'printedInfo',
            alignment: 'right',
            margin: [0, 0, 0, 10],
            italics: true,
            fontSize: 8,
          },
          {
            columns: [
              { width: '*', text: '' },
              {
                width: 'auto',
                style: 'tableExample',
                table: {
                  headerRows: 1,
                  widths: 'auto',
                  body: body,
                },
                layout: {
                  fillColor: function (rowIndex, node, columnIndex) {
                    return rowIndex === 0 ? '#f2f2f2' : null
                  },
                  hLineWidth: function () {
                    return 1
                  },
                  vLineWidth: function () {
                    return 1
                  },
                  hLineColor: function () {
                    return '#000'
                  },
                  vLineColor: function () {
                    return '#000'
                  },
                  paddingLeft: function () {
                    return 4
                  },
                  paddingRight: function () {
                    return 4
                  },
                  paddingTop: function () {
                    return 4
                  },
                  paddingBottom: function () {
                    return 4
                  },
                },
              },
              { width: '*', text: '' },
            ],
          },
        ],
        styles: {
          header: {
            fontSize: 16,
            bold: true,
            margin: [0, 0, 0, 4],
          },
          subheader: {
            fontSize: 12,
            margin: [0, 0, 0, 10],
          },
          tableExample: {
            fontSize: 8,
          },
        },
        pageOrientation: 'landscape',
        pageSize: 'A4',
      }

      pdfMake.createPdf(docDefinition).download(`Laporan PNL ${monthName} ${currentYear}.pdf`)
    } catch (error) {
      alert('Gagal mengunduh PDF!')
      console.error('Error exporting to PDF:', error)
    } finally {
      document.body.style.cursor = 'default'
    }
  }

  return (
    <CRow>
      <CCol xs>
        <CCard className="mb-4">
          <CCardHeader>
            Laporan PNL (Profit & Loss)
            <CDropdown className="float-end">
              <CDropdownToggle color="warning" size="sm">
                Export
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem onClick={exportToExcel}>
                  <CIcon icon={cilSpreadsheet} className="me-2" />
                  Excel
                </CDropdownItem>
                <CDropdownItem onClick={exportToPDF}>
                  <CIcon icon={cilPrint} className="me-2" />
                  PDF
                </CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </CCardHeader>
          <CCardBody>
            <div className="mb-3">
              <CRow>
                <CCol xs={12} sm={2}>
                  <label className="form-label">Cabang</label>
                  <div>
                    <CabangSelector
                      fullWidth
                      onSelect={(items) => {
                        setSelectedCabangs(items)
                        setPage(1)
                      }}
                      selectedItems={selectedCabangs}
                    />
                  </div>
                </CCol>
                <CCol xs={12} sm={3}>
                  <label className="form-label">Month</label>
                  <CFormSelect value={currentMonth} onChange={handleMonthChange}>
                    {generateMonthOptions().map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol xs={12} sm={3}>
                  <label className="form-label">Year (Current)</label>
                  <CFormSelect value={currentYear} onChange={handleCurrentYearChange}>
                    {generateYearOptions().map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol xs={12} sm={3}>
                  <label className="form-label">Year (Previous)</label>
                  <CFormSelect value={previousYear} onChange={handlePreviousYearChange}>
                    {generateYearOptions().map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>
            </div>

            <DataTable
              dense
              title="PNL Report"
              columns={column}
              data={data}
              progressPending={loading}
              pagination
              paginationServer
              paginationTotalRows={totalRows}
              onChangeRowsPerPage={handlePerRowsChange}
              onChangePage={handlePageChange}
              button
            />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default PNL
