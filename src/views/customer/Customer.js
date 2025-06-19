import { useEffect, useState } from 'react'

import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
} from '@coreui/react'

import { DataTable } from 'src/components';
import axios from 'axios'
const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const Customer = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const column=[
    {
      name: 'No',
      selector: (row, index) => (page - 1) * perPage + index + 1,
      sortable: true,
    },
    {
      name: 'Kode Customer',
      selector: row => row.KodeLgn,
      sortable: true,
    },
    {
      name: 'Nama Customer',
      selector: row => row.NamaLgn,
      sortable: true,
    },
  ]

  const fetchCustomers = async page => {
    setLoading(true);
    setPage(page);

    const response = await axios.get(`${ENDPOINT_URL}customers?page=${page}&per_page=${perPage}`);

    setData(response.data.data);
    setTotalRows(response.data.pagination.total);
    setLoading(false);
  };

  const handlePageChange = page => {
    fetchCustomers(page);
  };

  const handlePerRowsChange = async (newPerPage, page) => {
    setLoading(true);

    const response = await axios.get(`${ENDPOINT_URL}customers?page=${page}&per_page=${newPerPage}`);

    setData(response.data.data);
    setPerPage(newPerPage);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers(1); // fetch page 1 of users

  }, []);

  return (
    <>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Data Customers</CCardHeader>
            <CCardBody>
              <DataTable
                title="Customers List"
                columns={column}
                data={data}
                progressPending={loading}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                onChangeRowsPerPage={handlePerRowsChange}
                onChangePage={handlePageChange}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Customer
