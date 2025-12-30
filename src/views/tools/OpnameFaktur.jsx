import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import axios from 'axios'

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const OpnameFaktur = () => {
  const [excelFile, setExcelFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const fileInputRef = useRef();

  const statusOptions = [
    'Lunas',
    'Fisik Ada',
    'Tanda Terima Faktur',
    'Potongan Retur',
    'SSP',
    'Fisik Tidak Ada'
  ];

  const handleFileChange = (e) => {
    setExcelFile(e.target.files[0])
  }

  const handleParseExcel = async (e) => {
    if (!excelFile) return

    const file = excelFile
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data)

    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    // Headers start from row 4 (1-indexed), so use header: 4
    console.log('worksheet:', worksheet)
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      defval: '',
      header: 4 // 1-indexed, row 4 contains headers, data starts from row 5
    })

    
    // Extract desired columns
    const cleanedData = jsonData.map((row) => ({
      NoFaktur: row['No. Faktur'] || '',
      NamaCustomer: row['Nama Customer'] || '',
      NominalSystem: row['Nilai Piutang'] || '',
      NominalOpname: '',
      Status: '',
    }))
    
    console.log('Parsed Data:', cleanedData)
    setParsedData(cleanedData)
  }

  const handleUpload = async () => {
    try {
      await axios.post(`${ENDPOINT_URL}others/opnamefaktur`, {
        data: parsedData,
      });
      toast.success('Data imported successfully')
      setExcelFile(null)
      setParsedData([])
      fileInputRef.current.value = null;

    } catch (err) {
      console.error(err);
      toast.error('Failed to import data');
    }
  }

  return (
    <>
      <ToastContainer />
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Opname Faktur</CCardHeader>
            <CCardBody>
              <CRow className="mb-3 align-items-center">
                <CFormLabel htmlFor="formFile" className="col-sm-2 col-form-label">
                  Pilih EXCEL
                </CFormLabel>
                <CCol xs={3}>
                  <CFormInput
                    type="file"
                    id="formFile"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </CCol>
                <CCol xs="auto">
                  <CButton color="primary" onClick={handleParseExcel}>
                    Preview EXCEL
                  </CButton>
                </CCol>
              </CRow>

              {parsedData.length > 0 && (
                <>
                  <CTable striped>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>No Faktur</CTableHeaderCell>
                        <CTableHeaderCell>Nama Customer</CTableHeaderCell>
                        <CTableHeaderCell>Nominal System</CTableHeaderCell>
                        <CTableHeaderCell>Nominal Opname</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {parsedData.map((item, idx) => (
                        <CTableRow key={idx}>
                          <CTableDataCell>
                            <CFormInput
                              value={item.NoFaktur}
                              onChange={e => {
                                const newData = [...parsedData];
                                newData[idx].NoFaktur = e.target.value;
                                setParsedData(newData);
                              }}
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            <CFormInput
                              value={item.NamaCustomer}
                              onChange={e => {
                                const newData = [...parsedData];
                                newData[idx].NamaCustomer = e.target.value;
                                setParsedData(newData);
                              }}
                            />
                          </CTableDataCell>
                          <CTableDataCell>{item.NominalSystem}</CTableDataCell>
                          <CTableDataCell>
                            <CFormInput
                              value={item.NominalOpname}
                              onChange={e => {
                                const newData = [...parsedData];
                                newData[idx].NominalOpname = e.target.value;
                                setParsedData(newData);
                              }}
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            <CFormSelect
                              value={item.Status}
                              onChange={e => {
                                const newData = [...parsedData];
                                newData[idx].Status = e.target.value;
                                setParsedData(newData);
                              }}
                            >
                              <option value="">Pilih Status</option>
                              {statusOptions.map(option => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </CFormSelect>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>

                  <CButton color="success" className="mt-3" onClick={handleUpload}>
                    Submit
                  </CButton>
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default OpnameFaktur

