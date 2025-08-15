import { useRef, useState } from 'react';
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
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow
} from '@coreui/react';
import axios from 'axios';

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL;

const ImportVA = () => {
  const [textFile, setTextFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    setTextFile(e.target.files[0]);
  };

  const handleParseFile = async () => {
    if (!textFile) return toast.error('Please select a file');

    try {
      const text = await textFile.text();
      const lines = text.split(/\r?\n/);

      const cleanedData = lines
        .filter(line => line.startsWith('1'))
        .map(line => {
          const originalNo = line.substring(0, 12).trim(); // keep the original 12-digit number

          // No VA = remove first char, then trim
          const noVA = originalNo.substring(1).trim();

          // Customer Name = from position 12 onward, remove leading zeros and trim
          const customerNameRaw = line.substring(12, 42).trim();
          const customerName = customerNameRaw.replace(/^0+/, '').trim();

          // kodelgn = last 6 digits of originalNo + "C" in front
          const kodelgn = 'C' + originalNo.slice(-6);

          return { noVA, customerName, kodelgn };
        });


      setParsedData(cleanedData);
      toast.info('File loaded successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to parse file');
    }
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) return toast.error('No data to upload');

    try {
      await axios.post(`${ENDPOINT_URL}others/importva`, { data: parsedData });
      toast.success('Data imported successfully');
      setTextFile(null);
      setParsedData([]);
      fileInputRef.current.value = null;
    } catch (err) {
      console.error(err);
      toast.error('Failed to import data');
    }
  };

  return (
    <>
      <ToastContainer />
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Import VA</CCardHeader>
            <CCardBody>
              <CRow className="mb-3 align-items-center">
                <CFormLabel htmlFor="formFile" className="col-sm-2 col-form-label">
                  Pilih TXT
                </CFormLabel>
                <CCol xs={3}>
                  <CFormInput
                    type="file"
                    id="formFile"
                    accept=".txt"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </CCol>
                <CCol xs="auto">
                  <CButton color="primary" className="me-2" onClick={handleParseFile}>
                    Preview File
                  </CButton>
                  <CButton color="success text-white" onClick={handleUpload}>
                    Import ke Server
                  </CButton>
                </CCol>
              </CRow>

              {parsedData.length > 0 && (
                <>
                  <CTable striped>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>No VA</CTableHeaderCell>
                        <CTableHeaderCell>Customer Name</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {parsedData.map((item, idx) => (
                        <CTableRow key={idx}>
                          <CTableDataCell>
                            <CFormInput
                              value={item.noVA}
                              onChange={e => {
                                const newData = [...parsedData];
                                newData[idx].noVA = e.target.value;
                                setParsedData(newData);
                              }}
                            />
                          </CTableDataCell>
                          <CTableDataCell>
                            <CFormInput
                              value={item.customerName}
                              onChange={e => {
                                const newData = [...parsedData];
                                newData[idx].customerName = e.target.value;
                                setParsedData(newData);
                              }}
                            />
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>

                  <CButton color="success text-white" className="mt-3" onClick={handleUpload}>
                    Import ke Server
                  </CButton>
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  );
};

export default ImportVA;