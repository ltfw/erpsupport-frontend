import { useEffect, useRef, useState } from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CImage, CRow } from '@coreui/react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { useReactToPrint } from 'react-to-print'
const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const CustomerPrint = () => {
  const { id } = useParams()
  const [data, setData] = useState([])
  const contentRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  // const {
  //   register,
  //   handleSubmit,
  //   reset,
  //   formState: { errors },
  // } = useForm()

  useEffect(() => {
    axios.get(`${ENDPOINT_URL}customers/${id}`).then((res) => {
      setData(res.data)
      // reset(res.data)
    })
  }, [])

  useEffect(() => {
    // Set isReady to true once the component is mounted and ref is assigned
    if (contentRef) {
      setIsReady(true)
    }
  }, [])

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: 'Customer_Validation_Form',
    pageStyle: `
      @page {
        size: A4;
        margin: 1cm;
      }
      body {
        font-size: 10pt !important;
      }
      .table, .table th, .table td {
        font-size: 10pt !important;
      }
      .table {
        border-collapse: collapse;
        width: 100%;
      }
      .table th, .table td {
        padding: 5px;
      }
      @media print {
        .avoid-page-break {
          break-inside: avoid;
          page-break-inside: avoid; /* for compatibility */
        }
      }
    `,
    onBeforeGetContent: () => {
      if (!contentRef) {
        console.warn('Print content is not available.')
        return Promise.reject('No content to print')
      }
      return Promise.resolve()
    },
    onPrintError: (errorLocation, error) => {
      console.error('Print error:', errorLocation, error)
      alert('Failed to print. Please try again.')
    },
  })

  return (
    <>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>
              <div className="d-flex justify-content-between align-items-center">
                <div className="">Form Customers</div>
                <div className="text-end">
                  <button className="btn btn-primary" onClick={handlePrint} disabled={!isReady}>
                    Print
                  </button>
                </div>
              </div>
            </CCardHeader>
            <CCardBody>
              <div ref={contentRef}>
                <CRow>
                  <CCol xs={2}>
                    <CImage src="/img/logo-sdl.png" alt="Logo" height={50} />
                  </CCol>
                  <CCol xs={8} className="text-center">
                    <h4>FORM VALIDASI CUSTOMER</h4>
                    <h5>PT SATORIA DISTRIBUSI LESTARI</h5>
                  </CCol>
                  <CCol xs={2} className="text-end"></CCol>
                </CRow>
                <CRow className="mt-3">
                  <CCol xs={12}>
                    <table className="table table-striped table-bordered">
                      <thead>
                        <tr>
                          <th className="text-center" style={{ width: '5%' }}>
                            No
                          </th>
                          <th className="text-center" style={{ width: '25%' }}>
                            MASTER DATA TYPE
                          </th>
                          <th className="text-center">INFO</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={3}>
                            <strong>Customer</strong>
                          </td>
                        </tr>
                        <tr>
                          <td>1</td>
                          <td>Kode Customer*</td>
                          <td>{data.customer?.KodeLgn ?? ''}</td>
                        </tr>
                        <tr>
                          <td>2</td>
                          <td>Nama Customer</td>
                          <td>{data.customer?.NamaLgn ?? ''}</td>
                        </tr>

                        <tr>
                          <td>3</td>
                          <td>Kode Farma</td>
                          <td>{data.customer?.NomorLgnBpom ?? ''}</td>
                        </tr>
                        <tr>
                          <td>4</td>
                          <td>Kode Alkes</td>
                          <td>{data.customer?.NomorLgnKemenkes ?? ''}</td>
                        </tr>
                        <tr>
                          <td>5</td>
                          <td colSpan={2}>Customer Address</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>a. Alamat</td>
                          <td className="td-flex">
                            <span>Lama : {data.customer?.Alamat1 ?? ''}</span>
                            <span>Baru :</span>
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>b. Regency / Kabupaten</td>
                          <td className="td-flex">
                            <span>Lama : {data.customer?.Regency ?? ''}</span>
                            <span>Baru :</span>
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>c. Province</td>
                          <td className="td-flex">
                            <span>Lama : {data.customer?.Province ?? ''}</span>
                            <span>Baru :</span>
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>d. Kode Pos</td>
                          <td className="td-flex">
                            <span>Lama : {data.customer?.KodePos ?? ''}</span>
                            <span>Baru :</span>
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>e. Kode Negara</td>
                          <td className="td-flex">
                            <span>Lama : {data.customer?.CountryCode ?? ''}</span>
                            <span>Baru :</span>
                          </td>
                        </tr>
                        <tr>
                          <td>6</td>
                          <td colSpan={2}>Teritory</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>a. Wilayah*</td>
                          <td className="td-flex">
                            <span>Lama : {data.customer?.KodeWil ?? ''}</span>
                            <span>Baru :</span>
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>b. Rayon*</td>
                          <td className="td-flex">
                            <span>Lama : {data.customer?.District ?? ''}</span>
                            <span>Baru :</span>
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>c. Branch / Site*</td>
                          <td className="td-flex">
                            <span>Lama : {data.customer?.KodeDept ?? ''}</span>
                            <span>Baru :</span>
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>d. District / Kecamatan*</td>
                          <td className="td-flex">
                            <span>Lama : {data.customer?.District ?? ''}</span>
                            <span>Baru :</span>
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>e. Village / Kelurahan*</td>
                          <td className="td-flex">
                            <span>Lama : {data.customer?.Village ?? ''}</span>
                            <span>Baru :</span>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={3}>
                            <strong>Billing</strong>
                          </td>
                        </tr>
                        <tr>
                          <td>7</td>
                          <td>Group Customer</td>
                          <td className="td-flex">
                            <span className="col">
                              Lama : {data.customerGroup?.customerGroupName ?? ''}
                            </span>
                            <span>Baru :</span>
                          </td>
                        </tr>
                        <tr>
                          <td>8</td>
                          <td>Badan Usaha</td>
                          <td className="td-flex">
                            <span className="col">
                              Lama : {data.businessEntity?.BusinessEntityName ?? ''}
                            </span>
                            <span>Baru :</span>
                          </td>
                        </tr>
                        <tr>
                          <td>9</td>
                          <td>Kode Transaksi Pajak*</td>
                          <td className="td-flex">
                            <span className="col">
                              Lama : {data.customer?.TaxTransactionCode ?? ''}
                            </span>
                            <span>Baru :</span>
                          </td>
                        </tr>
                        <tr>
                          <td>10</td>
                          <td>No NPWP</td>
                          <td className="td-flex">
                            <span>Lama : {data.customer?.Npwp ?? ''}</span>
                            <span>Baru :</span>
                          </td>
                        </tr>
                        <tr>
                          <td>11</td>
                          <td>Nama Customer Induk*</td>
                          <td className="td-flex">
                            <span className="col">
                              Lama : {data.customer?.CustomerIndukNama ?? ''}
                            </span>
                            <span>Baru :</span>
                          </td>
                        </tr>
                        <tr>
                          <td>12</td>
                          <td colSpan={2}>Informasi NPWP Customer</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>a. Nama NPWP*</td>
                          <td className="td-flex">
                            <span>Lama : {data.customer?.NpwpOwner ?? ''}</span>
                            <span>Baru :</span>
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>b. Alamat NPWP*</td>
                          <td className="td-flex">
                            <span>Lama : {data.customer?.AlamatFaktur ?? ''}</span>
                            <span>Baru :</span>
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>c. Telepon* </td>
                          <td className="td-flex">
                            <span>Lama : {data.customer?.Telepon ?? ''}</span>
                            <span>Baru :</span>
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>d. NITKU*</td>
                          <td>{`${data.customer?.Npwp ?? ''}${data.customer?.TkuId ?? ''}`}</td>
                        </tr>
                        <tr>
                          <td colSpan={3}>
                            <strong>Contact</strong>
                          </td>
                        </tr>
                        <tr>
                          <td>13</td>
                          <td>Nama Kontak</td>
                          <td className="td-flex">
                            <span>Lama : {data.customer?.NamaPemilik ?? ''}</span>
                            <span>Baru :</span>
                          </td>
                        </tr>
                        <tr>
                          <td>14</td>
                          <td>Contact Person</td>
                          <td className="td-flex">
                            <span className="col">
                              Lama : {data.customer?.HubunganDengan ?? ''}
                            </span>
                            <span>Baru :</span>
                          </td>
                        </tr>
                        <tr>
                          <td>15</td>
                          <td>Jabatan</td>
                          <td className="td-flex">
                            <span>Lama : {data.customer?.Jabatan ?? ''}</span>
                            <span>Baru :</span>
                          </td>
                        </tr>
                        <tr>
                          <td>16</td>
                          <td>Email</td>
                          <td className="td-flex">
                            <span>Lama : {data.customer?.Email ?? ''}</span>
                            <span>Baru :</span>
                          </td>
                        </tr>
                        <tr>
                          <td>17</td>
                          <td>Telepon</td>
                          <td className="td-flex">
                            <span>Lama : {data.customer?.Telepon ?? ''}</span>
                            <span>Baru :</span>
                          </td>
                        </tr>
                        <tr>
                          <td>18</td>
                          <td>Fax</td>
                          <td className="td-flex">
                            <span>Lama : {data.customer?.NoFax ?? ''}</span>
                            <span>Baru :</span>
                          </td>
                        </tr>
                        {(data.legalitasOutlet ?? []).some(
                          (item) => item.PermissionTitleCode == 1,
                        ) && (
                            <tr>
                              <td colSpan={3}>
                                <strong>
                                  Surat Izin Customer (Diisi sesuai tipe customer group) melampirkan
                                  Fotocopy document
                                </strong>
                              </td>
                            </tr>
                          )}
                        {(data.legalitasOutlet ?? [])
                          .filter((item) => item.PermissionTitleCode == 1)
                          .map((item, index) => (
                            <tr key={index}>
                              <td></td>
                              <td>
                                {index + 1}. {item.CustomerGroupMasterPermissionName}
                              </td>
                              <td className="td-flex">
                                <span>Lama : {item.PermissionValue}</span>
                                <span>Baru :</span>
                              </td>
                            </tr>
                          ))}
                        {(data.legalitasOutlet ?? []).some(
                          (item) => item.PermissionTitleCode == 2,
                        ) && (
                            <tr>
                              <td colSpan={3}>
                                <strong>Legalitas Penanggung Jawab</strong>
                              </td>
                            </tr>
                          )}
                        {(data.legalitasOutlet ?? [])
                          .filter((item) => item.PermissionTitleCode == 2)
                          .map((item, index) => (
                            <tr key={index}>
                              <td></td>
                              <td>
                                {index + 1}. {item.CustomerGroupMasterPermissionName}
                              </td>
                              <td className="td-flex">
                                <span>Lama : {item.PermissionValue}</span>
                                <span>Baru :</span>
                              </td>
                            </tr>
                          ))}
                        {(data.legalitasOutlet ?? []).some(
                          (item) => item.PermissionTitleCode == 3,
                        ) && (
                            <tr>
                              <td colSpan={3}>
                                <strong>Legalitas Asisten / Pendamping Penanggung Jawab 1</strong>
                              </td>
                            </tr>
                          )}
                        {(data.legalitasOutlet ?? [])
                          .filter((item) => item.PermissionTitleCode == 3)
                          .map((item, index) => (
                            <tr key={index}>
                              <td></td>
                              <td>
                                {index + 1}. {item.CustomerGroupMasterPermissionName}
                              </td>
                              <td className="td-flex">
                                <span>Lama : {item.PermissionValue}</span>
                                <span>Baru :</span>
                              </td>
                            </tr>
                          ))}
                        {(data.legalitasOutlet ?? []).some(
                          (item) => item.PermissionTitleCode == 4,
                        ) && (
                            <tr>
                              <td colSpan={3}>
                                <strong>Legalitas Pemilik / Pimpinan</strong>
                              </td>
                            </tr>
                          )}
                        {(data.legalitasOutlet ?? [])
                          .filter((item) => item.PermissionTitleCode == 4)
                          .map((item, index) => (
                            <tr key={index}>
                              <td></td>
                              <td>
                                {index + 1}. {item.CustomerGroupMasterPermissionName}
                              </td>
                              <td className="td-flex">
                                <span>Lama : {item.PermissionValue}</span>
                                <span>Baru :</span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </CCol>
                </CRow>
                <CRow className="mt-5 avoid-page-break">
                  <CCol xs={2}>
                    <span className="fst-italic">*) diisi petugas</span>
                  </CCol>
                  <CCol xs={6} className="ms-auto">
                    <div className="border p-3">
                      <CRow>
                        <CCol xs={12}>
                          <span>Verifikasi oleh SPV :</span>
                        </CCol>
                        <CCol xs={12}>
                          <span>
                            <input type="checkbox" /> Via Telfon tanggal* _________________
                          </span>
                        </CCol>
                        <CCol xs={12}>
                          <span>
                            <input type="checkbox" /> Kunjungan Langsung tanggal* _________________
                          </span>
                        </CCol>
                        <CCol xs={12}>
                          <span>
                            <input type="checkbox" /> Informasi dari Outlet sejak* _________________
                          </span>
                        </CCol>
                        <CCol xs={12}>
                          <span className="fst-italic">
                            *) Ceklis sesuai kegiatan yang dilakukan
                          </span>
                        </CCol>
                      </CRow>
                    </div>
                  </CCol>
                </CRow>
                <CRow className="justify-content-around" style={{ marginTop: '100px' }}>
                  <CCol xs={3} className="text-center">
                    <CRow>
                      <CCol xs={12}>(_________________________)</CCol>
                      <CCol xs={12}>Penanggung Jawab Outlet</CCol>
                      <CCol xs={12}>*Nama Jelas, Cap, dan TTD</CCol>
                    </CRow>
                  </CCol>
                  <CCol xs={3} className="text-center">
                    <CRow>
                      <CCol xs={12}>(_________________________)</CCol>
                      <CCol xs={12}>Apoteker Penanggung Jawab</CCol>
                      <CCol xs={12}>PT Satoria Distribusi Lestari</CCol>
                    </CRow>
                  </CCol>
                  <CCol xs={3} className="text-center">
                    <CRow>
                      <CCol xs={12}>(_________________________)</CCol>
                      <CCol xs={12}>SPV Salesman</CCol>
                      <CCol xs={12}>PT Satoria Distribusi Lestari</CCol>
                    </CRow>
                  </CCol>
                </CRow>
                <CRow>
                  {/* <CCol xs={2}></CCol> */}
                  <CCol xs={3} className="ms-auto" style={{ marginTop: '100px' }}>
                    <div className="text-end" style={{ fontSize: '0.5rem' }}>
                      <CRow>
                        <CCol xs={12}>
                          <span>No 22009-02</span>
                        </CCol>
                        <CCol xs={12}>
                          <span>No Revisi 000</span>
                        </CCol>
                      </CRow>
                    </div>
                  </CCol>
                </CRow>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      {new Date().toLocaleDateString()}
    </>
  )
}

export default CustomerPrint
