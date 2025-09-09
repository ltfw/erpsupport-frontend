import { useEffect, useState } from 'react'
import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';
import { CCard, CCardBody, CCardHeader, CCol, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CRow } from '@coreui/react'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { DataTable } from 'src/components'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPrint, cilSpreadsheet, cilTrash } from '@coreui/icons'
import { formatDateToDDMMYYYY, getCurrentDateFormatted, formatISODateToDDMMYYYY } from '../../utils/Date'
import DatePicker from '../base/datepicker/DatePicker'
const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const RayonCabang = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const [selectedBarang, setSelectedBarang] = useState([])
  const [selectedCabang, setSelectedCabang] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState([]);
  const [periode, setEndDate] = useState(getCurrentDateFormatted());

  const column = [
    {
      name: 'No',
      selector: (row, index) => (page - 1) * perPage + index + 1,
      sortable: true,
      width: '6%',
    },
    {
      name: 'Kode Cabang',
      selector: (row) => row.KodeDept,
      sortable: true,
    },
    {
      name: 'Nama Cabang',
      selector: (row) => row.NamaDept,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Kode Sales Area',
      selector: (row) => row.KodeSalesArea,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Nama Sales Area',
      selector: (row) => row.NamaSalesArea,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Kode Wilayah',
      selector: (row) => row.KodeWil,
      sortable: true,
    },
    {
      name: 'Nama Wilayah',
      selector: (row) => row.NamaWil,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Provinsi',
      selector: (row) => row.Provinsi,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Kabupaten',
      selector: (row) => row.Kabupaten,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Kode Rayon',
      selector: (row) => row.RayonCode,
      sortable: true,
    },
    {
      name: 'Nama Rayon',
      selector: (row) => row.RayonName,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Kode Kecamatan',
      selector: (row) => row.DistrictId,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Kecamatan',
      selector: (row) => row.Kecamatan,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Kode Salesman',
      selector: (row) => row.KodeSales,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Nama Salesman',
      selector: (row) => row.NamaSales,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Periode',
      selector: (row) => formatISODateToDDMMYYYY(row.periode),
      sortable: true,
      wrap: true,
    },
  ]

  const loadDataRayonCabang = async (page, perPage, periode = null) => {
    setLoading(true)
    setPage(page)
    const fetchData = await fetchRayonCabang(page, perPage, periode)
    setData(fetchData.data)
    setTotalRows(fetchData.total)
    setLoading(false)
  }

  const fetchRayonCabang = async (page, perPage, periode = null) => {
    console.log('fetchRayonCabang called with page:', page, 'periode:', periode)
    const params = new URLSearchParams()
    params.append('page', page)
    params.append('per_page', perPage)
    if (periode) {
      params.append('date', periode)
    }

    const response = await axios.get(`${ENDPOINT_URL}report/rayoncabang?${params.toString()}`)

    return { data: response.data.data, total: response.data.pagination.total }
  }

  const handlePageChange = (page) => {
    loadDataRayonCabang(page, perPage, periode)
  }

  const handlePerRowsChange = async (newPerPage, page) => {
    setPerPage(newPerPage)
    loadDataRayonCabang(page, newPerPage, periode)
  }

  useEffect(() => {
    setPerPage(perPage)
    if (periode) {
      loadDataRayonCabang(1, perPage, periode)
    }
  }, [perPage, periode])

  const exportToExcel = async () => {
    document.body.style.cursor = 'wait';
    try {
      const response = await fetchRayonCabang(
        1,
        -1,
        periode
      );
      const allData = response.data;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sales');

      // Row 2: Title
      worksheet.mergeCells('A2:N2');
      worksheet.getCell('A2').value = 'Laporan RayonCabang Barang Per Batch';
      worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell('A2').font = { size: 16, bold: true };
      worksheet.mergeCells('A3:N3');
      worksheet.getCell('A3').value = 'Periode per ' + formatDateToDDMMYYYY(periode);
      worksheet.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell('A3').font = { size: 16, bold: true };

      // Set column widths only (DO NOT use headers here!)
      worksheet.columns = [
        { key: 'no', width: 6 },
        { key: 'KodeDept', width: 15 },
        { key: 'NamaDept', width: 18 },
        { key: 'KodeSalesArea', width: 10 },
        { key: 'NamaSalesArea', width: 15 },
        { key: 'KodeWil', width: 15 },
        { key: 'NamaWil', width: 15 },
        { key: 'Provinsi', width: 15 },
        { key: 'Kabupaten', width: 15 },
        { key: 'RayonCode', width: 15 },
        { key: 'RayonName', width: 20 },
        { key: 'DistrictId', width: 15 },
        { key: 'Kecamatan', width: 18 },
        { key: 'KodeSales', width: 10 },
        { key: 'NamaSales', width: 15 },
        { key: 'periode', width: 15 },
      ];

    //   const numberFormatThousand = '#,##0'; // Format: 1,000

    //   const columnsToFormat = ['Qty'];

    //   columnsToFormat.forEach((key) => {
    //     const column = worksheet.getColumn(key);
    //     column.numFmt = numberFormatThousand;
    //   });

      // Row 3: Write headers manually
      worksheet.addRow([
        'No', 
        'KodeDept',
        'NamaDept',
        'KodeSalesArea',
        'NamaSalesArea',
        'KodeWil',
        'NamaWil',
        'Provinsi',
        'Kabupaten',
        'RayonCode',
        'RayonName',
        'DistrictId',
        'Kecamatan',
        'KodeSales',
        'NamaSales',
        'periode',
      ]);

      // Row 4+: Add data
      allData.forEach((row, idx) => {
        worksheet.addRow({
          no: idx + 1,
          ...row,
          periode: formatISODateToDDMMYYYY(row.periode), // Format date to DD/MM/YYYY
        });
      });

      // Optional: Freeze title and header
      worksheet.views = [{ state: 'frozen', ySplit: 4 }];

      worksheet.autoFilter = {
        from: 'A4',
        to: 'N4',
      };

      // Generate and save
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), 'RayonCabang per ' + formatDateToDDMMYYYY(periode) + '.xlsx');
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

      const response = await fetchRayonCabang(
        1,
        1000000,
        periode
      );

      const allData = response.data;

      // Define columns
      const headers = [
        'No', 
        'KodeDept',
        'NamaDept',
        'KodeSalesArea',
        'NamaSalesArea',
        'KodeWil',
        'NamaWil',
        'Provinsi',
        'Kabupaten',
        'RayonCode',
        'RayonName',
        'DistrictId',
        'Kecamatan',
        'KodeSales',
        'NamaSales',
        'periode',
      ];

      // Prepare table body
      const body = [
        headers,
        ...allData.map((row, idx) => [
          idx + 1,
          row.KodeDept,
          row.NamaDept,
          row.KodeSalesArea,
          row.NamaSalesArea,
          row.KodeWil,
          row.NamaWil,
          row.Provinsi,
          row.Kabupaten,
          row.RayonCode,
          row.RayonName,
          row.DistrictId,
          row.Kecamatan,
          row.KodeSales,
          row.NamaSales,
          formatISODateToDDMMYYYY(row.periode),
        ])
      ];

      const docDefinition = {
        content: [
          {
            text: 'Laporan Rayon Cabang Barang Per Batch',
            style: 'header',
            alignment: 'center'
          },
          {
            text: `Periode per ${formatDateToDDMMYYYY(periode)}`,
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

      pdfMake.createPdf(docDefinition).download('RayonCabang per' + formatDateToDDMMYYYY(periode) + '.pdf');
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
            <CCardHeader>Data Rayon Cabang
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
                  <CCol xs={12} sm={2}>
                    <DatePicker onChange={setEndDate} value={periode} />
                  </CCol>
                </CRow>
              </div>
              <DataTable
                dense
                title="Data Rayon Per Cabang"
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

export default RayonCabang
