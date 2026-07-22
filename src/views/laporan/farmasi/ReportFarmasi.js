import { useEffect, useState, useCallback } from 'react'
import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';
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
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CPagination,
  CPaginationItem,
  CFormSelect
} from '@coreui/react'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

import axios from 'axios'
import CIcon from '@coreui/icons-react'
import { cilPrint, cilSpreadsheet } from '@coreui/icons'
import { formatDateToDDMMYYYY } from '../../../utils/Date'
import CabangSelector from '../../modals/CabangSelector'
const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const ReportFarmasi = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [perPage, setPerPage] = useState(30)
  const [page, setPage] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [selectedTriwulan, setSelectedTriwulan] = useState('I');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCabang, setSelectedCabang] = useState([])
  const [namaCabang, setNamaCabang] = useState('')

  const column = [
    {
      name: 'Nie',
      selector: (row) => row.Nie,
      sortable: true,
    },
    {
      name: 'Nama Obat',
      selector: (row) => row.NamaItemBpom,
      sortable: true,
    },
    {
      name: 'Kemasan',
      selector: (row) => row.Kemasan,
      sortable: true,
    },
    {
      name: 'Komposisi',
      selector: (row) => row.ActiveIngredientName,
      sortable: true,
    },
    {
      name: 'Stok Awal',
      selector: (row) => row.StokAwal,
      sortable: true,
    },
    {
      name: 'Masuk IF',
      selector: (row) => row.MasukIf,
      sortable: true,
    },
    {
      name: 'Kode IF',
      selector: (row) => row.KodeIf,
      sortable: true,
    },
    {
      name: 'Masuk PBF',
      selector: (row) => row.MasukPbf,
      sortable: true,
    },
    {
      name: 'Kode Pbf ',
      selector: (row) => row.KodePbf,
      sortable: true,
    },
    {
      name: 'Fasilitas Produksi Lainnya',
      selector: (row) => row.FasilitasProduksiLainnya,
      sortable: true,
    },
    {
      name: 'Retur',
      selector: (row) => row.ReturMasuk,
      sortable: true,
    },
    {
      name: 'PBF',
      selector: (row) => row.QtyJualPbf,
      sortable: true,
    },
    {
      name: 'Kode PBF',
      selector: (row) => row.KodeBpom,
      sortable: true,
    },
    {
      name: 'RS',
      selector: (row) => row.RS,
      sortable: true,
    },
    {
      name: 'Apotek',
      selector: (row) => row.APOTEK,
      sortable: true,
    },
    {
      name: 'Puskesmas',
      selector: (row) => row.PUSKESMAS,
      sortable: true,
    },
    {
      name: 'Klinik',
      selector: (row) => row.KLINIK,
      sortable: true,
    },
    {
      name: 'Fasilitas Pengelolaan Kefarmasian',
      selector: (row) => row.SARANA_PEMERINTAH,
      sortable: true,
    },
    {
      name: 'Lembaga Riset',
      selector: (row) => row.LembagaRiset,
      sortable: true,
    },
    {
      name: 'Lembaga Pendidikan',
      selector: (row) => row.LembagaPendidikan,
      sortable: true,
    },
    {
      name: 'Toko Obat',
      selector: (row) => row.TOKO_OBAT,
      sortable: true,
    },
    {
      name: 'HSM',
      selector: (row) => row.HSM,
      sortable: true,
    },
    {
      name: 'Retur',
      selector: (row) => row.ReturKeluar,
      sortable: true,
    },
    {
      name: 'Lainnya',
      selector: (row) => row.Lainnya,
      sortable: true,
    },
    {
      name: 'Pemesanan E-Katalog',
      selector: (row) => row.QtyPesan_E,
      sortable: true,
    },
    {
      name: 'Distribusi E-Katalog',
      selector: (row) => row.QtyKirim_E,
      sortable: true,
    },
    {
      name: 'Pemesanan Non E-Katalog',
      selector: (row) => row.QtyPesan_NonE,
      sortable: true,
    },
    {
      name: 'Distribusi Non E-Katalog',
      selector: (row) => row.QtyKirim_NonE,
      sortable: true,
    },
    {
      name: 'HJA',
      selector: (row) => row.HNA,
      sortable: true,
    },
  ]

  const fetchReportFarmasi = useCallback(async (page, perPage, startDateParam, endDateParam, cabangParam) => {
    console.log('fetchReportFarmasi called with page:', page, 'perPage:', perPage, 'startDate:', startDateParam, 'endDate:', endDateParam, 'cabang:', cabangParam)
    const params = new URLSearchParams()
    params.append('page', page)
    params.append('per_page', perPage)

    if (startDateParam) {
      params.append('start_date', startDateParam)
    }

    if (endDateParam) {
      params.append('end_date', endDateParam)
    }
    if (cabangParam && cabangParam.length) {
      params.append('cabang', cabangParam.join(','))
    }
    
    const response = await axios.get(`${ENDPOINT_URL}farmasi/report?${params.toString()}`)

    return { data: response.data.data, total: response.data.pagination.total }
  }, [])

  const loadDataReportFarmasi = useCallback(async (page, perPage, startDateParam, endDateParam, cabangParam) => {
    setLoading(true)
    setPage(page)
    const fetchData = await fetchReportFarmasi(page, perPage, startDateParam, endDateParam, cabangParam)
    setData(fetchData.data)
    setTotalRows(fetchData.total)
    setLoading(false)
  }, [fetchReportFarmasi])

  const handlePageChange = (page) => {
    loadDataReportFarmasi(page, perPage, startDate, endDate, selectedCabang)
  }

  const convertTriwulanToDateRange = useCallback((triwulan, year) => {
    let start, end
    switch (triwulan) {
      case 'I':
        start = `${year}-01-01 00:00:00`
        end = `${year}-03-31 23:59:59`
        break
      case 'II':
        start = `${year}-04-01 00:00:00`
        end = `${year}-06-30 23:59:59`
        break
      case 'III':
        start = `${year}-07-01 00:00:00`
        end = `${year}-09-30 23:59:59`
        break
      case 'IV':
        start = `${year}-10-01 00:00:00`
        end = `${year}-12-31 23:59:59`
        break
      default:
        start = `${year}-01-01 00:00:00`
        end = `${year}-12-31 23:59:59`
    }
    return { startDate: start, endDate: end }
  }, [])

  const handlePerRowsChange = async (newPerPage, page) => {
    setPerPage(newPerPage)
    loadDataReportFarmasi(page, newPerPage, startDate, endDate, selectedCabang)
  }

  // consolidated loader: run once on mount and whenever perPage/startDate/endDate/cabang change
  useEffect(() => {
    loadDataReportFarmasi(1, perPage, startDate, endDate, selectedCabang)
  }, [perPage, startDate, endDate, selectedCabang, loadDataReportFarmasi])

  // When triwulan or year changes, compute start/end date and reload report
  useEffect(() => {
    const { startDate: s, endDate: e } = convertTriwulanToDateRange(selectedTriwulan, selectedYear)
    setStartDate(s)
    setEndDate(e)
    // startDate/endDate changed; consolidated effect will reload the data
  }, [selectedTriwulan, selectedYear, convertTriwulanToDateRange, loadDataReportFarmasi])

  const loadDataDept = useCallback(async (cabangs) => {
    if (!cabangs || cabangs.length === 0) {
      setNamaCabang('');
      return;
    }
    try {
      const response = await axios.get(`${ENDPOINT_URL}departments/${cabangs.join(',')}`);
      setNamaCabang(response.data.NamaDept);
    } catch (error) {
      console.error('Error loading departments:', error);
      setNamaCabang([]);
    }
  }, []);

  useEffect(() => {
    loadDataDept(selectedCabang);
  }, [selectedCabang, loadDataDept]);

  const exportToExcel = async () => {
    document.body.style.cursor = 'wait';
    try {
      const response = await fetchReportFarmasi(1, 1000000, startDate, endDate, selectedCabang)
      const allData = response.data

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('ReportFarmasi');
      worksheet.mergeCells('A1:AD1');
      worksheet.getCell('A1').value = `PELAPORAN OBAT PERIODE ${selectedTriwulan} ${selectedYear} - PBF PT SATORIA DISTRIBUSI LESTARI(${namaCabang})`;
      worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell('B3').value = 'Kode Obat (NIE)';
      worksheet.mergeCells('B3:B4');
      worksheet.getCell('C3').value = 'Nama Produk';
      worksheet.mergeCells('C3:C4');
      worksheet.getCell('D3').value = 'Produk Kemasan';
      worksheet.mergeCells('D3:D4');
      worksheet.getCell('E3').value = 'Komposisi';
      worksheet.mergeCells('E3:E4');
      worksheet.getCell('F3').value = 'Stok Awal';
      worksheet.mergeCells('F3:F4');
      worksheet.getCell('G3').value = 'Jumlah Pemasukan';
      worksheet.mergeCells('G3:L3'); // Merge for "Jumlah Pemasukan" across subheaders
      worksheet.getCell('M3').value = 'Jumlah Pengeluaran';
      worksheet.mergeCells('M3:Y3'); // Merge for "Jumlah Pengeluaran" across subheaders
      worksheet.getCell('Z3').value = 'Transaksi melalui E-Katalog';
      worksheet.mergeCells('Z3:AA3'); // Merge for "Jumlah Pengeluaran" across subheaders
      worksheet.getCell('AB3').value = 'Transaksi non E-Katalog';
      worksheet.mergeCells('AB3:AC3'); // Merge for "Transaksi melalui E-Katalog" across subheaders
      worksheet.getCell('AD3').value = 'HJD'; // Assuming 21 columns A-U, V for HJD
      worksheet.mergeCells('AD3:AD4');

      worksheet.getCell('G4').value = 'IF';
      worksheet.getCell('H4').value = 'Kode IF';
      worksheet.getCell('I4').value = 'PBF';
      worksheet.getCell('J4').value = 'Kode PBF';
      worksheet.getCell('K4').value = 'Fasilitas Produksi Lainnya';
      worksheet.getCell('L4').value = 'Retur';

      worksheet.getCell('M4').value = 'PBF';
      worksheet.getCell('N4').value = 'Kode PBF';
      worksheet.getCell('O4').value = 'RS';
      worksheet.getCell('P4').value = 'Apotek';
      worksheet.getCell('Q4').value = 'Puskesmas';
      worksheet.getCell('R4').value = 'Klinik';
      worksheet.getCell('S4').value = 'Fasilitas Pengelolaan Kefarmasian';
      worksheet.getCell('T4').value = 'Lembaga Riset';
      worksheet.getCell('U4').value = 'Lembaga Pendidikan';
      worksheet.getCell('V4').value = 'Toko Obat';
      worksheet.getCell('W4').value = 'HSM';
      worksheet.getCell('X4').value = 'Retur';
      worksheet.getCell('Y4').value = 'Lainnya';
      worksheet.getCell('Z4').value = 'Pemesanan';
      worksheet.getCell('AA4').value = 'Distribusi';
      worksheet.getCell('AB4').value = 'Pemesanan';
      worksheet.getCell('AC4').value = 'Distribusi';

      worksheet.getRow(5).values = ['', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,22,23,24,25,26,27,28,29];

      // Urutan harus sama persis dengan header A..AD di atas
      worksheet.columns = [
        { key: 'no', width: 0 },                        // A
        { key: 'Nie', width: 18 },                      // B  Kode Obat (NIE)
        { key: 'NamaItemBpom', width: 30 },             // C  Nama Produk
        { key: 'Kemasan', width: 15 },                  // D  Produk Kemasan
        { key: 'ActiveIngredientName', width: 20 },     // E  Komposisi
        { key: 'StokAwal', width: 15 },                 // F  Stok Awal
        { key: 'MasukIf', width: 12 },                  // G  Pemasukan - IF
        { key: 'KodeIf', width: 12 },                   // H  Pemasukan - Kode IF
        { key: 'MasukPbf', width: 12 },                 // I  Pemasukan - PBF
        { key: 'KodePbf', width: 12 },                  // J  Pemasukan - Kode PBF
        { key: 'FasilitasProduksiLainnya', width: 18 },       // K  Fasilitas Produksi Lainnya
        { key: 'ReturMasuk', width: 12 },               // L  Pemasukan - Retur
        { key: 'QtyJualPbf', width: 12 },               // M  Pengeluaran - PBF
        { key: 'KodeBpom', width: 15 },                 // N  Pengeluaran - Kode PBF
        { key: 'RS', width: 12 },                       // O  RS
        { key: 'APOTEK', width: 12 },                   // P  Apotek
        { key: 'PUSKESMAS', width: 12 },                // Q  Puskesmas
        { key: 'KLINIK', width: 12 },                   // R  Klinik
        { key: 'SARANA_PEMERINTAH', width: 18 },        // S  Fasilitas Pengelolaan Kefarmasian
        { key: 'LembagaRiset', width: 14 },             // T  Lembaga Riset
        { key: 'LembagaPendidikan', width: 16 },        // U  Lembaga Pendidikan
        { key: 'TOKO_OBAT', width: 12 },                // V  Toko Obat
        { key: 'HSM', width: 12 },                      // W  HSM
        { key: 'ReturKeluar', width: 12 },              // X  Pengeluaran - Retur
        { key: 'Lainnya', width: 12 },                  // Y  Lainnya
        { key: 'QtyPesan_E', width: 14 },               // Z  E-Katalog - Pemesanan
        { key: 'QtyKirim_E', width: 14 },       // AA E-Katalog - Distribusi
        { key: 'QtyPesan_NonE', width: 14 },     // AB Non E-Katalog - Pemesanan
        { key: 'QtyKirim_NonE', width: 14 },    // AC Non E-Katalog - Distribusi
        { key: 'HNA', width: 12 },                      // AD HJD
      ];

      // Process data with the same logic as table display
      allData.forEach((row, idx) => {
        const processedRow = {
          no: '',
          Nie: row.Nie,
          NamaItemBpom: row.NamaItemBpom ?? 0,
          Kemasan: row.Kemasan,
          ActiveIngredientName: row.ActiveIngredientName ?? '',
          StokAwal: idx > 0 && row.NamaItemBpom === allData[idx - 1].NamaItemBpom && row.StokAwal === allData[idx - 1].StokAwal ? 0 : row.StokAwal ?? 0,
          MasukIf: idx > 0 && row.NamaItemBpom === allData[idx - 1].NamaItemBpom && row.MasukIf === allData[idx - 1].MasukIf ? 0 : row.MasukIf ?? 0,
          KodeIf: idx > 0 && row.NamaItemBpom === allData[idx - 1].NamaItemBpom && row.KodeIf === allData[idx - 1].KodeIf ? 0 : row.KodeIf ?? 0,
          MasukPbf: idx > 0 && row.NamaItemBpom === allData[idx - 1].NamaItemBpom && row.MasukPbf === allData[idx - 1].MasukPbf ? 0 : row.MasukPbf ?? 0,
          KodePbf: row.KodePbf ?? 0,
          FasilitasProduksiLainnya: '',
          ReturMasuk: idx > 0 && row.NamaItemBpom === allData[idx - 1].NamaItemBpom && row.ReturMasuk === allData[idx - 1].ReturMasuk ? 0 : row.ReturMasuk ?? 0,
          QtyJualPbf: idx > 0 && row.KodeBpom === allData[idx - 1].KodeBpom && row.QtyJualPbf === allData[idx - 1].QtyJualPbf ? 0 : row.QtyJualPbf ?? 0,
          KodeBpom: row.KodeBpom ?? 0,
          RS: idx > 0 && row.NamaItemBpom === allData[idx - 1].NamaItemBpom && row.RS === allData[idx - 1].RS ? 0 : row.RS ?? 0,
          APOTEK: idx > 0 && row.NamaItemBpom === allData[idx - 1].NamaItemBpom && row.APOTEK === allData[idx - 1].APOTEK ? 0 : row.APOTEK ?? 0,
          FasilitasPengelolaanKefarmasian: idx > 0 && row.NamaItemBpom === allData[idx - 1].NamaItemBpom && row.FasilitasPengelolaanKefarmasian === allData[idx - 1].FasilitasPengelolaanKefarmasian ? 0 : row.FasilitasPengelolaanKefarmasian ?? 0,
          PUSKESMAS: idx > 0 && row.NamaItemBpom === allData[idx - 1].NamaItemBpom && row.PUSKESMAS === allData[idx - 1].PUSKESMAS ? 0 : row.PUSKESMAS ?? 0,
          KLINIK: idx > 0 && row.NamaItemBpom === allData[idx - 1].NamaItemBpom && row.KLINIK === allData[idx - 1].KLINIK ? 0 : row.KLINIK ?? 0,
          TOKO_OBAT: idx > 0 && row.NamaItemBpom === allData[idx - 1].NamaItemBpom && row.TOKO_OBAT === allData[idx - 1].TOKO_OBAT ? 0 : row.TOKO_OBAT ?? 0,
          HSM: idx > 0 && row.NamaItemBpom === allData[idx - 1].NamaItemBpom && row.HSM === allData[idx - 1].HSM ? 0 : row.HSM ?? 0,
          ReturKeluar: idx > 0 && row.NamaItemBpom === allData[idx - 1].NamaItemBpom && row.ReturKeluar === allData[idx - 1].ReturKeluar ? 0 : row.ReturKeluar ?? 0,
          Lainnya: idx > 0 && row.NamaItemBpom === allData[idx - 1].NamaItemBpom && row.Lainnya === allData[idx - 1].Lainnya ? 0 : row.Lainnya ?? 0,
          LembagaRiset: '',
          LembagaPendidikan: '',
          QtyPesan_E: idx > 0 && row.NamaItemBpom === allData[idx - 1].NamaItemBpom && row.QtyPesan_E === allData[idx - 1].QtyPesan_E ? 0 : row.QtyPesan_E ?? 0,
          QtyKirim_E: idx > 0 && row.NamaItemBpom === allData[idx - 1].NamaItemBpom && row.QtyKirim_E === allData[idx - 1].QtyKirim_E ? 0 : row.QtyKirim_E ?? 0,
          QtyPesan_NonE: idx > 0 && row.NamaItemBpom === allData[idx - 1].NamaItemBpom && row.QtyPesan_NonE === allData[idx - 1].QtyPesan_NonE ? 0 : row.QtyPesan_NonE ?? 0,
          QtyKirim_NonE: idx > 0 && row.NamaItemBpom === allData[idx - 1].NamaItemBpom && row.QtyKirim_NonE === allData[idx - 1].QtyKirim_NonE ? 0 : row.QtyKirim_NonE ?? 0,
          HNA: Math.round(row.HNA) ?? 0,
        };
        worksheet.addRow(processedRow);
      });

      // Generate and save
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `Report Farmasi Triwulan ${selectedTriwulan} ${selectedYear} .xlsx`);
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

      const response = await fetchReportFarmasi(1, 1000000, startDate, endDate, selectedCabang)
      const allData = response.data

      // Build headers from the shared `column` definition so exports match the table
      const headers = column.map((c) => c.name || '');

      // Prepare table body by evaluating column selectors with the same logic as table display
      const body = [
        headers,
        ...allData.map((row, idx) =>
          column.map((col) => {
            if (col.name === 'No') return idx + 1;
            try {
              if (typeof col.selector === 'function') {
                const value = col.selector(row, idx) ?? 0;

                // Skip the comparison for NamaItemBpom and HNA columns
                if (col.name === 'Nama Obat' || col.name === 'HJA') {
                  return value;
                }

                // For all other columns, apply the same logic as the table
                if (idx > 0 &&
                  row.NamaItemBpom === allData[idx - 1].NamaItemBpom &&
                  value === col.selector(allData[idx - 1], idx - 1)) {
                  return 0;
                }
                return value;
              }
              return '';
            } catch (e) {
              return '';
            }
          })
        ),
      ];

      const docDefinition = {
        content: [
          {
            text: 'Laporan Report Farmasi',
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

      pdfMake.createPdf(docDefinition).download('Report Farmasi dari ' + formatDateToDDMMYYYY(startDate) + ' sampai ' + formatDateToDDMMYYYY(endDate) + '.pdf');
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
            <CCardHeader>Data ReportFarmasi
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
                  <CCol xs={12} sm={3} className='d-grid'>
                    <CabangSelector onSelect={(items) => setSelectedCabang(items)} />
                  </CCol>
                  <CCol xs={12} sm={2} className='d-grid'>
                    <CFormSelect value={selectedTriwulan} onChange={(e) => setSelectedTriwulan(e.target.value)}>
                      <option value="I">Triwulan I</option>
                      <option value="II">Triwulan II</option>
                      <option value="III">Triwulan III</option>
                      <option value="IV">Triwulan IV</option>
                    </CFormSelect>
                  </CCol>
                  <CCol xs={12} sm={2} className='d-grid'>
                    <CFormSelect value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}>
                      {(() => {
                        const start = 2025
                        const end = new Date().getFullYear() + 5
                        const options = []
                        for (let y = start; y <= end; y++) options.push(<option key={y} value={y}>{y}</option>)
                        return options
                      })()}
                    </CFormSelect>
                  </CCol>
                </CRow>
              </div>

              <div className="table-responsive">
                <CTable hover striped bordered>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">NIE</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Nama Obat</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Kemasan</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Stok Awal</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Masuk IF</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Kode IF</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Masuk PBF</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Kode PBF</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Retur</CTableHeaderCell>
                      <CTableHeaderCell scope="col">PBF</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Kode PBF</CTableHeaderCell>
                      <CTableHeaderCell scope="col">RS</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Apotek</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Sarana Pemerintah</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Puskesmas</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Klinik</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Toko Obat</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Kemenkes</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Retur</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Lainnya</CTableHeaderCell>
                      <CTableHeaderCell scope="col">HJA</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {data.map((item, index) => (
                      <CTableRow key={item.Nie}>
                        <CTableDataCell>
                          {item.Nie}
                        </CTableDataCell>
                        <CTableDataCell>{item.NamaItemBpom}</CTableDataCell>
                        <CTableDataCell>
                          {item.Kemasan}
                        </CTableDataCell>
                        <CTableDataCell>
                          {index > 0 && item.NamaItemBpom === data[index - 1].NamaItemBpom && item.StokAwal === data[index - 1].StokAwal ? 0 : item.StokAwal ?? 0}
                        </CTableDataCell>
                        <CTableDataCell>
                          {index > 0 && item.NamaItemBpom === data[index - 1].NamaItemBpom && item.MasukIf === data[index - 1].MasukIf ? 0 : item.MasukIf ?? 0}
                        </CTableDataCell>
                        <CTableDataCell>
                          {index > 0 && item.NamaItemBpom === data[index - 1].NamaItemBpom && item.KodeIf === data[index - 1].KodeIf ? 0 : item.KodeIf ?? 0}
                        </CTableDataCell>
                        <CTableDataCell>
                          {index > 0 && item.NamaItemBpom === data[index - 1].NamaItemBpom && item.MasukPbf === data[index - 1].MasukPbf ? 0 : item.MasukPbf ?? 0}
                        </CTableDataCell>
                        <CTableDataCell>
                          {index > 0 && item.NamaItemBpom === data[index - 1].NamaItemBpom && item.KodePbf === data[index - 1].KodePbf ? 0 : item.KodePbf ?? 0}
                        </CTableDataCell>
                        <CTableDataCell>
                          {index > 0 && item.NamaItemBpom === data[index - 1].NamaItemBpom && item.ReturMasuk === data[index - 1].ReturMasuk ? 0 : item.ReturMasuk ?? 0}
                        </CTableDataCell>
                        <CTableDataCell>
                          {index > 0 && item.NamaItemBpom === data[index - 1].NamaItemBpom && item.QtyJualPbf === data[index - 1].QtyJualPbf ? 0 : item.QtyJualPbf ?? 0}
                        </CTableDataCell>
                        <CTableDataCell>
                          {index > 0 && item.NamaItemBpom === data[index - 1].NamaItemBpom && item.KodeBpom === data[index - 1].KodeBpom ? 0 : item.KodeBpom ?? 0}
                        </CTableDataCell>
                        <CTableDataCell>
                          {index > 0 && item.NamaItemBpom === data[index - 1].NamaItemBpom && item.RS === data[index - 1].RS ? 0 : item.RS ?? 0}
                        </CTableDataCell>
                        <CTableDataCell>
                          {index > 0 && item.NamaItemBpom === data[index - 1].NamaItemBpom && item.APOTEK === data[index - 1].APOTEK ? 0 : item.APOTEK ?? 0}
                        </CTableDataCell>
                        <CTableDataCell>
                          {index > 0 && item.NamaItemBpom === data[index - 1].NamaItemBpom && item.SARANA_PEMERINTAH === data[index - 1].SARANA_PEMERINTAH ? 0 : item.SARANA_PEMERINTAH ?? 0}
                        </CTableDataCell>
                        <CTableDataCell>
                          {index > 0 && item.NamaItemBpom === data[index - 1].NamaItemBpom && item.PUSKESMAS === data[index - 1].PUSKESMAS ? 0 : item.PUSKESMAS ?? 0}
                        </CTableDataCell>
                        <CTableDataCell>
                          {index > 0 && item.NamaItemBpom === data[index - 1].NamaItemBpom && item.KLINIK === data[index - 1].KLINIK ? 0 : item.KLINIK ?? 0}
                        </CTableDataCell>
                        <CTableDataCell>
                          {index > 0 && item.NamaItemBpom === data[index - 1].NamaItemBpom && item.TOKO_OBAT === data[index - 1].TOKO_OBAT ? 0 : item.TOKO_OBAT ?? 0}
                        </CTableDataCell>
                        <CTableDataCell>
                          {index > 0 && item.NamaItemBpom === data[index - 1].NamaItemBpom && item.KEMENKES === data[index - 1].KEMENKES ? 0 : item.KEMENKES ?? 0}
                        </CTableDataCell>
                        <CTableDataCell>
                          {index > 0 && item.NamaItemBpom === data[index - 1].NamaItemBpom && item.ReturKeluar === data[index - 1].ReturKeluar ? 0 : item.ReturKeluar ?? 0}
                        </CTableDataCell>
                        <CTableDataCell>
                          {index > 0 && item.NamaItemBpom === data[index - 1].NamaItemBpom && item.Lainnya === data[index - 1].Lainnya ? 0 : item.Lainnya ?? 0}
                        </CTableDataCell>
                        <CTableDataCell>
                          {item.HNA ?? 0}
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>

              <div className="d-flex justify-content-between mt-3">
                <div>
                  <CPagination>
                    <CPaginationItem
                      disabled={page === 1}
                      onClick={() => handlePageChange(1)}
                    >
                      First
                    </CPaginationItem>
                    <CPaginationItem
                      disabled={page === 1}
                      onClick={() => handlePageChange(page - 1)}
                    >
                      Previous
                    </CPaginationItem>
                    {[...Array(totalRows ? Math.ceil(totalRows / perPage) : 1)].map((_, index) => (
                      <CPaginationItem
                        key={index}
                        active={page === index + 1}
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </CPaginationItem>
                    ))}
                    <CPaginationItem
                      disabled={page === Math.ceil(totalRows / perPage)}
                      onClick={() => handlePageChange(page + 1)}
                    >
                      Next
                    </CPaginationItem>
                    <CPaginationItem
                      disabled={page === Math.ceil(totalRows / perPage)}
                      onClick={() => handlePageChange(Math.ceil(totalRows / perPage))}
                    >
                      Last
                    </CPaginationItem>
                  </CPagination>
                </div>
                <div>
                  <CFormSelect
                    className="w-auto"
                    onChange={(e) => handlePerRowsChange(parseInt(e.target.value, 10), page)}
                    value={perPage}
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="30">30</option>
                    <option value="50">50</option>
                  </CFormSelect>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default ReportFarmasi
