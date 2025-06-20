import { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CImage,
  CRow,
} from '@coreui/react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { useForm } from 'react-hook-form'
const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const CustomerPrint = () => {
  const { id } = useParams()
  const [data, setData] = useState([])
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()


  useEffect(() => {
    axios.get(`${ENDPOINT_URL}customers/${id}`).then((res) => {
      setData(res.data)
      reset(res.data)
    })
  }, [])

  return (
    <>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Form Customers</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol xs={2}>
                  <CImage src="/img/logo-sdl.png" alt="Logo" height={50} />
                </CCol>
                <CCol xs={8} className="text-center">
                  <h4>FORM VALIDASI CUSTOMER</h4>
                  <h5>PT SATORIA DISTRIBUSI LESTARI</h5>
                </CCol>
              </CRow>
              <CRow className="mt-3">
                <CCol xs={12}>
                  <table className="table table-striped table-bordered">
                    <thead>
                      <tr>
                        <th className='text-center' style={{ width: '5%' }}>No</th>
                        <th className='text-center' style={{ width: '25%' }}>MASTER DATA TYPE</th>
                        <th className='text-center'>INFO</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={3}><strong>Customer</strong></td>
                      </tr>
                      <tr>
                        <td>1</td>
                        <td>Kode Customer</td>
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
                        <td>{data.customer?.Alamat1 ?? ''}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>b. Regency / Kabupaten</td>
                        <td>{data.customer?.Regency ?? ''}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>c. Province</td>
                        <td>{data.customer?.Province ?? ''}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>d. Kode Pos</td>
                        <td>{data.customer?.KodePos ?? ''}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>e. Kode Negara</td>
                        <td>{data.customer?.CountryCode ?? ''}</td>
                      </tr>
                      <tr>
                        <td colSpan={3}><strong>Teritory</strong></td>
                      </tr>
                      <tr>
                        <td>6</td>
                        <td colSpan={2}>Teritory</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>Wilayah</td>
                        <td>{data.customer?.Kodewil ?? ''}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>Rayon</td>
                        <td>{data.customer?.District ?? ''}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>Branch / Site</td>
                        <td>{data.customer?.KodeDept ?? ''}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>District / Kecamatan</td>
                        <td>{data.customer?.District ?? ''}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>Village / Kelurahan</td>
                        <td>{data.customer?.Village ?? ''}</td>
                      </tr>
                      <tr>
                        <td colSpan={3}><strong>Billing</strong></td>
                      </tr>
                      <tr>
                        <td>7</td>
                        <td>Group Customer</td>
                        <td>{data.customerGroup?.customerGroupName ?? ''}</td>
                      </tr>
                      <tr>
                        <td>7</td>
                        <td>Group Customer</td>
                        <td>{data.customerGroup?.customerGroupName ?? ''}</td>
                      </tr>
                      <tr>
                        <td>8</td>
                        <td>Badan Usaha</td>
                        <td>{data?.businessEntity?.BusinessEntityName ?? ''}</td>
                      </tr>
                      <tr>
                        <td>8</td>
                        <td>Kode Transaksi Pajak</td>
                        <td>{data.customer?.TaxTransactionCode ?? ''}</td>
                      </tr>
                      <tr>
                        <td>8</td>
                        <td>No NPWP</td>
                        <td>{data.customer?.TaxTransactionCode ?? ''}</td>
                      </tr>
                      <tr>
                        <td>8</td>
                        <td>Nama Customer Induk</td>
                        <td>{data.customer?.CustomerIndukNama ?? ''}</td>
                      </tr>
                      <tr>
                        <td>6</td>
                        <td colSpan={2}>Informasi NPWP Customer</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>Nama NPWP</td>
                        <td>{data.customer?.NpwpOwner ?? ''}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>Alamat NPWP</td>
                        <td>{data.customer?.AlamatFaktur ?? ''}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>Telepon </td>
                        <td>{data.customer?.Telepon ?? ''}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>NITKU</td>
                        <td>{`${data.customer?.Npwp ?? ''}${data.customer?.TkuId ?? ''}`}</td>
                      </tr>
                      <tr>
                        <td colSpan={3}><strong>Contact</strong></td>
                      </tr>
                      <tr>
                        <td>9</td>
                        <td>Nama Kontak</td>
                        <td>{data.customer?.NamaPemilik ?? ''}</td>
                      </tr>
                      <tr>
                        <td>9</td>
                        <td>Contact Person</td>
                        <td>{data.customer?.HubunganDengan ?? ''}</td>
                      </tr>
                      <tr>
                        <td>10</td>
                        <td>Jabatan</td>
                        <td>{data.customer?.Jabatan ?? ''}</td>
                      </tr>
                      <tr>
                        <td>10</td>
                        <td>Email</td>
                        <td>{data.customer?.Email ?? ''}</td>
                      </tr>
                      <tr>
                        <td>11</td>
                        <td>Telepon</td>
                        <td>{data.customer?.Telepon ?? ''}</td>
                      </tr>
                      <tr>
                        <td>11</td>
                        <td>Fax</td>
                        <td>{data.customer?.NoFax ?? ''}</td>
                      </tr>
                    </tbody>
                  </table>
                </CCol>
              </CRow>
              <CRow>
                <CCol xs={2}>
                  <span className='fst-italic'>*) diisi petugas</span>
                </CCol>
                <CCol xs={4} className='ms-auto'>
                  <div className='border p-3'>
                    <CRow>
                      <CCol xs={12}>
                        <span>Verifikasi oleh SPV :</span>
                      </CCol>
                      <CCol xs={12}>
                        <span><input type='checkbox' /> Via Telfon tanggal* _________________</span>
                      </CCol>
                      <CCol xs={12}>
                        <span><input type='checkbox' /> Kunjungan Langsung tanggal* _________________</span>
                      </CCol>
                      <CCol xs={12}>
                        <span><input type='checkbox' /> Informasi dari Outlet sejak* _________________</span>
                      </CCol>
                      <CCol xs={12}>
                        <span className='fst-italic'>*) Ceklis sesuai kegiatan yang dilakukan</span>
                      </CCol>
                    </CRow>
                  </div>
                </CCol>
              </CRow>
              <CRow className='justify-content-around' style={{ marginTop: '100px' }}>
                <CCol xs={3} className='text-center'>
                  <CRow>
                    <CCol xs={12}>(_________________________)</CCol>
                    <CCol xs={12}>Penanggung Jawab Outlet</CCol>
                    <CCol xs={12}>*Nama Jelas, Cap, dan TTD</CCol>
                  </CRow>
                </CCol>
                <CCol xs={3} className='text-center'>
                  <CRow>
                    <CCol xs={12}>(_________________________)</CCol>
                    <CCol xs={12}>Apoteker Penanggung Jawab</CCol>
                    <CCol xs={12}>PT Satoria Distribusi Lestari</CCol>
                  </CRow>
                </CCol>
                <CCol xs={3} className='text-center'>
                  <CRow>
                    <CCol xs={12}>(_________________________)</CCol>
                    <CCol xs={12}>SPV Salesman</CCol>
                    <CCol xs={12}>PT Satoria Distribusi Lestari</CCol>
                  </CRow>
                </CCol>
              </CRow>
              <CRow>
                <CCol xs={2}>
                </CCol>
                <CCol xs={1} className='ms-auto' style={{ marginTop: '100px' }}>
                  <div style={{ fontSize: '0.8rem' }}>
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
            </CCardBody>
          </CCard>
        </CCol>
      </CRow >
      {new Date().toLocaleDateString()}
    </>
  )
}

export default CustomerPrint
