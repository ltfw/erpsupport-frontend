import { useEffect, useState } from 'react'

import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'
import { useNavigate } from 'react-router-dom'

import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { DataTable } from 'src/components'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPrint, cilSpreadsheet, cilTrash } from '@coreui/icons'
import FilterReport from '../../modals/FilterReport'
const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const Penjualan = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

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
  ];

  const fetchSales = async (page, keyword = search) => {
    setLoading(true)
    setPage(page)

    const response = await axios.get(
      `${ENDPOINT_URL}sales?page=${page}&per_page=${perPage}&search=${encodeURIComponent(keyword)}`,
    )

    setData(response.data.data)
    setTotalRows(response.data.pagination.total)
    setLoading(false)
  }

  const handlePageChange = (page) => {
    fetchSales(page)
  }

  const handlePerRowsChange = async (newPerPage, page) => {
    setLoading(true)

    const response = await axios.get(
      `${ENDPOINT_URL}sales?page=${page}&per_page=${newPerPage}&search=${encodeURIComponent(search)}`,
    )

    setData(response.data.data)
    setPerPage(newPerPage)
    setLoading(false)
  }

  useEffect(() => {
    fetchSales(1) // fetch page 1 of users
  }, [])

  const exportToExcel = async () => {
    try {
      // Fetch all data (adjust per_page or use a special endpoint if needed)
      const response = await axios.get(
        `${ENDPOINT_URL}sales?page=1&per_page=1000000&search=${encodeURIComponent(search)}`
      );
      const allData = response.data.data;

      // Create workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sales');

      // Add title in the first row
      worksheet.mergeCells('A1:AJ1'); // Adjust 'AJ' to the last column you have
      worksheet.getCell('A1').value = 'Laporan Penjualan';
      worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell('A1').font = { size: 16, bold: true };


      // Define columns
      worksheet.columns = [
        { header: 'No', key: 'no', width: 6 },
        { header: 'Cabang', key: 'NamaDept', width: 15 },
        { header: 'Kepala Cabang', key: 'KepalaCabang', width: 18 },
        { header: 'Area', key: 'KodeWil', width: 10 },
        { header: 'Salesman', key: 'NamaSales', width: 15 },
        { header: 'Supervisor', key: 'NamaSpv', width: 15 },
        { header: 'Rayon', key: 'RayonName', width: 15 },
        { header: 'Tgl Faktur', key: 'TglFaktur', width: 15 },
        { header: 'No Faktur', key: 'NoBukti', width: 15 },
        { header: 'Group Customer', key: 'CustomerGroupName', width: 18 },
        { header: 'Badan Usaha', key: 'BusinessEntityName', width: 18 },
        { header: 'Kode Customer', key: 'KodeLgn', width: 15 },
        { header: 'Nama Customer', key: 'NamaLgn', width: 18 },
        { header: 'Alamat', key: 'Alamat1', width: 20 },
        { header: 'Kode Item', key: 'KodeItem', width: 15 },
        { header: 'Nama Item', key: 'NamaBarang', width: 18 },
        { header: 'Supplier', key: 'NamaSupplier', width: 15 },
        { header: 'Nama Business Centre', key: 'BusinessCentreName', width: 20 },
        { header: 'HNA', key: 'Hna1', width: 10 },
        { header: 'Qty', key: 'Qty', width: 8 },
        { header: 'Satuan', key: 'SatuanNs', width: 10 },
        { header: 'Value HNA', key: 'ValueHNA', width: 15 },
        { header: 'Value Nett', key: 'ValueNett', width: 15 },
        { header: 'Total Value Disc', key: 'TotalValueDisc', width: 18 },
        { header: 'Value Disc Distributor', key: 'ValueDiscDist', width: 20 },
        { header: 'Value Disc Principle', key: 'ValueDiscPrinc', width: 20 },
        { header: 'Total Disc %', key: 'TotalDiscPsn', width: 15 },
        { header: 'Disc Dist %', key: 'DiscDistPsn', width: 15 },
        { header: 'Disc Princ %', key: 'DiscPrincPsn', width: 15 },
        { header: 'Batch Number', key: 'BatchNumber', width: 15 },
        { header: 'Tgl Expired', key: 'TglExpired', width: 15 },
        { header: 'Province', key: 'Province', width: 15 },
        { header: 'Regency', key: 'Regency', width: 15 },
        { header: 'District', key: 'District', width: 15 },
        { header: 'Village', key: 'Village', width: 15 },
        { header: 'Tipe Jual', key: 'TipeJual', width: 12 },
        { header: 'NoSP', key: 'PoLanggan', width: 15 },
        { header: 'Kode Promosi', key: 'PromotionCode', width: 15 },
      ];

      // Add rows
      allData.forEach((row, idx) => {
        worksheet.addRow({
          no: idx + 1,
          ...row,
        });
      });

      // Generate buffer and save
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), 'sales_all.xlsx');
    } catch (error) {
      alert('Gagal mengunduh data!');
    }
  }

  const [showFilterModal, setShowFilterModal] = useState(false);

  return (
    <>
      <FilterReport
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onExport={exportToExcel} // Call exportToExcel from modal if needed
      />
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Data Sales
              <button
                className="btn btn-success btn-sm float-end text-white"
                onClick={() => setShowFilterModal(true)}
                type="button"
                style={{ marginLeft: 8 }}
              >
                <CIcon icon={cilSpreadsheet} className="me-2" />
                Export Excel
              </button></CCardHeader>
            <CCardBody>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or code"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    fetchSales(1, e.target.value) // reset to page 1 on search
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
