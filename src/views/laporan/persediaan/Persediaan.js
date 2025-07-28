import { useEffect, useState } from 'react'

import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'
import { useNavigate } from 'react-router-dom'

import { DataTable } from 'src/components'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPrint, cilTrash } from '@coreui/icons'
const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const Persediaan = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

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

  return (
    <>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Data Customers</CCardHeader>
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

export default Persediaan
