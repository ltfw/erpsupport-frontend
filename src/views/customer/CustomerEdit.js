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
  CRow,
} from '@coreui/react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { useForm } from 'react-hook-form'
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
                    value={data.KodeLgn ?? ''}
                    disabled
                    size="sm"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    id="NamaLgn"
                    label="Nama Customer"
                    {...register('NamaLgn')}
                    size="sm"
                  />
                  {errors.NamaLgn && <p style={{ color: 'red' }}>{errors.NamaLgn.message}</p>}
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    id="NomorLgnBpom"
                    label="Kode Farma"
                    {...register('NomorLgnBpom')}
                    size="sm"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    id="NomorLgnKemenkes"
                    label="Kode Alkes"
                    {...register('NomorLgnKemenkes')}
                    size="sm"
                  />
                </CCol>

                <h5>Customer Address</h5>
                <CCol md={6}>
                  <CFormInput id="Alamat1" label="Alamat" {...register('Alamat1')} size="sm" />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="Province" label="Province" {...register('Province')} size="sm" />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="Regency" label="Regency" {...register('Regency')} size="sm" />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="KodePos" label="KodePos" {...register('KodePos')} size="sm" />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    id="CountryCode"
                    label="CountryCode"
                    {...register('CountryCode')}
                    size="sm"
                  />
                </CCol>

                <h5>Teritory</h5>
                <CCol md={6}>
                  <CFormInput id="KodeWil" label="Wilayah" {...register('KodeWil')} size="sm" />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="Rayon" label="Rayon" {...register('RayonCode')} size="sm" />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="Cabang" label="Branch/Site" {...register('KodeDept')} size="sm" />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    id="District"
                    label="Wide Teritory"
                    {...register('District')}
                    size="sm"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="Village" label="Teritory" {...register('Village')} size="sm" />
                </CCol>

                <h4>Billing</h4>
                <CCol md={6}>
                  <CFormInput
                    id="CustomerGroup"
                    label="Group Customer"
                    {...register('CustomerGroup')}
                    size="sm"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    id="TaxLiability"
                    label="Tax Liability*"
                    {...register('TaxLiability')}
                    size="sm"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="TaxId" label="Tax ID (NPWP)" {...register('TaxId')} size="sm" />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    id="BillToAccount"
                    label="Bill to Account*"
                    {...register('BillToAccount')}
                    size="sm"
                  />
                </CCol>

                <h5>Informasi NPWP Customer</h5>
                <CCol md={6}>
                  <CFormInput
                    id="NpwpName"
                    label="Nama pada NPWP*"
                    {...register('NpwpName')}
                    size="sm"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="Address" label="Alamat*" {...register('Address')} size="sm" />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="Phone" label="Telepon*" {...register('Phone')} size="sm" />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="Npwp" label="NPWP*" {...register('Npwp')} size="sm" />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="Nitku" label="NITKU*" {...register('Nitku')} size="sm" />
                </CCol>

                <h4>Contact</h4>
                <CCol md={6}>
                  <CFormInput
                    id="ContactName"
                    label="Nama"
                    {...register('ContactName')}
                    size="sm"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    id="JobTitle"
                    label="Function/Jabatan"
                    {...register('JobTitle')}
                    size="sm"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="Email" label="Email" {...register('Email')} size="sm" />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="Phone" label="Telpon/HP" {...register('Phone')} size="sm" />
                </CCol>
                <CCol md={6}>
                  <CFormInput id="Fax" label="Fax" {...register('Fax')} size="sm" />
                </CCol>
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
