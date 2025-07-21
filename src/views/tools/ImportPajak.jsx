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
  CFormCheck,
  CFormInput,
  CFormLabel,
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

const ImportPajak = () => {
  const [excelFile, setExcelFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const fileInputRef = useRef();

  // Props for radio buttons
  const radioOptions = [
    { id: 'radio1', label: 'Penjualan', value: 'penjualan' },
    { id: 'radio2', label: 'Retur', value: 'retur' },
  ];
  const [selectedRadio, setSelectedRadio] = useState(radioOptions[0].value);

  const handleFileChange = (e) => {
    setExcelFile(e.target.files[0])
  }

  const handleParseExcel = async (e) => {
    if (!excelFile) return

    const file = excelFile
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data)

    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
    // Only keep desired columns
    if( selectedRadio === 'penjualan') {
      const cleanedData = jsonData
        .filter(row => row['Status Faktur'] === 'APPROVED')
        .map((row) => ({
          TaxInvoiceNumber: row['Nomor Faktur Pajak'] || '',
          TaxStatus: row['Status Faktur'] || '',
          TaxReference: row['Referensi'] || '',
        }))
      console.log('Parsed Data:', cleanedData)
      setParsedData(cleanedData)
    }else if (selectedRadio === 'retur') {
      const cleanedData = jsonData
        .filter(row => row['Status'] === 'APPROVED')
        .map((row) => ({
          TaxInvoiceNumber: row['Nomor Faktur'] || '',
          TaxStatus: row['Status'] || '',
          TaxReturNumber: row['Nomor Retur'] || '',
        }))
      console.log('Parsed Data:', cleanedData)
      setParsedData(cleanedData)
    }
  }

  const handleUpload = async () => {
    try {
      await axios.post(`${ENDPOINT_URL}others/importcoretax`, {
        data: parsedData,
        tipe: selectedRadio,
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
            <CCardHeader>Import Pajak</CCardHeader>
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
                <CCol xs="auto" className="d-flex align-items-center gap-2">
                  {radioOptions.map(option => (
                    <CFormCheck
                      key={option.id}
                      type="radio"
                      id={option.id}
                      name="radioType"
                      label={option.label}
                      value={option.value}
                      checked={selectedRadio === option.value}
                      onChange={() => setSelectedRadio(option.value)}
                    />
                  ))}
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
                        <CTableHeaderCell>Tax Invoice Number</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                        <CTableHeaderCell>
                          {selectedRadio === 'penjualan' ? 'No Invoice' : 'No Retur'}
                        </CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {parsedData.map((item, idx) => (
                        <CTableRow key={idx}>
                          <CTableDataCell>
                            <CFormInput
                              value={item.TaxInvoiceNumber}
                              onChange={e => {
                                const newData = [...parsedData];
                                newData[idx].TaxInvoiceNumber = e.target.value;
                                setParsedData(newData);
                              }}
                            />
                          </CTableDataCell>
                          <CTableDataCell>{item.TaxStatus}</CTableDataCell>
                          <CTableDataCell>
                            {selectedRadio === 'penjualan' ? (
                              <CFormInput
                                value={item.TaxReference}
                                onChange={e => {
                                  const newData = [...parsedData];
                                  newData[idx].TaxReference = e.target.value;
                                  setParsedData(newData);
                                }}
                              />
                            ) : (
                              <CFormInput
                                value={item.TaxReturNumber}
                                onChange={e => {
                                  const newData = [...parsedData];
                                  newData[idx].TaxReturNumber = e.target.value;
                                  setParsedData(newData);
                                }}
                              />
                            )}
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>

                  <CButton color="success" className="mt-3" onClick={handleUpload}>
                    Import ke Server
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

export default ImportPajak
