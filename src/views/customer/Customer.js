import { useEffect, useState } from 'react'

import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'
import { useNavigate } from 'react-router-dom'

import { DataTable } from 'src/components'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'
const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const Customer = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  const handleEdit = (customerId) => {
    navigate(`/customer/${customerId}/edit`)
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
          <button
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
          </button>
        </div>
      ),
      ignoreRowClick: true, // Penting agar klik pada tombol tidak memicu event klik baris
      // allowOverflow: true, // Memungkinkan konten meluap jika diperlukan
      // button: 'true', // Mengindikasikan bahwa ini adalah kolom tombol
      width: '12%', // Sesuaikan lebar kolom jika diperlukan
    },
  ]

  const fetchCustomers = async (page) => {
    setLoading(true)
    setPage(page)

    const response = await axios.get(`${ENDPOINT_URL}customers?page=${page}&per_page=${perPage}`)

    setData(response.data.data)
    setTotalRows(response.data.pagination.total)
    setLoading(false)
  }

  const handlePageChange = (page) => {
    fetchCustomers(page)
  }

  const handlePerRowsChange = async (newPerPage, page) => {
    setLoading(true)

    const response = await axios.get(`${ENDPOINT_URL}customers?page=${page}&per_page=${newPerPage}`)

    setData(response.data.data)
    setPerPage(newPerPage)
    setLoading(false)
  }

  useEffect(() => {
    fetchCustomers(1) // fetch page 1 of users
  }, [])

  return (
    <>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Data Customers</CCardHeader>
            <CCardBody>
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
