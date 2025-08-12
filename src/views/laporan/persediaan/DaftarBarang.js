import { useEffect, useState } from 'react'
import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';
import { CCard, CCardBody, CCardHeader, CCol, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CRow } from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { DataTable } from 'src/components'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPrint, cilSpreadsheet, cilTrash } from '@coreui/icons'
import { formatDateToDDMMYYYY, getCurrentDateFormatted } from '../../../utils/Date'
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
  const [selectedCabang, setSelectedCabang] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState([]);
  const [endDate, setEndDate] = useState(getCurrentDateFormatted());

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
      name: 'Qty',
      selector: (row) => row.QtyShow,
      sortable: true,
      wrap: true,
    },
  ]

  const loadDataDaftarBarang = async (page, perPage, keyword = '', cabangIds = [], supplierIds = [], barangIds = [], endDate = null) => {
    setLoading(true)
    setPage(page)
    const fetchData = await fetchDaftarBarang(page, perPage, keyword, cabangIds, supplierIds, barangIds, endDate)
    setData(fetchData.data)
    setTotalRows(fetchData.total)
    setLoading(false)
  }

  const fetchDaftarBarang = async (page, perPage, keyword = '', cabangIds = [], supplierIds = [], barangIds = [], endDate = null) => {
    console.log('fetchDaftarBarang called with page:', page, 'keyword:', keyword, 'cabangIds:', cabangIds, 'supplierIds:',supplierIds, 'barangIds:', barangIds, 'endDate:', endDate)
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
    loadDataDaftarBarang(page, perPage, search, selectedCabang, selectedSupplier, selectedBarang, endDate)
  }

  const handlePerRowsChange = async (newPerPage, page) => {
    setPerPage(newPerPage)
    loadDataDaftarBarang(page, newPerPage, search, selectedCabang, selectedSupplier, selectedBarang, endDate)
  }

  useEffect(() => {
    setPerPage(perPage)
    if (endDate) {
      loadDataDaftarBarang(1, perPage, '', selectedCabang, selectedSupplier, selectedBarang, endDate)
    }
  }, [perPage, selectedCabang, selectedSupplier, selectedBarang, endDate])

  const exportToExcel = async () => {
    document.body.style.cursor = 'wait';
    try {
      const response = await fetchDaftarBarang(
        1,
        1000000,
        search,
        selectedCabang,
        selectedSupplier,
        selectedBarang,
        endDate
      );
      const allData = response.data;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sales');

      // Row 2: Title
      worksheet.mergeCells('A2:F2');
      worksheet.getCell('A2').value = 'Laporan Daftar Barang';
      worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell('A2').font = { size: 16, bold: true };
      worksheet.mergeCells('A3:F3');
      worksheet.getCell('A3').value = 'Periode per ' + formatDateToDDMMYYYY(endDate);
      worksheet.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell('A3').font = { size: 16, bold: true };

      // Set column widths only (DO NOT use headers here!)
      worksheet.columns = [
        { key: 'no', width: 6 },
        { key: 'KodeGudang', width: 18 },
        { key: 'NamaGudang', width: 10 },
        { key: 'KodeItem', width: 15 },
        { key: 'NamaBarang', width: 15 },
        { key: 'QtyShow', width: 15 },
      ];

      const numberFormatThousand = '#,##0'; // Format: 1,000

      const columnsToFormat = ['QtyShow'];

      columnsToFormat.forEach((key) => {
        const column = worksheet.getColumn(key);
        column.numFmt = numberFormatThousand;
      });

      // Row 3: Write headers manually
      worksheet.addRow([
        'No',
        'KodeGudang',
        'NamaGudang',
        'KodeItem',
        'NamaBarang',
        'QtyShow'
      ]);

      // Row 4+: Add data
      allData.forEach((row, idx) => {
        worksheet.addRow({
          no: idx + 1,
          ...row,
        });
      });

      // Calculate total rows added (header is row 4, so data starts from row 5)
      const totalRowNumber = worksheet.lastRow.number + 1;

      // Add total label
      worksheet.mergeCells(`A${totalRowNumber}:F${totalRowNumber}`);
      worksheet.getCell(`A${totalRowNumber}`).value = 'TOTAL';
      worksheet.getCell(`A${totalRowNumber}`).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell(`A${totalRowNumber}`).font = { bold: true };

      // Add formula-based totals
      worksheet.getCell(`F${totalRowNumber}`).value = { formula: `SUM(F5:F${totalRowNumber - 1})` }; // Qty

      // Optional: bold all total row
      worksheet.getRow(totalRowNumber).font = { bold: true };

      // Optional: Freeze title and header
      worksheet.views = [{ state: 'frozen', ySplit: 4 }];

      worksheet.autoFilter = {
        from: 'A4',
        to: 'F4',
      };

      // Generate and save
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), 'Laporan Daftar Barang per ' + formatDateToDDMMYYYY(endDate) + '.xlsx');
    } catch (error) {
      alert('Gagal mengunduh data!');
      console.error('Error exporting to Excel:', error);
    } finally {
      document.body.style.cursor = 'default';
    }
  }

  const exportToPDF = async () => {
    try {
      document.body.style.cursor = 'wait';

      const response = await fetchDaftarBarang(
        1,
        1000000,
        search,
        selectedCabang,
        selectedSupplier,
        selectedBarang,
        endDate
      );

      const allData = response.data;

      // Define columns
      const headers = [
        'No',
        'KodeGudang',
        'NamaGudang',
        'KodeItem',
        'NamaBarang',
        'Qty'
      ];

      // Prepare table body
      const body = [
        headers,
        ...allData.map((row, idx) => [
          idx + 1,
          row.BusinessCentreName,
          row.KodeGudang,
          row.NamaGudang,
          row.KodeItem,
          row.NamaBarang,
          parseFloat(row.Qty || 0).toFixed(2),
        ])
      ];

      const docDefinition = {
        content: [
          {
            text: 'Laporan Daftar Barang',
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
            style: 'tableExample',
            table: {
              // headerRows: 1,
              // widths: Array(headers.length).fill('*'),
              body: body
            },
            layout: 'lightHorizontalLines'
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
            fontSize: 8
          }
        },
        pageOrientation: 'portrait',
        pageSize: 'A4',
      };

      pdfMake.createPdf(docDefinition).download('Laporan Daftar Barang per' + formatDateToDDMMYYYY(endDate) + '.pdf');
    } catch (error) {
      alert('Gagal mengunduh PDF!');
      console.error('Error exporting to PDF:', error);
    } finally {
      document.body.style.cursor = 'default';
    }
  }

  return (
    <>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Laporan Daftar Barang
              <CDropdown className='float-end'>
                <CDropdownToggle color="warning" size='sm' >Export</CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem onClick={exportToExcel}><CIcon icon={cilSpreadsheet} className="me-2" />Excel</CDropdownItem>
                  <CDropdownItem onClick={exportToPDF}><CIcon icon={cilPrint} className="me-2" />Pdf</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </CCardHeader>
            <CCardBody>
              <div className="mb-3">
                <CRow>
                  <CCol xs={12} sm={2} className='d-grid'>
                    <CabangSelector
                      onSelect={(items) => {
                        console.log('Selected items:', items)
                        setSelectedCabang(items)
                      }}
                    />
                  </CCol>
                  <CCol xs={12} sm={2} className='d-grid'>
                    <SupplierSelector onSelect={(items) => {
                      console.log('Selected items:', items)
                      setSelectedSupplier(items)
                    }} />
                  </CCol>
                  <CCol xs={12} sm={2} className='d-grid'>
                    <BarangSelector onSelect={(items) => {
                      console.log('Selected items:', items)
                      setSelectedBarang(items)
                    }} />
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
                  onChange={(e) => {
                    setSearch(e.target.value)
                    fetchDaftarBarang(1, e.target.value) // reset to page 1 on search
                  }}
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
    </>
  )
}

export default DaftarBarang
