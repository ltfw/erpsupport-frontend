import { useEffect, useState } from 'react'
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

const DaftarBarang = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const [selectedBarang, setSelectedBarang] = useState([])
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
    {
      name: 'Kode Gudang',
      selector: (row) => row.KodeGudang,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Nama Gudang',
      selector: (row) => row.NamaGudang,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Kode Barang',
      selector: (row) => row.KodeItem,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Nama Barang',
      selector: (row) => row.NamaBarang,
      sortable: true,
    },
    {
      name: 'UoM',
      selector: (row) => row.KodeSatuan,
      sortable: true,
    },
    {
      name: 'Qty',
      selector: (row) => row.SumQtyPhysical,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Keterangan',
      selector: (row) => row.Keterangan,
      sortable: true,
      wrap: true,
    },
  ]

  const loadDataDaftarBarang = async (
    page,
    perPage,
    keyword = '',
    cabangIds = [],
    supplierIds = [],
    barangIds = [],
    endDate = null,
  ) => {
    setLoading(true)
    setPage(page)
    const fetchData = await fetchDaftarBarang(
      page,
      perPage,
      keyword,
      cabangIds,
      supplierIds,
      barangIds,
      endDate,
    )
    setData(fetchData.data)
    setTotalRows(fetchData.total)
    setLoading(false)
  }

  const fetchDaftarBarang = async (
    page,
    perPage,
    keyword = '',
    cabangIds = [],
    supplierIds = [],
    barangIds = [],
    endDate = null,
  ) => {
    console.log(
      'fetchDaftarBarang called with page:',
      page,
      'keyword:',
      keyword,
      'cabangIds:',
      cabangIds,
      'supplierIds:',
      supplierIds,
      'barangIds:',
      barangIds,
      'endDate:',
      endDate,
    )
    const params = new URLSearchParams()
    params.append('page', page)
    params.append('per_page', perPage)
    if (keyword) params.append('search', keyword)
    if (cabangIds.length > 0) {
      params.append('cabang', cabangIds.join(',')) // or whatever your API expects
    }
    if (supplierIds.length > 0) {
      params.append('vendor', supplierIds.join(',')) // or whatever your API expects
    }
    if (barangIds.length > 0) {
      params.append('barang', barangIds.join(',')) // or whatever your API expects
    }
    if (endDate) {
      params.append('date', endDate)
    }

    const response = await axios.get(`${ENDPOINT_URL}report/daftarbarang?${params.toString()}`)

    return { data: response.data.data, total: response.data.pagination.total }
  }

  const handlePageChange = (page) => {
    loadDataDaftarBarang(
      page,
      perPage,
      search,
      selectedCabang,
      selectedSupplier,
      selectedBarang,
      endDate,
    )
  }

  const handlePerRowsChange = async (newPerPage, page) => {
    setPerPage(newPerPage)
    loadDataDaftarBarang(
      page,
      newPerPage,
      search,
      selectedCabang,
      selectedSupplier,
      selectedBarang,
      endDate,
    )
  }

  useEffect(() => {
    setPerPage(perPage)
    if (endDate) {
      loadDataDaftarBarang(
        1,
        perPage,
        '',
        selectedCabang,
        selectedSupplier,
        selectedBarang,
        endDate,
      )
    }
  }, [perPage, selectedCabang, selectedSupplier, selectedBarang, endDate])

  const exportToExcel = async () => {
    document.body.style.cursor = 'wait'
    try {
      const response = await fetchDaftarBarang(
        1,
        1000000,
        search,
        selectedCabang,
        selectedSupplier,
        selectedBarang,
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
      worksheet.mergeCells('A2:H2')
      worksheet.getCell('A2').value = 'Laporan Daftar Barang'
      worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' }
      worksheet.getCell('A2').font = { size: 16, bold: true }
      worksheet.mergeCells('A3:H3')
      worksheet.getCell('A3').value = 'Periode per ' + formatDateToDDMMYYYY(endDate)
      worksheet.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' }
      worksheet.getCell('A3').font = { size: 16, bold: true }

      // Row 4: Export info
      worksheet.mergeCells('A4:H4')
      worksheet.getCell('A4').value =
        `Exported at ${getCurrentDateTimeFormatted()} by ${userData?.UserName || '-'}`
      worksheet.getCell('A4').alignment = { horizontal: 'right', vertical: 'middle' }
      worksheet.getCell('A4').font = { italic: true, size: 10 }
      worksheet.mergeCells('A5:H5')

      // Set column widths only (DO NOT use headers here!)
      worksheet.columns = [
        { key: 'no', width: 6 },
        { key: 'KodeGudang', width: 18 },
        { key: 'NamaGudang', width: 10 },
        { key: 'KodeItem', width: 15 },
        { key: 'NamaBarang', width: 15 },
        { key: 'KodeSatuan', width: 15 },
        { key: 'SumQtyPhysical', width: 15 },
        { key: 'Keterangan', width: 15 },
      ]

      const numberFormatThousand = '#,##0' // Format: 1,000
      const columnsToFormat = ['SumQtyPhysical']
      columnsToFormat.forEach((key) => {
        const column = worksheet.getColumn(key)
        column.numFmt = numberFormatThousand
      })

      // Row 5: Write headers manually
      worksheet.addRow([
        'No',
        'KodeGudang',
        'NamaGudang',
        'KodeItem',
        'NamaBarang',
        'KodeSatuan',
        'Qty',
        'Keterangan',
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
      worksheet.mergeCells(`A${totalRowNumber}:F${totalRowNumber}`)
      worksheet.getCell(`A${totalRowNumber}`).value = 'TOTAL'
      worksheet.getCell(`A${totalRowNumber}`).alignment = {
        horizontal: 'center',
        vertical: 'middle',
      }
      worksheet.getCell(`A${totalRowNumber}`).font = { bold: true }

      // Add formula-based totals
      worksheet.getCell(`G${totalRowNumber}`).value = { formula: `SUM(G7:G${totalRowNumber - 1})` } // Qty

      // Optional: bold all total row
      worksheet.getRow(totalRowNumber).font = { bold: true }

      // Optional: Freeze title and header
      worksheet.views = [{ state: 'frozen', ySplit: 5 }]

      worksheet.autoFilter = {
        from: 'A6',
        to: 'H6',
      }

      // Generate and save
      const buffer = await workbook.xlsx.writeBuffer()
      saveAs(
        new Blob([buffer]),
        'Laporan Daftar Barang per ' + formatDateToDDMMYYYY(endDate) + '.xlsx',
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

      const response = await fetchDaftarBarang(
        1,
        1000000,
        search,
        selectedCabang,
        selectedSupplier,
        selectedBarang,
        endDate,
      )

      // Map: If KodeGudang == '03-GUU-02', update NamaGudang
      const allData = response.data.map(item => {
        if (item.KodeGudang === '03-GUU-02') {
          return { ...item, NamaGudang: 'Gudang Utama-TGR 2 (Gudang Buffer SAI)' }
        }
        return item
      })

      const formatThousand = (num) => {
        if (num == null) return ''
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      }

      // Group the data by KodeGudang, then by KodeKategory
      const groupedData = allData.reduce((acc, item) => {
        const gudang = item.KodeGudang
        const kategori = item.KodeKategory

        if (!acc[gudang]) {
          acc[gudang] = {}
        }
        if (!acc[gudang][kategori]) {
          acc[gudang][kategori] = []
        }
        acc[gudang][kategori].push(item)
        return acc
      }, {})

      const content = []

      // Title and printed info
      content.push({
        text: 'Laporan Daftar Barang',
        style: 'header',
        alignment: 'center',
      })
      content.push({
        text: `Periode per ${formatDateToDDMMYYYY(endDate)}`,
        style: 'subheader',
        alignment: 'center',
        margin: [0, 0, 0, 10],
      })

      const printedInfo = `Printed at ${getCurrentDateTimeFormatted()} by ${userData?.UserName || '-'}`
      content.push({
        text: printedInfo,
        style: 'printedInfo',
        alignment: 'right',
        margin: [0, 0, 0, 10],
      })

      // Generate tables for each group
      for (const gudang in groupedData) {
        // Gudang header
        content.push({
          text: `Kode Gudang : ${gudang}`,
          style: 'subheader',
          margin: [0, 20, 0, 0],
        })
        content.push({
          text: `Nama Gudang : ${groupedData[gudang][Object.keys(groupedData[gudang])[0]][0].NamaGudang}`,
          style: 'subheader',
          margin: [0, 0, 0, 5],
        })

        for (const kategori in groupedData[gudang]) {
          // Kategori header
          content.push({
            text: `Kategori : ${kategori}`,
            style: 'subheader',
            margin: [0, 10, 0, 5],
          })

          // Table headers
          const headers = [
            { text: 'No', alignment: 'center' },
            { text: 'Kode Item', alignment: 'center' },
            { text: 'Nama Barang', alignment: 'center' },
            { text: 'Satuan', alignment: 'center' },
            { text: 'Status', alignment: 'center' },
            { text: 'Qty', alignment: 'right' },
          ]

          // Prepare table body with Qty column aligned to the right
          let rowCount = 1
          const body = [
            headers,
            ...groupedData[gudang][kategori].map((row) => [
              { text: rowCount++, alignment: 'center' },
              { text: row.KodeItem, alignment: 'center' },
              { text: row.NamaBarang, alignment: 'left' },
              { text: row.KodeSatuan, alignment: 'center' },
              { text: row.Keterangan, alignment: 'center' },
              { text: formatThousand(row.SumQtyPhysical), alignment: 'right' },
            ]),
          ]

          // Create table
          content.push({
            style: 'tableExample',
            table: {
              headerRows: 1,
              widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto'],
              body: body,
            },
            // Change layout to bordered style
            layout: {
              hLineWidth: function (i, node) {
                return i === 0 || i === node.table.body.length ? 1 : 1
              },
              vLineWidth: function (i, node) {
                return i === 0 || i === node.table.widths.length ? 1 : 1
              },
              hLineColor: function (i, node) {
                return '#aaa'
              },
              vLineColor: function (i, node) {
                return '#aaa'
              },
            },
          })
        }
      }

      const docDefinition = {
        content: content,
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
          printedInfo: {
            fontSize: 8,
            italics: true,
          },
          tableExample: {
            fontSize: 8,
          },
        },
        pageOrientation: 'portrait',
        pageSize: 'A4',
        header: function (currentPage, pageCount, pageSize) {
          return {
            text: `Hal: ${currentPage} / ${pageCount}`,
            alignment: 'right',
            margin: [0, 15, 40, 0],
            fontSize: 10,
          }
        },
      }

      pdfMake
        .createPdf(docDefinition)
        .download('Laporan Daftar Barang per' + formatDateToDDMMYYYY(endDate) + '.pdf')
    } catch (error) {
      alert('Gagal mengunduh PDF!')
      console.error('Error exporting to PDF:', error)
    } finally {
      document.body.style.cursor = 'default'
    }
  }

  return (
    <>
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
                    <CabangSelector
                      onSelect={(items) => {
                        console.log('Selected items:', items)
                        setSelectedCabang(items)
                      }}
                    />
                  </CCol>
                  <CCol xs={12} sm={2} className="d-grid">
                    <SupplierSelector
                      onSelect={(items) => {
                        console.log('Selected items:', items)
                        setSelectedSupplier(items)
                      }}
                    />
                  </CCol>
                  <CCol xs={12} sm={2} className="d-grid">
                    <BarangSelector
                      onSelect={(items) => {
                        console.log('Selected items:', items)
                        setSelectedBarang(items)
                      }}
                    />
                  </CCol>
                  <CCol xs={12} sm={2}>
                    <DatePicker onChange={setEndDate} value={endDate} />
                  </CCol>
                </CRow>
              </div>
              {/* <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or code"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    fetchDaftarBarang(1, e.target.value) // reset to page 1 on search
                  }}
                />
              </div> */}

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
    </>
  )
}

export default DaftarBarang
