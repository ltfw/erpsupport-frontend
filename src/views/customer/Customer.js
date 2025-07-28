import { useEffect, useState } from 'react'
import { getCurrentDateFormatted, formatDateToDDMMYYYY } from '../../utils/Date'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { CCard, CCardBody, CCardHeader, CCol, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CRow } from '@coreui/react'
import { useNavigate } from 'react-router-dom'

import { DataTable } from 'src/components'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPrint, cilSpreadsheet, cilTrash } from '@coreui/icons'
const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const Customer = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  // const handleEdit = (customerId) => {
  //   navigate(`/customer/${customerId}/edit`)
  // }

  const handlePrint = (customerId) => {
    navigate(`/customer/${customerId}/print`)
  }

  const column = [
    {
      name: 'No',
      selector: (row, index) => (page - 1) * perPage + index + 1,
      sortable: true,
      width: '6%',
    },
    {
      name: 'Kode Customer',
      selector: (row) => row.KodeLgn,
      sortable: true,
    },
    {
      name: 'Nama Customer',
      selector: (row) => row.NamaLgn,
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
      name: 'Cabang',
      selector: (row) => row.NamaDept,
      sortable: true,
    },
    {
      name: 'Salesman',
      selector: (row) => row.NamaSales,
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
      name: 'Aksi', // Nama kolom
      cell: (row) => (
        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          {/* <button
            onClick={() => handleEdit(row.CustomerId)}
            className="btn btn-info text-white"
            size="sm"
          >
            <CIcon icon={cilPencil} size="sm" />
          </button>
          <button
            onClick={() => handleDelete(row.CustomerId)}
            className="btn btn-danger text-white"
            size="sm"
          >
            <CIcon icon={cilTrash} size="sm" />
          </button> */}
          <button
            onClick={() => handlePrint(row.CustomerId)}
            className="btn btn-info text-white"
            size="sm"
          >
            <CIcon icon={cilPrint} size="sm" />
          </button>
        </div>
      ),
      ignoreRowClick: true, // Penting agar klik pada tombol tidak memicu event klik baris
      // allowOverflow: true, // Memungkinkan konten meluap jika diperlukan
      // button: 'true', // Mengindikasikan bahwa ini adalah kolom tombol
      width: '12%', // Sesuaikan lebar kolom jika diperlukan
    },
  ]

  const fetchCustomers = async (page, keyword = search) => {
    setLoading(true)
    setPage(page)

    const response = await axios.get(
      `${ENDPOINT_URL}customers?page=${page}&per_page=${perPage}&search=${encodeURIComponent(keyword)}`,
    )

    setData(response.data.data)
    setTotalRows(response.data.pagination.total)
    setLoading(false)
  }

  const handlePageChange = (page) => {
    fetchCustomers(page)
  }

  const handlePerRowsChange = async (newPerPage, page) => {
    setLoading(true)

    const response = await axios.get(
      `${ENDPOINT_URL}customers?page=${page}&per_page=${newPerPage}&search=${encodeURIComponent(search)}`,
    )

    setData(response.data.data)
    setPerPage(newPerPage)
    setLoading(false)
  }

  useEffect(() => {
    fetchCustomers(1) // fetch page 1 of users
  }, [])


  const exportToExcel = async () => {
    document.body.style.cursor = 'wait';
    try {
      const response = await axios.get(
        `${ENDPOINT_URL}customers/export`,
      )
      const allData = response.data.data;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Customer Data');

      // Row 2: Title
      worksheet.mergeCells('A2:AL2');
      worksheet.getCell('A2').value = 'Laporan Customer';
      worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell('A2').font = { size: 16, bold: true };
      worksheet.mergeCells('A3:AL3');
      worksheet.getCell('A3').value = 'Update ' + formatDateToDDMMYYYY(getCurrentDateFormatted());
      worksheet.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell('A3').font = { size: 16, bold: true };

      // Set column widths only (DO NOT use headers here!)
      worksheet.columns = [
        { key: 'no', width: 6 },
        { key: 'Nama Cabang', width: 15 },
        { key: 'Kode Customer', width: 15 },
        { key: 'Nama Customer', width: 15 },
        { key: 'Kredit Limit', width: 15 },
        { key: 'TOP', width: 15 },
        { key: 'Kode Customer BPOM', width: 15 },
        { key: 'Nama Customer BPOM', width: 15 },
        { key: 'Nama Customer KEMENKES', width: 15 },
        { key: 'Nama Customer KEMENKES', width: 15 },
        { key: 'Badan Usaha', width: 15 },
        { key: 'Customer Group', width: 15 },
        { key: 'Tgl Registrasi', width: 15 },
        { key: 'Tgl Update', width: 15 },
        { key: 'Nama Pemilik', width: 15 },
        { key: 'CP', width: 15 },
        { key: 'Tipe Identitas', width: 15 },
        { key: 'No Identitas', width: 15 },
        { key: 'TKUId', width: 15 },
        { key: 'Kode Pajak', width: 15 },
        { key: 'Status Customer', width: 15 },
        { key: 'Alamat', width: 15 },
        { key: 'Rayon', width: 15 },
        { key: 'Provinsi', width: 15 },
        { key: 'Kota/Kabupaten', width: 15 },
        { key: 'Kecamatan', width: 15 },
        { key: 'Desa/Kelurahan', width: 15 },
        { key: 'Kode Pos', width: 15 },
        { key: 'Salesman', width: 15 },
        { key: 'Latitude', width: 15 },
        { key: 'Longitude', width: 15 },
        { key: 'Lokasi Customer', width: 15 },
        { key: 'Npwp', width: 15 },
        { key: 'NpwpOwner', width: 15 },
        { key: 'Pkp', width: 15 },
        { key: 'AlamatPajak', width: 15 },
        { key: 'Tipe PPn', width: 15 },
        { key: 'URL', width: 15 },
      ];

      // Row 3: Write headers manually
      worksheet.addRow([
        'No', 'Nama Cabang', 'Kode Customer', 'Nama Customer', 'Kredit Limit', 'TOP', 
        'Kode Customer BPOM', 'Nama Customer BPOM', 'Nama Customer KEMENKES', 
        'Nama Customer KEMENKES', 'Badan Usaha', 'Customer Group', 
        'Tgl Registrasi', 'Tgl Update', 'Nama Pemilik', 'CP', 'Tipe Identitas', 
        'No Identitas', 'TKUId', 'Kode Pajak', 'Status Customer', 'Alamat', 
        'Rayon', 'Provinsi', 'Kota/Kabupaten', 'Kecamatan', 'Desa/Kelurahan', 
        'Kode Pos', 'Salesman', 'Latitude', 'Longitude', 'Lokasi Customer', 
        'Npwp', 'NpwpOwner', 'Pkp', 'AlamatPajak', 'Tipe PPn', 'URL'
      ]);

      // Row 4+: Add data
      allData.forEach((row, idx) => {
        worksheet.addRow({
          no: idx + 1,
          ...row,
        });
      });

      // Optional: Freeze title and header
      worksheet.views = [{ state: 'frozen', ySplit: 4 }];

      worksheet.autoFilter = {
        from: 'A4',
        to: 'AL4',
      };

      // Generate and save
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), 'Customer per '+ getCurrentDateFormatted() +'.xlsx');
    } catch (error) {
      alert('Gagal mengunduh data!');
      console.error('Error exporting to Excel:', error);
    } finally {
      document.body.style.cursor = 'default';
    }
  }

  return (
    <>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Data Customers
              <CDropdown className='float-end'>
                <CDropdownToggle color="warning" size='sm' >Export</CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem onClick={exportToExcel}><CIcon icon={cilSpreadsheet} className="me-2" />Excel</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </CCardHeader>
            <CCardBody>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or code"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    fetchCustomers(1, e.target.value) // reset to page 1 on search
                  }}
                />
              </div>

              <DataTable
                dense
                title="Customers List"
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

export default Customer
