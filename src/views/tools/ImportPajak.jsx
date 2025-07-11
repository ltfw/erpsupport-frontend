import { useState } from 'react'
import Papa from 'papaparse'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
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
  const [csvFile, setCsvFile] = useState(null)
  const [parsedData, setParsedData] = useState([])

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0])
  }

  const handleParseCsv = () => {
    if (!csvFile) return

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        // Assuming the CSV has columns: TaxInvoiceYear, Signer, TaxInvoiceCode
        const cleaned = result.data.map((row) => ({
          TaxInvoiceYear: row.TaxInvoiceYear,
          Signer: row.Signer,
          TaxInvoiceCode: row.TaxInvoiceCode,
        }))
        console.log('Parsed CSV Data:', cleaned)
        setParsedData(cleaned)
      },
    })
  }

  const handleUpload = async () => {
    try {
      await axios.post(`${ENDPOINT_URL}import-pajak`, parsedData)
      alert('Data imported successfully')
    } catch (err) {
      console.error(err)
      alert('Failed to import data')
    }
  }

  return (
    <>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Import Pajak</CCardHeader>
            <CCardBody>
              <CRow className="mb-3">
                <CFormLabel htmlFor="formFile" className="col-sm-1 col-form-label">
                  Pilih CSV
                </CFormLabel>
                <CCol xs={3}>
                  <CFormInput type="file" id="formFile" accept=".csv" onChange={handleFileChange} />
                </CCol>
                <CCol xs={2}>
                  <CButton color="primary" onClick={handleParseCsv}>
                    Preview CSV
                  </CButton>
                </CCol>
              </CRow>

              {parsedData.length > 0 && (
                <>
                  <CTable striped>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>TaxInvoiceYear</CTableHeaderCell>
                        <CTableHeaderCell>Signer</CTableHeaderCell>
                        <CTableHeaderCell>TaxInvoiceCode</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {parsedData.map((item, idx) => (
                        <CTableRow key={idx}>
                          <CTableDataCell>{item.TaxInvoiceYear}</CTableDataCell>
                          <CTableDataCell>{item.Signer}</CTableDataCell>
                          <CTableDataCell>
                            <CFormInput value={item.TaxInvoiceCode}/>
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
