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

const OutstandingSJ = () => {
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
    { name: 'Tanggal SJ', selector: (row) => row.TglSj, sortable: true, wrap: true },
    { name: 'No SJ', selector: (row) => row.NoSJ, sortable: true, wrap: true },
    { name: 'No SO', selector: (row) => row.NoSo, sortable: true, wrap: true },
    { name: 'No PO', selector: (row) => row.PoLanggan, sortable: true },
    { name: 'Nama Customer', selector: (row) => row.NamaLgn, sortable: true },
    { name: 'Nama Barang', selector: (row) => row.NamaBarang, sortable: true, wrap: true },
    { name: 'Satuan', selector: (row) => row.SatuanNs, sortable: true, wrap: true },
    { name: 'Qty Kirim', selector: (row) => row.Qty, sortable: true, wrap: true },
    { name: 'Harga', selector: (row) => row.Hna, sortable: true, wrap: true },
    { name: 'Total', selector: (row) => row.Total, sortable: true, wrap: true },
    { name: 'Salesman', selector: (row) => row.NamaSales, sortable: true, wrap: true },
  ]

  // ---- API call ----
  const fetchOutstandingSJ = useCallback(
    async (page, perPage, keyword = '', cabangIds = [], supplierIds = [], endDate = null) => {
      const params = new URLSearchParams()
      params.append('page', page)
      params.append('per_page', perPage)
      if (keyword) params.append('search', keyword)
      if (cabangIds.length > 0) params.append('cabang', cabangIds.join(','))
      if (supplierIds.length > 0) params.append('vendor', supplierIds.join(','))
      if (endDate) params.append('end_date', endDate)

      const response = await axios.get(`${ENDPOINT_URL}sales/outstandingsj?${params.toString()}`)
      return { data: response.data.data, total: response.data.pagination.total }
    },
    []
  )

  const loadDataOutstandingSJ = useCallback(
    async (page, perPage, keyword, cabangIds, supplierIds, endDate) => {
      setLoading(true)
      setPage(page)
      try {
        const fetchData = await fetchOutstandingSJ(page, perPage, keyword, cabangIds, supplierIds, endDate)
        setData(fetchData.data)
        setTotalRows(fetchData.total)
      } finally {
        setLoading(false)
      }
    },
    [fetchOutstandingSJ]
  )

  // ---- Load once on mount + when filters/search change ----
  useEffect(() => {
    loadDataOutstandingSJ(page, perPage, search, selectedCabang, selectedSupplier, endDate)
  }, [page, perPage, search, selectedCabang, selectedSupplier, endDate, loadDataOutstandingSJ])

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
      const response = await fetchOutstandingSJ(
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
      worksheet.mergeCells('A2:L2')
      worksheet.getCell('A2').value = 'Laporan Outstanding SJ'
      worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' }
      worksheet.getCell('A2').font = { size: 16, bold: true }
      worksheet.mergeCells('A3:L3')
      worksheet.getCell('A3').value = 'Periode per ' + formatDateToDDMMYYYY(endDate)
      worksheet.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' }
      worksheet.getCell('A3').font = { size: 16, bold: true }

      // Row 4: Export info
      worksheet.mergeCells('A4:L4')
      worksheet.getCell('A4').value =
        `Exported at ${getCurrentDateTimeFormatted()} by ${userData?.UserName || '-'}`
      worksheet.getCell('A4').alignment = { horizontal: 'right', vertical: 'middle' }
      worksheet.getCell('A4').font = { italic: true, size: 10 }
      worksheet.mergeCells('A5:L5')

      // Set column widths only (DO NOT use headers here!)
      worksheet.columns = [
        { key: 'no', width: 6 },
        { key: 'TglSj', width: 18 },
        { key: 'NoSJ', width: 10 },
        { key: 'NoSo', width: 15 },
        { key: 'PoLanggan', width: 15 },
        { key: 'NamaLgn', width: 15 },
        { key: 'NamaBarang', width: 15 },
        { key: 'SatuanNs', width: 15 },
        { key: 'Qty', width: 15 },
        { key: 'Hna', width: 15 },
        { key: 'Total', width: 15 },
        { key: 'NamaSales', width: 15 },
      ]

      const numberFormatThousand = '#,##0' // Format: 1,000
      const columnsToFormat = ['Qty', 'Hna', 'Total']
      columnsToFormat.forEach((key) => {
        const column = worksheet.getColumn(key)
        column.numFmt = numberFormatThousand
      })

      // Row 5: Write headers manually
      worksheet.addRow([
        'No',
        'TglSj',
        'NoSJ',
        'NoSo',
        'PoLanggan',
        'NamaLgn',
        'NamaBarang',
        'SatuanNs',
        'Qty',
        'Hna',
        'Total',
        'NamaSales',
      ])

      // Row 6+: Add data
      allData.forEach((row, idx) => {
        worksheet.addRow({
          no: idx + 1,
          ...row,
        })
      })

      // Calculate total rows added (header is row 5, so data starts from row 6)
      const totalRowNumber = worksheet.lastRow.number + 1

      // Add total label
      worksheet.mergeCells(`A${totalRowNumber}:H${totalRowNumber}`)
      worksheet.getCell(`A${totalRowNumber}`).value = 'TOTAL'
      worksheet.getCell(`A${totalRowNumber}`).alignment = {
        horizontal: 'center',
        vertical: 'middle',
      }
      worksheet.getCell(`A${totalRowNumber}`).font = { bold: true }

      // Add formula-based totals
      worksheet.getCell(`I${totalRowNumber}`).value = { formula: `SUM(I7:I${totalRowNumber - 1})` } // Qty
      worksheet.getCell(`K${totalRowNumber}`).value = { formula: `SUM(K7:K${totalRowNumber - 1})` } // Qty

      // Optional: bold all total row
      worksheet.getRow(totalRowNumber).font = { bold: true }

      // Optional: Freeze title and header
      worksheet.views = [{ state: 'frozen', ySplit: 6 }]

      worksheet.autoFilter = {
        from: 'A6',
        to: 'H6',
      }

      // Generate and save
      const buffer = await workbook.xlsx.writeBuffer()
      saveAs(
        new Blob([buffer]),
        'Laporan Outstanding SJ per ' + formatDateToDDMMYYYY(endDate) + '.xlsx',
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

      const response = await fetchOutstandingSJ(
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
        { text: 'Tgl SJ', bold: true, fillColor: '#f2f2f2', margin: [0, 5, 0, 5] },
        { text: 'No SJ', bold: true, fillColor: '#f2f2f2', margin: [0, 5, 0, 5] },
        { text: 'No SO', bold: true, fillColor: '#f2f2f2', margin: [0, 5, 0, 5] },
        { text: 'No PO', bold: true, fillColor: '#f2f2f2', margin: [0, 5, 0, 5] },
        { text: 'Nama Customer', bold: true, fillColor: '#f2f2f2', margin: [0, 5, 0, 5] },
        { text: 'Nama Barang', bold: true, fillColor: '#f2f2f2', margin: [0, 5, 0, 5] },
        { text: 'Satuan', bold: true, fillColor: '#f2f2f2', alignment: 'center', margin: [0, 5, 0, 5] },
        { text: 'Qty', bold: true, fillColor: '#f2f2f2', alignment: 'center', margin: [0, 5, 0, 5] },
        { text: 'HNA', bold: true, fillColor: '#f2f2f2', alignment: 'center', margin: [0, 5, 0, 5] },
        { text: 'Total', bold: true, fillColor: '#f2f2f2', alignment: 'center', margin: [0, 5, 0, 5] },
        { text: 'Salesman', bold: true, fillColor: '#f2f2f2', margin: [0, 5, 0, 5] },
      ];

      // Prepare table body
      const body = [
        headers,
        ...allData.map((row, idx) => [
          { text: idx + 1, alignment: 'center', margin: [0, 5, 0, 5] },
          { text: row.TglSj ?? '', margin: [0, 5, 0, 5] },
          { text: row.NoSJ ?? '', margin: [0, 5, 0, 5] },
          { text: row.NoSo ?? '', margin: [0, 5, 0, 5] },
          { text: row.PoLanggan ?? '', margin: [0, 5, 0, 5] },
          { text: row.NamaLgn ?? '', margin: [0, 5, 0, 5] },
          { text: row.NamaBarang ?? '', margin: [0, 5, 0, 5] },
          { text: row.SatuanNs ?? '', margin: [0, 5, 0, 5], alignment: 'center', },
          { text: parseFloat(row.Qty || 0).toFixed(2), alignment: 'right', margin: [0, 5, 0, 5] },
          { text: parseFloat(row.Hna || 0).toFixed(2), alignment: 'right', margin: [0, 5, 0, 5] },
          { text: parseFloat(row.Total || 0).toFixed(2), alignment: 'right', margin: [0, 5, 0, 5] },
          { text: row.NamaSales ?? '', margin: [0, 5, 0, 5] },
        ])
      ];

      const docDefinition = {
        content: [
          {
            text: 'Laporan Outstanding SJ',
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
        pageOrientation: 'landscape',
        pageSize: 'A3',
      };

      pdfMake.createPdf(docDefinition).download('Laporan Outstanding SJ per ' + formatDateToDDMMYYYY(endDate) + '.pdf');
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
            Laporan Daftar Barang
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
                <CCol xs={12} sm={2} className="d-grid">
                  <SupplierSelector onSelect={setSelectedSupplier} />
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
              title="Daftar Barang"
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

export default OutstandingSJ
