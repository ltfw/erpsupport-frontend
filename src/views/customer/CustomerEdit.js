import { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CImage,
  CRow,
} from '@coreui/react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import CIcon from '@coreui/icons-react'
import { cilFile } from '@coreui/icons'
import { convertLocalPathToUrl } from '../../utils/UrlConverter'
const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const CustomerEdit = () => {
  const { id } = useParams()
  const [data, setData] = useState([])
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const onSubmit = (data) => {
    console.log('Form Submitted:', data)
    // You can send `data` to an API here
  }

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
              <CForm className="row g-3" onSubmit={handleSubmit(onSubmit)}>
                <h4>Customer</h4>
                <CCol md={6}>
                  <CFormInput
                    id="CustomerId"
                    label="Kode Customer"
                    value={data.customer?.KodeLgn ?? ''}
                    disabled
                    size="sm"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    id="NamaLgn"
                    label="Nama Customer"
                    {...register('customer.NamaLgn')}
                    size="sm"
                  />
                  {errors.customer?.NamaLgn && <p style={{ color: 'red' }}>{errors.customer.NamaLgn.message}</p>}
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    id="NomorLgnBpom"
                    label="Kode Farma"
                    {...register('customer.NomorLgnBpom')}
                    size="sm"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    id="NomorLgnKemenkes"
                    label="Kode Alkes"
                    {...register('customer.NomorLgnKemenkes')}
                    size="sm"
                  />
                </CCol>

                <h5>Customer Address</h5>
                <CCol md={6}>
                  <CFormInput id="Alamat1" label="Alamat" {...register('customer.Alamat1')} size="sm" />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="Province" label="Province" {...register('customer.Province')} size="sm" />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="Regency" label="Regency" {...register('customer.Regency')} size="sm" />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="KodePos" label="KodePos" {...register('customer.KodePos')} size="sm" />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    id="CountryCode"
                    label="CountryCode"
                    {...register('customer.CountryCode')}
                    size="sm"
                  />
                </CCol>

                <h5>Teritory</h5>
                <CCol md={6}>
                  <CFormInput id="KodeWil" label="Wilayah" {...register('customer.KodeWil')} size="sm" />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="Rayon" label="Rayon" {...register('rayonCustomer.RayonCode')} size="sm" />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="Cabang" label="Branch/Site" {...register('customer.KodeDept')} size="sm" />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    id="District"
                    label="Wide Teritory"
                    {...register('customer.District')}
                    size="sm"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="Village" label="Teritory" {...register('customer.Village')} size="sm" />
                </CCol>

                <h4>Billing</h4>
                <CCol md={6}>
                  <CFormInput
                    id="CustomerGroup"
                    label="Group Customer"
                    {...register('customerGroup.CustomerGroupName')}
                    size="sm"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    id="TaxLiability"
                    label="Tax Liability*"
                    {...register('customer.TaxTransactionCode')}
                    size="sm"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="TaxId" label="Tax ID (NPWP)" {...register('customer.Npwp')} size="sm" />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    id="BillToAccount"
                    label="Bill to Account*"
                    {...register('customer.CustomerIndukNama')}
                    size="sm"
                  />
                </CCol>

                <h5>Informasi NPWP Customer</h5>
                <CCol md={6}>
                  <CFormInput
                    id="NpwpName"
                    label="Nama pada NPWP*"
                    {...register('customer.NpwpName')}
                    size="sm"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="Address" label="Alamat*" {...register('customer.AlamatPajak')} size="sm" />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="Phone" label="Telepon*" {...register('customer.Telepon')} size="sm" />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="Nitku" label="NITKU*" value={`${data.customer?.Npwp || ''}${data.customer?.TkuId || ''}`} size="sm" disabled />
                </CCol>

                <h4>Contact</h4>
                <CCol md={6}>
                  <CFormInput
                    id="ContactName"
                    label="Nama"
                    {...register('customer.NamaPemilik')}
                    size="sm"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    id="JobTitle"
                    label="Function/Jabatan"
                    {...register('customer.Profesi')}
                    size="sm"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="Email" label="Email" {...register('customer.Email')} size="sm" />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="Phone" label="Telpon/HP" {...register('customer.Telepon')} size="sm" />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="Fax" label="Fax" {...register('customer.Nofax')} size="sm" />
                </CCol>

                <h4>Legalitas Outlet / Surat Izin Customer</h4>
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">No</th>
                      <th scope="col">Syarat</th>
                      <th scope="col">Keterangan</th>
                      <th scope="col">Tgl Expired</th>
                      <th scope="col">Upload File</th>
                      <th scope="col">Preview</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.legalitasOutlet ?? [])
                      .filter(item => item.PermissionTitleCode == 1)
                      .map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.CustomerGroupMasterPermissionName}</td>
                          <td><CFormInput id="Fax" {...register(`legalitasOutlet.${index}.PermissionValue`)} size="sm" /></td>
                          <td><CFormInput id="Fax" {...register(`legalitasOutlet.${index}.tglExpired`)} size="sm" type='date'/></td>
                          <td className='text-center'><CButton color="primary" type="button" size="sm"><CIcon icon={cilFile} size="sm" /> </CButton></td>
                          <td><CImage src={convertLocalPathToUrl(item.FilePath)} /></td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                <CButton color="primary" type="submit" className="px-4">
                  Update Data
                </CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default CustomerEdit
