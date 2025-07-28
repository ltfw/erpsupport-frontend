import { useEffect, useState } from 'react'
import DatePicker from '../../base/datepicker/DatePicker'
import { formatDateToDDMMYYYY } from '../../../utils/Date'
import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';

// pdfMake.vfs = pdfFonts.pdfMake.vfs;


import { CCard, CCardBody, CCardHeader, CCol, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CRow } from '@coreui/react'
import { useNavigate } from 'react-router-dom'

import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { DataTable } from 'src/components'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPrint, cilSpreadsheet, cilTrash } from '@coreui/icons'
import FilterReport from '../../modals/FilterReport'
import BarangSelector from '../../modals/BarangSelector'
import CabangSelector from '../../modals/CabangSelector'
import SupplierSelector from '../../modals/SupplierSelector'
import { getCurrentDateFormatted, getFirstDayOfMonthFormatted } from '../../../utils/Date'
const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const Penjualan = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const [selectedBarang, setSelectedBarang] = useState([])
  const [selectedCabang, setSelectedCabang] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState([]);
  const [startDate, setStartDate] = useState(getFirstDayOfMonthFormatted());
  const [endDate, setEndDate] = useState(getCurrentDateFormatted());

  const column = [
    {
      name: 'No',
      selector: (row, index) => (page - 1) * perPage + index + 1,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Cabang',
      selector: (row) => row.NamaDept,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Kepala Cabang',
      selector: (row) => row.KepalaCabang,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Area',
      selector: (row) => row.KodeWil,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Salesman',
      selector: (row) => row.NamaSales,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Supervisor',
      selector: (row) => row.NamaSpv,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Rayon',
      selector: (row) => row.RayonName,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Tgl Faktur',
      selector: (row) => row.TglFaktur,
      sortable: true,
      wrap: true,
    },
    {
      name: 'No Faktur',
      selector: (row) => row.NoBukti,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Group Customer',
      selector: (row) => row.CustomerGroupName,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Badan Usaha',
      selector: (row) => row.BusinessEntityName,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Kode Customer',
      selector: (row) => row.KodeLgn,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Nama Customer',
      selector: (row) => row.NamaLgn,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Alamat',
      selector: (row) => row.Alamat1,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Kode Item',
      selector: (row) => row.KodeItem,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Nama Item',
      selector: (row) => row.NamaBarang,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Supplier',
      selector: (row) => row.NamaSupplier,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Nama Business Centre',
      selector: (row) => row.BusinessCentreName,
      sortable: true,
      wrap: true,
    },
    {
      name: 'HNA',
      selector: (row) => row.Hna1,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Qty',
      selector: (row) => row.Qty,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Satuan',
      selector: (row) => row.SatuanNs,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Value HNA',
      selector: (row) => row.ValueHNA,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Value Nett',
      selector: (row) => row.ValueNett,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Total Value Disc',
      selector: (row) => row.TotalValueDisc,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Value Disc Distributor',
      selector: (row) => row.ValueDiscDist,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Value Disc Principle',
      selector: (row) => row.ValueDiscPrinc,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Total Disc %',
      selector: (row) => row.TotalDiscPsn,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Disc Dist %',
      selector: (row) => row.DiscDistPsn,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Disc Princ %',
      selector: (row) => row.DiscPrincPsn,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Batch Number',
      selector: (row) => row.BatchNumber,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Tgl Expired',
      selector: (row) => row.TglExpired,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Province',
      selector: (row) => row.Province,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Regency',
      selector: (row) => row.Regency,
      sortable: true,
      wrap: true,
    },
    {
      name: 'District',
      selector: (row) => row.District,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Village',
      selector: (row) => row.Village,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Tipe Jual',
      selector: (row) => row.TipeJual,
      sortable: true,
      wrap: true,
    },
    {
      name: 'NoSP',
      selector: (row) => row.PoLanggan,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Kode Promosi',
      selector: (row) => row.PromotionCode,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Nama Promosi',
      selector: (row) => row.PromotionName,
      sortable: true,
      wrap: true,
    },
  ];

  const loadDataSales = async (page, perPage, keyword = '', cabangIds = [], supplierIds = [], barangIds = [], startDate = null, endDate = null) => {
    setLoading(true)
    setPage(page)
    const fetchData = await fetchSales(page, perPage, keyword, cabangIds, supplierIds, barangIds, startDate, endDate)
    setData(fetchData.data)
    setTotalRows(fetchData.total)
    setLoading(false)
  }

  const fetchSales = async (page, perPage, keyword = '', cabangIds = [], supplierIds = [], barangIds = [], startDate = null, endDate = null) => {
    console.log('fetchSales called with page:', page, 'keyword:', keyword, 'cabangIds:', cabangIds, 'barangIds:', barangIds, 'startDate:', startDate, 'endDate:', endDate)
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

    const response = await axios.get(`${ENDPOINT_URL}sales?${params.toString()}`)

    return { data: response.data.data, total: response.data.pagination.total }
  }

  const handlePageChange = (page) => {
    loadDataSales(page, perPage, search, selectedCabang, selectedSupplier, selectedBarang, startDate, endDate)
  }

  const handlePerRowsChange = async (newPerPage, page) => {
    setPerPage(newPerPage)
    loadDataSales(page, newPerPage, search, selectedCabang, selectedSupplier, selectedBarang, startDate, endDate)
  }

  useEffect(() => {
    setPerPage(perPage)
    if (startDate && endDate) {
      loadDataSales(1, perPage, '', selectedCabang, selectedSupplier, selectedBarang, startDate, endDate)
    }
  }, [perPage, selectedCabang, selectedSupplier, selectedBarang, startDate, endDate])

  const exportToExcel = async () => {
    document.body.style.cursor = 'wait';
    try {
      const response = await fetchSales(
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
      const worksheet = workbook.addWorksheet('Sales');

      // Row 2: Title
      worksheet.mergeCells('A2:AL2');
      worksheet.getCell('A2').value = 'Laporan Penjualan';
      worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell('A2').font = { size: 16, bold: true };
      worksheet.mergeCells('A3:AL3');
      worksheet.getCell('A3').value = 'Periode ' + formatDateToDDMMYYYY(startDate) + ' s.d. ' + formatDateToDDMMYYYY(endDate);
      worksheet.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell('A3').font = { size: 16, bold: true };

      // Set column widths only (DO NOT use headers here!)
      worksheet.columns = [
        { key: 'no', width: 6 },
        { key: 'NamaDept', width: 15 },
        { key: 'KepalaCabang', width: 18 },
        { key: 'KodeWil', width: 10 },
        { key: 'NamaSales', width: 15 },
        { key: 'NamaSpv', width: 15 },
        { key: 'RayonName', width: 15 },
        { key: 'TglFaktur', width: 15 },
        { key: 'NoBukti', width: 15 },
        { key: 'CustomerGroupName', width: 18 },
        { key: 'BusinessEntityName', width: 18 },
        { key: 'KodeLgn', width: 15 },
        { key: 'NamaLgn', width: 18 },
        { key: 'Alamat1', width: 20 },
        { key: 'KodeItem', width: 15 },
        { key: 'NamaBarang', width: 18 },
        { key: 'NamaSupplier', width: 15 },
        { key: 'BusinessCentreName', width: 20 },
        { key: 'Hna1', width: 10 },
        { key: 'Qty', width: 8 },
        { key: 'SatuanNs', width: 10 },
        { key: 'ValueHNA', width: 15 },
        { key: 'ValueNett', width: 15 },
        { key: 'TotalValueDisc', width: 18 },
        { key: 'ValueDiscDist', width: 20 },
        { key: 'ValueDiscPrinc', width: 20 },
        { key: 'TotalDiscPsn', width: 15 },
        { key: 'DiscDistPsn', width: 15 },
        { key: 'DiscPrincPsn', width: 15 },
        { key: 'BatchNumber', width: 15 },
        { key: 'TglExpired', width: 15 },
        { key: 'Province', width: 15 },
        { key: 'Regency', width: 15 },
        { key: 'District', width: 15 },
        { key: 'Village', width: 15 },
        { key: 'TipeJual', width: 12 },
        { key: 'PoLanggan', width: 15 },
        { key: 'PromotionCode', width: 15 },
      ];

      const numberFormatThousandTwoDecimal = '#,##0.00'; // Format: 1,000.00
      const numberFormatThousand = '#,##0'; // Format: 1,000

      // Format specific columns by key
      const columnsToFormatDecimal = ['ValueHNA', 'ValueNett', 'TotalValueDisc', 'ValueDiscDist', 'ValueDiscPrinc',
        'TotalDiscPsn',
        'DiscDistPsn',
        'DiscPrincPsn'
      ];

      columnsToFormatDecimal.forEach((key) => {
        const column = worksheet.getColumn(key);
        column.numFmt = numberFormatThousandTwoDecimal;
      });

      const columnsToFormat = ['Hna1', 'Qty'];

      columnsToFormat.forEach((key) => {
        const column = worksheet.getColumn(key);
        column.numFmt = numberFormatThousand;
      });

      // Row 3: Write headers manually
      worksheet.addRow([
        'No', 'Cabang', 'Kepala Cabang', 'Area', 'Salesman', 'Supervisor', 'Rayon', 'Tgl Faktur',
        'No Faktur', 'Group Customer', 'Badan Usaha', 'Kode Customer', 'Nama Customer', 'Alamat',
        'Kode Item', 'Nama Item', 'Supplier', 'Nama Business Centre', 'HNA', 'Qty', 'Satuan',
        'Value HNA', 'Value Nett', 'Total Value Disc', 'Value Disc Distributor', 'Value Disc Principle',
        'Total Disc %', 'Disc Dist %', 'Disc Princ %', 'Batch Number', 'Tgl Expired', 'Province',
        'Regency', 'District', 'Village', 'Tipe Jual', 'NoSP', 'Kode Promosi'
      ]);

      // Row 4+: Add data
      allData.forEach((row, idx) => {
        const cleanRow = {
          ...row,
          Hna1: Math.round(parseFloat(row.Hna1 || 0) * 100) / 100,
          Qty: Math.round(parseFloat(row.Qty || 0) * 100) / 100,
          ValueHNA: Math.round(parseFloat(row.ValueHNA || 0) * 100) / 100,
          ValueNett: Math.round(parseFloat(row.ValueNett || 0) * 100) / 100,
          TotalValueDisc: Math.round(parseFloat(row.TotalValueDisc || 0) * 100) / 100,
          ValueDiscDist: Math.round(parseFloat(row.ValueDiscDist || 0) * 100) / 100,
          ValueDiscPrinc: Math.round(parseFloat(row.ValueDiscPrinc || 0) * 100) / 100,
        };

        worksheet.addRow({
          no: idx + 1,
          ...cleanRow,
        });
      });

      // Calculate total rows added (header is row 4, so data starts from row 5)
      const totalRowNumber = worksheet.lastRow.number + 1;

      // Add total label
      worksheet.mergeCells(`A${totalRowNumber}:S${totalRowNumber}`);
      worksheet.getCell(`A${totalRowNumber}`).value = 'TOTAL';
      worksheet.getCell(`A${totalRowNumber}`).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell(`A${totalRowNumber}`).font = { bold: true };

      // Add formula-based totals
      worksheet.getCell(`T${totalRowNumber}`).value = { formula: `SUM(T5:S${totalRowNumber - 1})` }; // Qty
      worksheet.getCell(`V${totalRowNumber}`).value = { formula: `SUM(V5:V${totalRowNumber - 1})` }; // ValueHNA
      worksheet.getCell(`W${totalRowNumber}`).value = { formula: `SUM(W5:W${totalRowNumber - 1})` }; // ValueNett
      worksheet.getCell(`X${totalRowNumber}`).value = { formula: `SUM(X5:X${totalRowNumber - 1})` }; // TotalValueDisc
      worksheet.getCell(`Y${totalRowNumber}`).value = { formula: `SUM(Y5:Y${totalRowNumber - 1})` }; // ValueDiscDist
      worksheet.getCell(`Z${totalRowNumber}`).value = { formula: `SUM(Z5:Z${totalRowNumber - 1})` }; // ValueDiscPrinc

      // Optional: bold all total row
      worksheet.getRow(totalRowNumber).font = { bold: true };


      // Optional: Freeze title and header
      worksheet.views = [{ state: 'frozen', ySplit: 4 }];

      worksheet.autoFilter = {
        from: 'A4',
        to: 'AL4',
      };


      // Generate and save
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), 'sales_all.xlsx');
    } catch (error) {
      alert('Gagal mengunduh data!');
    } finally {
      document.body.style.cursor = 'default';
    }
  }

  const exportToPDF = async () => {
    try {
      document.body.style.cursor = 'wait';

      const response = await fetchSales(
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
        'No', 'Cabang', 'Kepala Cabang', 'Area', 'Salesman', 'Supervisor', 'Rayon', 'Tgl Faktur',
        'No Faktur', 'Group Customer', 'Badan Usaha', 'Kode Customer', 'Nama Customer', 'Alamat',
        'Kode Item', 'Nama Item', 'Supplier', 'Nama Business Centre', 'HNA', 'Qty', 'Satuan',
        'Value HNA', 'Value Nett', 'Total Value Disc', 'Value Disc Distributor', 'Value Disc Principle',
        'Total Disc %', 'Disc Dist %', 'Disc Princ %', 'Batch Number', 'Tgl Expired', 'Province',
        'Regency', 'District', 'Village', 'Tipe Jual', 'NoSP', 'Kode Promosi', 'Surat Keluar/No. DPL/F'
      ];

      // Prepare table body
      const body = [
        headers,
        ...allData.map((row, idx) => [
          idx + 1,
          row.NamaDept,
          row.KepalaCabang,
          row.KodeWil,
          row.NamaSales,
          row.NamaSpv,
          row.RayonName,
          row.TglFaktur,
          row.NoBukti,
          row.CustomerGroupName,
          row.BusinessEntityName,
          row.KodeLgn,
          row.NamaLgn,
          row.Alamat1,
          row.KodeItem,
          row.NamaBarang,
          row.NamaSupplier,
          row.BusinessCentreName,
          parseFloat(row.Hna1 || 0).toFixed(2),
          parseFloat(row.Qty || 0).toFixed(2),
          row.SatuanNs,
          parseFloat(row.ValueHNA || 0).toFixed(2),
          parseFloat(row.ValueNett || 0).toFixed(2),
          parseFloat(row.TotalValueDisc || 0).toFixed(2),
          parseFloat(row.ValueDiscDist || 0).toFixed(2),
          parseFloat(row.ValueDiscPrinc || 0).toFixed(2),
          parseFloat(row.TotalDiscPsn || 0).toFixed(2),
          parseFloat(row.DiscDistPsn || 0).toFixed(2),
          parseFloat(row.DiscPrincPsn || 0).toFixed(2),
          row.BatchNumber,
          row.TglExpired,
          row.Province,
          row.Regency,
          row.District,
          row.Village,
          row.TipeJual,
          row.PoLanggan,
          row.PromotionCode,
          row.PromotionName
        ])
      ];

      const docDefinition = {
        content: [
          {
            text: 'Laporan Penjualan',
            style: 'header',
            alignment: 'center'
          },
          {
            text: `Periode ${formatDateToDDMMYYYY(startDate)} s.d. ${formatDateToDDMMYYYY(endDate)}`,
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
        pageOrientation: 'landscape',
        pageSize: 'A1',
      };

      pdfMake.createPdf(docDefinition).download('sales_all.pdf');
    } catch (error) {
      alert('Gagal mengunduh PDF!');
      console.error('Error exporting to PDF:', error);
    } finally {
      document.body.style.cursor = 'default';
    }
  }

  const [showFilterModal, setShowFilterModal] = useState(false);

  return (
    <>
      {/* <FilterReport
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onExport={exportToExcel} // Call exportToExcel from modal if needed
      /> */}

      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Data Sales
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
                    loadDataSales(1, perPage, e.target.value, selectedCabang, selectedSupplier, selectedBarang, startDate, endDate) // Ensure it loads page 1
                  }}
                />
              </div>

              <DataTable
                dense
                title="Sales List"
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

export default Penjualan
