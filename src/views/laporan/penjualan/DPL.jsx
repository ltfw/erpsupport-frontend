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
import { useNavigate } from 'react-router-dom'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { DataTable } from 'src/components'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPrint, cilSpreadsheet, cilTrash } from '@coreui/icons'
import {
  formatDateToDDMMYYYY,
  getCurrentDateFormatted,
  getCurrentDateTimeFormatted,
} from '../../../utils/Date'
import CabangSelector from '../../modals/CabangSelector'
import DatePicker from '../../base/datepicker/DatePicker'

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const DPL = () => {
  const formatThousand = (num) => {
    if (num == null || isNaN(num)) return ''
    return Number(num).toLocaleString('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const [selectedCabang, setSelectedCabang] = useState([])
  const [discountFilter, setDiscountFilter] = useState('All')
  const [startDate, setStartDate] = useState(`${new Date().getFullYear()}-01-01`)
  const [endDate, setEndDate] = useState(`${new Date().getFullYear()}-12-31`)

  const userData = JSON.parse(localStorage.getItem('user'))

  const column = [
    {
      name: 'No',
      selector: (row, index) => (page - 1) * perPage + index + 1,
      sortable: true,
      width: '5%',
    },
    { name: 'NamaDept', selector: (row) => row.NamaDept, sortable: true, wrap: true },
    { name: 'PromotionName', selector: (row) => row.PromotionName, sortable: true, wrap: true },
    { name: 'StartDate', selector: (row) => row.StartDate, sortable: true, wrap: true },
    { name: 'EndDate', selector: (row) => row.EndDate, sortable: true, wrap: true },
    { name: 'KodeLgn', selector: (row) => row.KodeLgn, sortable: true, wrap: true },
    { name: 'NamaLgn', selector: (row) => row.NamaLgn, sortable: true, wrap: true },
  ]

  // ---- API call ----
  const fetchDPL = useCallback(
    async (
      page,
      perPage,
      keyword = '',
      cabangIds = [],
      discountStatus = 'All',
      startDate = null,
      endDate = null,
    ) => {
      const params = new URLSearchParams()
      params.append('page', page)
      params.append('per_page', perPage)
      if (keyword) params.append('search', keyword)
      if (cabangIds.length > 0) params.append('cabang', cabangIds.join(','))
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)

      const response = await axios.get(`${ENDPOINT_URL}sales/dpl?${params.toString()}`)
      return { data: response.data.data, total: response.data.pagination.total }
    },
    [],
  )

  const loadDataDPL = useCallback(
    async (page, perPage, keyword, cabangIds, discountStatus, startDate, endDate) => {
      setLoading(true)
      setPage(page)
      try {
        const fetchData = await fetchDPL(
          page,
          perPage,
          keyword,
          cabangIds,
          discountStatus,
          startDate,
          endDate,
        )
        setData(fetchData.data)
        setTotalRows(fetchData.total)
      } finally {
        setLoading(false)
      }
    },
    [fetchDPL],
  )

  // ---- Load once on mount + when filters/search change ----
  useEffect(() => {
    loadDataDPL(page, perPage, search, selectedCabang, discountFilter, startDate, endDate)
  }, [page, perPage, search, selectedCabang, discountFilter, startDate, endDate, loadDataDPL])

  // ---- Handlers ----
  const handlePageChange = (newPage) => {
    setPage(newPage)
  }

  const handlePerRowsChange = (newPerPage, newPage) => {
    setPerPage(newPerPage)
    setPage(newPage)
  }

  // ---- Search ----
  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const exportToExcel = async () => {
    document.body.style.cursor = 'wait'
    try {
      const response = await fetchDPL(
        1,
        -1,
        search,
        selectedCabang,
        discountFilter,
        startDate,
        endDate,
      )
      const allData = response.data

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('DPL')

      // Row 2: Title
      worksheet.mergeCells('A2:G2')
      worksheet.getCell('A2').value = 'Laporan DPL'
      worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' }
      worksheet.getCell('A2').font = { size: 16, bold: true }
      worksheet.mergeCells('A3:G3')
      worksheet.getCell('A3').value =
        'Periode ' + formatDateToDDMMYYYY(startDate) + ' s/d ' + formatDateToDDMMYYYY(endDate)
      worksheet.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' }
      worksheet.getCell('A3').font = { size: 16, bold: true }

      // Row 4: Export info
      worksheet.mergeCells('A4:G4')
      worksheet.getCell('A4').value =
        `Exported at ${getCurrentDateTimeFormatted()} by ${userData?.UserName || '-'}`
      worksheet.getCell('A4').alignment = { horizontal: 'right', vertical: 'middle' }
      worksheet.getCell('A4').font = { italic: true, size: 10 }
      worksheet.mergeCells('A5:G5')

      // Set column widths
      worksheet.columns = [
        { key: 'no', width: 6 },
        { key: 'NamaDept', width: 12 },
        { key: 'PromotionName', width: 15 },
        { key: 'StartDate', width: 12 },
        { key: 'EndDate', width: 12 },
        { key: 'KodeLgn', width: 10 },
        { key: 'NamaLgn', width: 12 },
      ]

      // Row 5: Write headers manually
      worksheet.addRow([
        'No',
        'NamaDept',
        'PromotionName',
        'StartDate',
        'EndDate',
        'KodeLgn',
        'NamaLgn',
      ])

      // Row 6+: Add data
      allData.forEach((row, idx) => {
        worksheet.addRow({
          no: idx + 1,
          ...row,
        })
      })

      // Freeze title and header
      worksheet.views = [{ state: 'frozen', ySplit: 6 }]

      worksheet.autoFilter = {
        from: 'A6',
        to: 'G6',
      }

      // Generate and save
      const buffer = await workbook.xlsx.writeBuffer()
      saveAs(
        new Blob([buffer]),
        'Laporan DPL ' +
          formatDateToDDMMYYYY(startDate) +
          ' s.d ' +
          formatDateToDDMMYYYY(endDate) +
          '.xlsx',
      )
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

      const response = await fetchDPL(
        1,
        -1,
        search,
        selectedCabang,
        discountFilter,
        startDate,
        endDate,
      )

      const allData = response.data

      // Define columns
      const headers = [
        { text: 'No', bold: true, fillColor: '#f2f2f2', alignment: 'center', margin: [0, 5, 0, 5] },
        { text: 'NamaDept', bold: true, fillColor: '#f2f2f2', margin: [0, 5, 0, 5] },
        { text: 'PromotionName', bold: true, fillColor: '#f2f2f2', margin: [0, 5, 0, 5] },
        { text: 'StartDate', bold: true, fillColor: '#f2f2f2', margin: [0, 5, 0, 5] },
        { text: 'EndDate', bold: true, fillColor: '#f2f2f2', margin: [0, 5, 0, 5] },
        { text: 'KodeLgn', bold: true, fillColor: '#f2f2f2', margin: [0, 5, 0, 5] },
        { text: 'NamaLgn', bold: true, fillColor: '#f2f2f2', margin: [0, 5, 0, 5] },
      ]

      // Prepare table body
      const grandTotalDiscountPrinciple = allData.reduce(
        (sum, row) => sum + (parseFloat(row.DiscountPrinciple) || 0),
        0,
      )
      const grandTotalDiscountDistributor = allData.reduce(
        (sum, row) => sum + (parseFloat(row.DiscountDistributor) || 0),
        0,
      )
      const grandTotalSupportDiscount = allData.reduce(
        (sum, row) => sum + (parseFloat(row.SupportDiscount) || 0),
        0,
      )

      const body = [
        headers,
        ...allData.map((row, idx) => [
          { text: idx + 1, alignment: 'center', margin: [0, 5, 0, 5] },
          { text: row.NamaDept ?? '', margin: [0, 5, 0, 5] },
          { text: row.PromotionName ?? '', margin: [0, 5, 0, 5] },
          { text: row.StartDate ?? '', margin: [0, 5, 0, 5] },
          { text: row.EndDate ?? '', margin: [0, 5, 0, 5] },
          { text: row.KodeLgn ?? '', margin: [0, 5, 0, 5] },
          { text: row.NamaLgn ?? '', margin: [0, 5, 0, 5] },
        ]),
      ]

      const docDefinition = {
        content: [
          {
            text: 'Laporan DPL',
            style: 'header',
            alignment: 'center',
          },
          {
            text: `Periode ${formatDateToDDMMYYYY(startDate)} s/d ${formatDateToDDMMYYYY(endDate)}`,
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

      pdfMake
        .createPdf(docDefinition)
        .download(
          'Laporan DPL ' +
            formatDateToDDMMYYYY(startDate) +
            ' s.d ' +
            formatDateToDDMMYYYY(endDate) +
            '.pdf',
        )
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
            Laporan DPL
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
                  Pdf
                </CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </CCardHeader>
          <CCardBody>
            <div className="mb-3">
              <CRow>
                <CCol xs={12} sm={2} className="d-grid">
                  <CabangSelector onSelect={setSelectedCabang} />
                </CCol>
                <CCol xs={12} sm={2}>
                  <DatePicker onChange={setStartDate} value={startDate} />
                </CCol>
                <CCol xs={12} sm={2}>
                  <DatePicker onChange={setEndDate} value={endDate} />
                </CCol>
              </CRow>
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or code"
                value={search}
                onChange={handleSearchChange}
              />
            </div>

            <DataTable
              dense
              title="Daftar DPL"
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

export default DPL
