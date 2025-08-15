import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import { toast, ToastContainer } from 'react-toastify';
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CFormInput,
  CFormCheck,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CPagination,
  CPaginationItem,
  CRow,
  CFormSelect,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
} from '@coreui/react'
import axios from 'axios'

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const RekualifikasiAdd = () => {
  const [customerData, setCustomerData] = useState([])
  const [rayonOptions, setRayonOptions] = useState([])
  const [selectedRayon, setSelectedRayon] = useState(null)
  const [groupOptions, setGroupOptions] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)

  const fetchRayonCustomer = async () => {

    const params = new URLSearchParams()

    if (selectedRayon) {
      params.append('rayon', selectedRayon.value)
      console.log('selectedRayon', selectedRayon.value)
    }

    if (selectedGroup) {
      params.append('group', selectedGroup.map(item => item.value).join(','))
    }

    // console.log('params', selectedGroup.map(item => item.value).join(','))

    const response = await axios.get(
      `${ENDPOINT_URL}customers/rayoncustomer?${params.toString()}`
    )
    const dataWithDefaults = response.data.data.map(item => ({
      ...item,
      BawaSalesman: item.BawaSalesman || false,
      SudahBalik: item.SudahBalik || false,
      SudahUpdate: item.SudahUpdate || false,
      SudahLengkap: item.SudahLengkap || false,
    }))
    console.log('dataWithDefaults', dataWithDefaults)
    console.log('First item:', dataWithDefaults[0]) // Log the first item specifically
    setCustomerData(dataWithDefaults)
  }

  const fetchSalesman = async () => {
    const response = await axios.get(
      `${ENDPOINT_URL}others/rayonsalesman`
    )
    const options = response.data.data.map(item => ({
      value: item.RayonCode,
      label: item.RayonCode + ' - ' + item.NamaSales
    }))
    setRayonOptions(options)
  }

  const fetchGroup = async () => {
    const response = await axios.get(
      `${ENDPOINT_URL}others/customergroups`
    )
    const options = response.data.data.map(item => ({
      value: item.CustomerGroupId,
      label: item.CustomerGroupCode + ' - ' + item.CustomerGroupName
    }))

    // Add "All Group" at the beginning
    options.unshift({
      value: '',
      label: 'All Group'
    })

    setGroupOptions(options)
  }

  const handleSave = async () => {
    try {
      console.log('Saving customerData:', customerData)
      await axios.post(`${ENDPOINT_URL}customers/rayoncustomer`, {
        header: {
          KodeDept: customerData[0].KodeDept,
          RayonName: customerData[0].RayonName,
          NamaSales: customerData[0].NamaSales,
        },
        detail: customerData,
      });
      toast.success('Data saved successfully')
      // setCustomerData([]) 
      // navigate(-1)
    } catch (err) {
      console.error(err);
      toast.error('Failed to save data');
    }
  }

  useEffect(() => {
    fetchSalesman()
    fetchGroup()
  }, [])

  return (
    <>
      <ToastContainer />
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Form Rekualifikasi Control</CCardHeader>
            <CCardBody>
              <CRow className="g-1 mb-3">
                <CCol xs={4}>
                  <Select
                    options={rayonOptions}
                    value={selectedRayon}
                    onChange={setSelectedRayon}
                  />
                </CCol>
                <CCol xs={4}>
                  <Select
                    options={groupOptions}
                    value={selectedGroup}
                    onChange={setSelectedGroup}
                    isMulti
                  />
                </CCol>
                <CCol xs={2} className="d-grid gap-2">
                  <CButton
                    color="info"
                    onClick={fetchRayonCustomer}
                  >
                    Load Data
                  </CButton>
                </CCol>
                <CCol xs={2} className="d-grid gap-2">
                  <CButton
                    color="primary"
                    onClick={handleSave}
                  >
                    Save Data
                  </CButton>
                </CCol>
              </CRow>
              <CRow className="g-1 mb-3">
                <CCol xs={12}>
                  <div style={{ fontSize: 12 }}>
                    <CTable striped bordered hover responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell scope="col">Cabang</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Rayon</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Salesman</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Kode Customer</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Nama Customer</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Badan Usaha</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Customer Group</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Dibawa Salesman</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Sudah Dikembalikan</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Sudah Update</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Dokumen Sudah Lengkap / Tidak Ada Perubahan</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {customerData.map((item, idx) => (
                          <CTableRow key={idx}>
                            <CTableDataCell>{item.NamaDept}</CTableDataCell>
                            <CTableDataCell>{item.RayonName}</CTableDataCell>
                            <CTableDataCell>{item.NamaSales}</CTableDataCell>
                            <CTableDataCell>{item.KodeLgn}</CTableDataCell>
                            <CTableDataCell>{item.NamaLgn}, {item.BusinessEntityName}</CTableDataCell>
                            <CTableDataCell>{item.BusinessEntityName}</CTableDataCell>
                            <CTableDataCell>{item.CustomerGroupName}</CTableDataCell>
                            <CTableDataCell>
                              <CFormCheck
                                onChange={(e) => {
                                  console.log('e.target.checked', e.target.checked);

                                  const updatedData = [...customerData]
                                  updatedData[idx].BawaSalesman = e.target.checked
                                  setCustomerData(updatedData)
                                }}
                                checked={customerData[idx].BawaSalesman || false}
                              />
                            </CTableDataCell>
                            <CTableDataCell>
                              <CFormCheck
                                onChange={(e) => {
                                  const updatedData = [...customerData]
                                  updatedData[idx].SudahBalik = e.target.checked
                                  setCustomerData(updatedData)
                                }}
                                checked={customerData[idx].SudahBalik || false}
                              />
                            </CTableDataCell>
                            <CTableDataCell>
                              <CFormCheck
                                onChange={(e) => {
                                  const updatedData = [...customerData]
                                  updatedData[idx].SudahUpdate = e.target.checked
                                  setCustomerData(updatedData)
                                }}
                                checked={customerData[idx].SudahUpdate || false}
                              />
                            </CTableDataCell>
                            <CTableDataCell>
                              <CFormCheck
                                onChange={(e) => {
                                  const updatedData = [...customerData]
                                  updatedData[idx].SudahLengkap = e.target.checked
                                  setCustomerData(updatedData)
                                }}
                                checked={customerData[idx].SudahLengkap || false}
                              />
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default RekualifikasiAdd
