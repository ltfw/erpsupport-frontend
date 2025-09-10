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
import SupplierSelector from '../../modals/SupplierSelector'
import BarangSelector from '../../modals/BarangSelector'
import DatePicker from '../../base/datepicker/DatePicker'

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const OutstandingDT = () => {
  const formatThousand = (num) => {
    if (num == null || isNaN(num)) return ''
    return Number(num)
      .toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const [selectedCabang, setSelectedCabang] = useState([])
  const [selectedSupplier, setSelectedSupplier] = useState([])
  const [endDate, setEndDate] = useState(getCurrentDateFormatted())

  const userData = JSON.parse(localStorage.getItem('user'))

  const column = [
    {
      name: 'No',
      selector: (row, index) => (page - 1) * perPage + index + 1,
      sortable: true,
      width: '6%',
    },
    { name: 'NamaCabang', selector: (row) => row.NamaCabang, sortable: true, wrap: true },
    { name: 'NoTagih', selector: (row) => row.NoTagih, sortable: true, wrap: true },
    { name: 'TglTagih', selector: (row) => row.TglTagih, sortable: true, wrap: true },
    { name: 'Bulan', selector: (row) => row.Bulan, sortable: true },
    { name: 'NamaPenagih', selector: (row) => row.NamaPenagih, sortable: true },
    { name: 'NominalTotal', selector: (row) => row.NominalTotal, sortable: true, wrap: true, right: true, format: (row) => formatThousand((row.NominalTotal)) },
  ]

  // ---- API call ----
  const fetchOutstandingDT = useCallback(
    async (page, perPage, keyword = '', cabangIds = [], supplierIds = [], endDate = null) => {
      const params = new URLSearchParams()
      params.append('page', page)
      params.append('per_page', perPage)
      if (keyword) params.append('search', keyword)
      if (cabangIds.length > 0) params.append('cabang', cabangIds.join(','))
      if (supplierIds.length > 0) params.append('vendor', supplierIds.join(','))
      if (endDate) params.append('end_date', endDate)

      const response = await axios.get(`${ENDPOINT_URL}sales/outstandingdt?${params.toString()}`)
      return { data: response.data.data, total: response.data.pagination.total }
    },
    []
  )

  const loadDataOutstandingDT = useCallback(
    async (page, perPage, keyword, cabangIds, supplierIds, endDate) => {
      setLoading(true)
      setPage(page)
      try {
        const fetchData = await fetchOutstandingDT(page, perPage, keyword, cabangIds, supplierIds, endDate)
        setData(fetchData.data)
        setTotalRows(fetchData.total)
      } finally {
        setLoading(false)
      }
    },
    [fetchOutstandingDT]
  )

  // ---- Load once on mount + when filters/search change ----
  useEffect(() => {
    loadDataOutstandingDT(page, perPage, search, selectedCabang, selectedSupplier, endDate)
  }, [page, perPage, search, selectedCabang, selectedSupplier, endDate, loadDataOutstandingDT])

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
    setPage(1) // reset page when searching
  }

  const exportToExcel = async () => {
    document.body.style.cursor = 'wait'
    try {
      const response = await fetchOutstandingDT(
        1,
        -1,
        search,
        selectedCabang,
        selectedSupplier,
        endDate,
      )
      const allData = response.data.map(item => {
        if (item.KodeGudang === '03-GUU-02') {
          return { ...item, NamaGudang: 'Gudang Utama-TGR 2 (Gudang Buffer SAI)' }
        }
        return item
      })

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Sales')

      // Row 2: Title
      worksheet.mergeCells('A2:G2')
      worksheet.getCell('A2').value = 'Laporan Outstanding DT'
      worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' }
      worksheet.getCell('A2').font = { size: 16, bold: true }
      worksheet.mergeCells('A3:G3')
      worksheet.getCell('A3').value = 'Periode per ' + formatDateToDDMMYYYY(endDate)
      worksheet.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' }
      worksheet.getCell('A3').font = { size: 16, bold: true }

      // Row 4: Export info
      worksheet.mergeCells('A4:G4')
      worksheet.getCell('A4').value =
        `Exported at ${getCurrentDateTimeFormatted()} by ${userData?.UserName || '-'}`
      worksheet.getCell('A4').alignment = { horizontal: 'right', vertical: 'middle' }
      worksheet.getCell('A4').font = { italic: true, size: 10 }
      worksheet.mergeCells('A5:G5')

      // Set column widths only (DO NOT use headers here!)
      worksheet.columns = [
        { key: 'no', width: 6 },
        { key: 'NamaCabang', width: 18 },
        { key: 'NoTagih', width: 10 },
        { key: 'TglTagih', width: 15 },
        { key: 'Bulan', width: 15 },
        { key: 'NamaPenagih', width: 15 },
        { key: 'NominalTotal', width: 15 },
      ]

      // Set number format for NominalTotal column
      worksheet.getColumn('NominalTotal').numFmt = '#,##0.00'

      // Row 5: Write headers manually
      worksheet.addRow([
        'No',
        'NamaCabang',
        'NoTagih',
        'TglTagih',
        'Bulan',
        'NamaPenagih',
        'NominalTotal',
      ])

      // Row 6+: Add data
      allData.forEach((row, idx) => {
        worksheet.addRow({
          no: idx + 1,
          ...row,
          NominalTotal: parseFloat(row.NominalTotal || 0),
        })
      })

      // Calculate total rows added (header is row 5, so data starts from row 6)
      const totalRowNumber = worksheet.lastRow.number + 1

      // Add total label
      worksheet.mergeCells(`A${totalRowNumber}:F${totalRowNumber}`)
      worksheet.getCell(`A${totalRowNumber}`).value = 'TOTAL'
      worksheet.getCell(`A${totalRowNumber}`).alignment = {
        horizontal: 'center',
        vertical: 'middle',
      }
      worksheet.getCell(`A${totalRowNumber}`).font = { bold: true }

      // Add formula-based totals
      worksheet.getCell(`G${totalRowNumber}`).value = { formula: `SUM(G7:G${totalRowNumber - 1})` } // Nominal Total

      // Optional: bold all total row
      worksheet.getRow(totalRowNumber).font = { bold: true }

      // Optional: Freeze title and header
      worksheet.views = [{ state: 'frozen', ySplit: 6 }]

      worksheet.autoFilter = {
        from: 'A6',
        to: 'G6',
      }

      // Generate and save
      const buffer = await workbook.xlsx.writeBuffer()
      saveAs(
        new Blob([buffer]),
        'Laporan Outstanding DT per ' + formatDateToDDMMYYYY(endDate) + '.xlsx',
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
      document.body.style.cursor = 'wait';

      const response = await fetchOutstandingDT(
        1,
        -1,
        search,
        selectedCabang,
        selectedSupplier,
        endDate
      );

      const allData = response.data;

      // Define columns
      const headers = [
        { text: 'No', bold: true, fillColor: '#f2f2f2', alignment: 'center', margin: [0, 5, 0, 5] },
        { text: 'NamaCabang', bold: true, fillColor: '#f2f2f2', margin: [0, 5, 0, 5] },
        { text: 'NoTagih', bold: true, fillColor: '#f2f2f2', margin: [0, 5, 0, 5] },
        { text: 'TglTagih', bold: true, fillColor: '#f2f2f2', margin: [0, 5, 0, 5] },
        { text: 'Bulan', bold: true, fillColor: '#f2f2f2', margin: [0, 5, 0, 5] },
        { text: 'NamaPenagih', bold: true, fillColor: '#f2f2f2', margin: [0, 5, 0, 5] },
        { text: 'NominalTotal', bold: true, fillColor: '#f2f2f2', margin: [0, 5, 0, 5] },
      ];

      // Prepare table body
      // Calculate grand totals
      const grandTotalTotal = allData.reduce((sum, row) => sum + (parseFloat(row.NominalTotal) || 0), 0)

      const body = [
        headers,
        ...allData.map((row, idx) => [
          { text: idx + 1, alignment: 'center', margin: [0, 5, 0, 5] },
          { text: row.NamaCabang ?? '', margin: [0, 5, 0, 5] },
          { text: row.NoTagih ?? '', margin: [0, 5, 0, 5] },
          { text: row.TglTagih ?? '', margin: [0, 5, 0, 5] },
          { text: row.Bulan ?? '', margin: [0, 5, 0, 5] },
          { text: row.NamaPenagih ?? '', margin: [0, 5, 0, 5] },
          { text: formatThousand(row.NominalTotal) ?? '', alignment: 'right', margin: [0, 5, 0, 5] },
        ]),
        [
          { text: 'GRAND TOTAL', colSpan: 5, alignment: 'center', bold: true, margin: [0, 5, 0, 5] },
          ...Array(5).fill({}),
          { text: formatThousand(grandTotalTotal), alignment: 'right', bold: true, margin: [0, 5, 0, 5] },
        ]
      ];

      const docDefinition = {
        content: [
          {
            text: 'Laporan Outstanding DT',
            style: 'header',
            alignment: 'center'
          },
          {
            text: `Periode per ${formatDateToDDMMYYYY(endDate)}`,
            style: 'subheader',
            alignment: 'center',
            margin: [0, 0, 0, 10]
          },
          {
            text: `Printed at ${getCurrentDateTimeFormatted()} by ${userData?.UserName || '-'}`,
            style: 'printedInfo',
            alignment: 'right',
            margin: [0, 0, 0, 10],
            italics: true,
            fontSize: 8
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
                  body: body
                },
                layout: {
                  fillColor: function (rowIndex, node, columnIndex) {
                    return rowIndex === 0 ? '#f2f2f2' : null;
                  },
                  hLineWidth: function () { return 1 },
                  vLineWidth: function () { return 1 },
                  hLineColor: function () { return '#000' },
                  vLineColor: function () { return '#000' },
                  paddingLeft: function () { return 4 },
                  paddingRight: function () { return 4 },
                  paddingTop: function () { return 4 },
                  paddingBottom: function () { return 4 },
                }
              },
              { width: '*', text: '' },
            ],

          }
        ],
        styles: {
          header: {
            fontSize: 16,
            bold: true,
            margin: [0, 0, 0, 4]
          },
          subheader: {
            fontSize: 12,
            margin: [0, 0, 0, 10]
          },
          tableExample: {
            fontSize: 8,
          }
        },
        pageOrientation: 'portrait',
        pageSize: 'A4',
      };

      pdfMake.createPdf(docDefinition).download('Laporan Outstanding DT per ' + formatDateToDDMMYYYY(endDate) + '.pdf');
    } catch (error) {
      alert('Gagal mengunduh PDF!');
      console.error('Error exporting to PDF:', error);
    } finally {
      document.body.style.cursor = 'default';
    }
  }

  return (
    <CRow>
      <CCol xs>
        <CCard className="mb-4">
          <CCardHeader>
            Laporan Outstanding DT
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
                {/* <CCol xs={12} sm={2} className="d-grid">
                  <SupplierSelector onSelect={setSelectedSupplier} />
                </CCol> */}
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
              title="Daftar Outstanding SJ"
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

export default OutstandingDT
