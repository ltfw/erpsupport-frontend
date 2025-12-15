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

const PenyaluranMasuk = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const [selectedBarang, setSelectedBarang] = useState([])
  const [selectedCabang, setSelectedCabang] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState([]);
  const [startDate, setStartDate] = useState(getCurrentDateFormatted());
  const [endDate, setEndDate] = useState(getCurrentDateFormatted());

  const column = [
    {
      name: 'No',
      selector: (row, index) => (page - 1) * perPage + index + 1,
      sortable: true,
      width: '6%',
    },
    {
      name: 'Kode Cabang',
      selector: (row) => row.KodeCabang,
      sortable: true,
    },
    {
      name: 'Nama Cabang',
      selector: (row) => row.NamaCabang,
      sortable: true,
    },
    {
      name: 'Id Produk',
      selector: (row) => row.IdProduk,
      sortable: true,
    },
    {
      name: 'Nama Produk',
      selector: (row) => row.NamaProduk,
      sortable: true,
    },
    {
      name: 'Nomor Izin Edar',
      selector: (row) => row.NomorIzinEdar,
      sortable: true,
    },
    {
      name: 'Tipe Ukuran',
      selector: (row) => row.TipeUkuran,
      sortable: true,
    },
    {
      name: 'Batch Number',
      selector: (row) => row.BatchNumber,
      sortable: true,
    },
    {
      name: 'Katalog',
      selector: (row) => row.Katalog,
      sortable: true,
    },
    {
      name: 'Jumlah Penyaluran',
      selector: (row) => row.JumlahPenyaluran,
      sortable: true,
    },
    {
      name: 'Tanggal Keluar',
      selector: (row) => row.TanggalMasuk,
      sortable: true,
    },
    {
      name: 'Tanggal Kadaluarsa',
      selector: (row) => row.TanggalKadaluarsa,
      sortable: true,
    },
    {
      name: 'Parent Transaction',
      selector: (row) => row.parenttransaction,
      sortable: true,
    },
    {
      name: 'Kode Sumber',
      selector: (row) => row.KodeSumber,
      sortable: true,
    },
    {
      name: 'Nama Perusahaan',
      selector: (row) => row.NamaLgn,
      sortable: true,
    },
    {
      name: 'Id Partner',
      selector: (row) => row.IdPartner,
      sortable: true,
    },
    {
      name: 'Nama Partner',
      selector: (row) => row.NamaPartner,
      sortable: true,
    },
  ]

  const loadDataPenyaluranMasuk = async (page, perPage, keyword = '', cabangIds = [], supplierIds = [], barangIds = [], startDate = null, endDate = null) => {
    setLoading(true)
    setPage(page)
    const fetchData = await fetchPenyaluranMasuk(page, perPage, keyword, cabangIds, supplierIds, barangIds, startDate, endDate)
    setData(fetchData.data)
    setTotalRows(fetchData.total)
    setLoading(false)
  }

  const fetchPenyaluranMasuk = async (page, perPage, keyword = '', cabangIds = [], supplierIds = [], barangIds = [], startDate = null, endDate = null) => {
    console.log('fetchPenyaluranMasuk called with page:', page, 'keyword:', keyword, 'cabangIds:', cabangIds, 'supplierIds:', supplierIds, 'barangIds:', barangIds, 'startDate:', startDate, 'endDate:', endDate)
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
    if (startDate) {
      params.append('start_date', startDate)
    }
    if (endDate) {
      params.append('end_date', endDate)
    }

    const response = await axios.get(`${ENDPOINT_URL}alkes/saluranmasuk?${params.toString()}`)

    return { data: response.data.data, total: response.data.pagination.total }
  }

  const handlePageChange = (page) => {
    loadDataPenyaluranMasuk(page, perPage, search, selectedCabang, selectedSupplier, selectedBarang, startDate, endDate)
  }

  const handlePerRowsChange = async (newPerPage, page) => {
    setPerPage(newPerPage)
    loadDataPenyaluranMasuk(page, newPerPage, search, selectedCabang, selectedSupplier, selectedBarang, startDate, endDate)
  }

  useEffect(() => {
    setSelectedCabang(['00'])
  }, [])

  useEffect(() => {
    setPerPage(perPage)
    if (startDate && endDate) {
      loadDataPenyaluranMasuk(1, perPage, '', selectedCabang, selectedSupplier, selectedBarang, startDate, endDate)
    }
  }, [perPage, selectedCabang, selectedSupplier, selectedBarang, startDate, endDate])

  const exportToExcel = async () => {
    document.body.style.cursor = 'wait';
    try {
      const response = await fetchPenyaluranMasuk(
        1,
        1000000,
        search,
        selectedCabang,
        selectedSupplier,
        selectedBarang,
        startDate,
        endDate
      );
      const allData = response.data;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('PenyaluranMasuk');

      // Row 2: Title
      worksheet.mergeCells('A2:Q2');
      worksheet.getCell('A2').value = 'Laporan Penyaluran Masuk';
      worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell('A2').font = { size: 16, bold: true };
      worksheet.mergeCells('A3:Q3');
      worksheet.getCell('A3').value = 'Periode dari ' + formatDateToDDMMYYYY(startDate) + ' sampai ' + formatDateToDDMMYYYY(endDate);
      worksheet.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell('A3').font = { size: 16, bold: true };

      // Set column widths only (DO NOT use headers here!)
      worksheet.columns = [
        { key: 'no', width: 6 },
        { key: 'KodeCabang', width: 15 },
        { key: 'NamaCabang', width: 15 },
        { key: 'IdProduk', width: 15 },
        { key: 'NamaProduk', width: 15 },
        { key: 'NomorIzinEdar', width: 15 },
        { key: 'TipeUkuran', width: 15 },
        { key: 'BatchNumber', width: 15 },
        { key: 'Katalog', width: 15 },
        { key: 'JumlahPenyaluran', width: 15 },
        { key: 'TanggalMasuk', width: 15 },
        { key: 'TanggalKadaluarsa', width: 15 },
        { key: 'parenttransaction', width: 15 },
        { key: 'KodeSumber', width: 15 },
        { key: 'namalgn', width: 15 },
        { key: 'IdPartner', width: 15 },
        { key: 'NamaPartner', width: 15 },
      ];

      const numberFormatThousand = '#,##0'; // Format: 1,000

      const columnsToFormat = ['JumlahPenyaluran'];

      columnsToFormat.forEach((key) => {
        const column = worksheet.getColumn(key);
        column.numFmt = numberFormatThousand;
      });

      // Row 3: Write headers manually
      worksheet.addRow([
        'No', 'KodeCabang', 'NamaCabang', 'IdProduk', 'NamaProduk', 'NomorIzinEdar', 'TipeUkuran', 'BatchNumber', 'Katalog', 'JumlahPenyaluran', 'TanggalMasuk', 'TanggalKadaluarsa', 'parenttransaction', 'KodeSumber', 'namalgn', 'IdPartner', 'NamaPartner'
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
      worksheet.mergeCells(`A${totalRowNumber}:P${totalRowNumber}`);
      worksheet.getCell(`A${totalRowNumber}`).value = 'TOTAL';
      worksheet.getCell(`A${totalRowNumber}`).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell(`A${totalRowNumber}`).font = { bold: true };

      // Add formula-based totals
      worksheet.getCell(`J${totalRowNumber}`).value = { formula: `SUM(J5:J${totalRowNumber - 1})` }; // JumlahPenyaluran

      // Optional: bold all total row
      worksheet.getRow(totalRowNumber).font = { bold: true };

      // Optional: Freeze title and header
      worksheet.views = [{ state: 'frozen', ySplit: 4 }];

      worksheet.autoFilter = {
        from: 'A4',
        to: 'Q4',
      };

      // Generate and save
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), 'Penyaluran Masuk dari ' + formatDateToDDMMYYYY(startDate) + ' sampai ' + formatDateToDDMMYYYY(endDate) + '.xlsx');
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

      const response = await fetchPenyaluranMasuk(
        1,
        1000000,
        search,
        selectedCabang,
        selectedSupplier,
        selectedBarang,
        startDate,
        endDate
      );

      const allData = response.data;

      // Define columns
      const headers = [
        'No', 'KodeCabang', 'NamaCabang', 'IdProduk', 'NamaProduk', 'NomorIzinEdar', 'TipeUkuran', 'BatchNumber', 'Katalog', 'JumlahPenyaluran', 'TanggalMasuk', 'TanggalKadaluarsa', 'parenttransaction', 'KodeSumber', 'namalgn', 'IdPartner', 'NamaPartner'
      ];

      // Prepare table body
      const body = [
        headers,
        ...allData.map((row, idx) => [
          idx + 1,
          row.KodeCabang,
          row.NamaCabang,
          row.IdProduk,
          row.NamaProduk,
          row.NomorIzinEdar,
          row.TipeUkuran,
          row.BatchNumber,
          row.Katalog,
          parseFloat(row.JumlahPenyaluran || 0).toFixed(2),
          row.TanggalMasuk,
          row.TanggalKadaluarsa,
          row.parenttransaction,
          row.KodeSumber,
          row.namalgn,
          row.IdPartner,
          row.NamaPartner,
        ])
      ];

      const docDefinition = {
        content: [
          {
            text: 'Laporan Penyaluran Masuk',
            style: 'header',
            alignment: 'center'
          },
          {
            text: `Periode dari ${formatDateToDDMMYYYY(startDate)} sampai ${formatDateToDDMMYYYY(endDate)}`,
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

      pdfMake.createPdf(docDefinition).download('Penyaluran Masuk dari ' + formatDateToDDMMYYYY(startDate) + ' sampai ' + formatDateToDDMMYYYY(endDate) + '.pdf');
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
            <CCardHeader>Data Penyaluran Masuk
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
                      selectedItems={selectedCabang}
                      onSelect={(items) => {
                        console.log('Selected items:', items)
                        setSelectedCabang(items)
                      }}
                    />
                  </CCol>
                  {/* <CCol xs={12} sm={2} className='d-grid'>
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
                  </CCol> */}
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
                  onChange={(e) => {
                    setSearch(e.target.value)
                    fetchPenyaluranMasuk(1, e.target.value) // reset to page 1 on search
                  }}
                />
              </div>

              <DataTable
                dense
                title="Data Penyaluran Masuk"
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

export default PenyaluranMasuk
