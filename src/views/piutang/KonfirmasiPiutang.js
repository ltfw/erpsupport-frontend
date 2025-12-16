import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CButton,
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormSelect,
  CFormInput,
} from '@coreui/react';
import axios from 'axios';
import CabangSelector from '../modals/CabangSelector';
import CIcon from '@coreui/icons-react';
import { cilDescription } from '@coreui/icons';
import Pagination from '../../components/Pagination';
import { formatRupiah } from '../../utils/Number';

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL;

const KonfirmasiPiutang = () => {
  // Persisted filter states
  const [search, setSearch] = useState(() => {
    const saved = localStorage.getItem('konfirmasiPiutang_search');
    return saved || '';
  });

  const [page, setPage] = useState(() => {
    const saved = localStorage.getItem('konfirmasiPiutang_page');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [perPage, setPerPage] = useState(() => {
    const saved = localStorage.getItem('konfirmasiPiutang_perPage');
    return saved ? parseInt(saved, 10) : 10;
  });

  const [selectedCabang, setSelectedCabang] = useState(() => {
    const saved = localStorage.getItem('konfirmasiPiutang_cabang');
    return saved ? JSON.parse(saved) : [];
  });

  const [customerList, setCustomerList] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  // Stable callback for cabang selection
  const handleCabangSelect = useCallback((items) => {
    setSelectedCabang((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(items)) {
        return prev; // prevent re-render loop
      }

      localStorage.setItem('konfirmasiPiutang_cabang', JSON.stringify(items));
      localStorage.setItem('konfirmasiPiutang_page', '1');
      setPage(1);

      return items;
    });
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    localStorage.setItem('konfirmasiPiutang_page', newPage.toString());
  }, []);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearch(value);
    localStorage.setItem('konfirmasiPiutang_search', value);
    setPage(1);
    localStorage.setItem('konfirmasiPiutang_page', '1');
  }, []);

  const handlePerPageChange = useCallback((e) => {
    const newPerPage = parseInt(e.target.value, 10);
    setPerPage(newPerPage);
    localStorage.setItem('konfirmasiPiutang_perPage', newPerPage.toString());
    setPage(1);
    localStorage.setItem('konfirmasiPiutang_page', '1');
  }, []);

  // Fetch data whenever page, perPage, search, or selectedCabang changes
  // We use a ref to track previous values and avoid unnecessary fetches
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('per_page', perPage);
      if (search.trim()) params.append('search', search.trim());
      if (selectedCabang.length > 0) {
        // Adjust this line based on your backend expectation
        // If backend expects cabang IDs as strings/numbers:
        const cabangValues = selectedCabang.map(item =>
          typeof item === 'object' ? item.id || item.value || item : item
        );
        params.append('cabang', cabangValues.join(','));
      }

      try {
        const response = await axios.get(
          `${ENDPOINT_URL}piutang/konfirmasipiutang?${params.toString()}`
        );

        if (mounted) {
          setCustomerList(response.data.data || []);
          setTotalPages(response.data.pagination?.totalPages || 1);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        if (mounted) {
          setCustomerList([]);
          setTotalPages(1);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [page, perPage, search, selectedCabang]); 

  return (
    <>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Data Customers</CCardHeader>
            <CCardBody>
              <CRow className="g-1 mb-3">
                <CCol xs={12} sm={2} className="d-grid">
                  <CabangSelector onSelect={handleCabangSelect} />
                </CCol>
              </CRow>

              <CRow className="g-1 mb-3">
                <CCol xs={1}>
                  <CFormSelect value={perPage} onChange={handlePerPageChange}>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="10000">All</option>
                  </CFormSelect>
                </CCol>
                <CCol xs={11}>
                  <CFormInput
                    type="text"
                    placeholder="Search Customer..."
                    value={search}
                    onChange={handleSearchChange}
                  />
                </CCol>
              </CRow>

              <CTable hover striped bordered>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">No</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Nama Cabang</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Kode Customer</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Nama Customer</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Badan Usaha</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Salesman</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Nominal Piutang</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {customerList.map((item, idx) => (
                    <CTableRow key={item.CustomerId}>
                      <CTableDataCell>
                        {idx + 1 + (page - 1) * perPage}
                      </CTableDataCell>
                      <CTableDataCell>{item.NamaDept}</CTableDataCell>
                      <CTableDataCell>{item.KodeLgn}</CTableDataCell>
                      <CTableDataCell>{item.NamaLgn}</CTableDataCell>
                      <CTableDataCell>{item.BusinessEntityName}</CTableDataCell>
                      <CTableDataCell>{item.NamaSales}</CTableDataCell>
                      <CTableDataCell className="text-end">
                        {formatRupiah(item.nominal)}
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CButton
                          color="primary"
                          size="sm"
                          onClick={() =>
                            navigate(`/piutang/konfirmasipiutang/${item.CustomerId}/print`)
                          }
                        >
                          <CIcon icon={cilDescription} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              <div className="d-flex justify-content-between mt-3">
                <div>
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    setPage={handlePageChange}
                  />
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  );
};

export default KonfirmasiPiutang;