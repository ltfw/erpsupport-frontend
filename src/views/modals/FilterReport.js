import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormSelect,
  CLink,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CPopover,
  CRow,
  CTooltip,
} from '@coreui/react'
import { DocsComponents, DocsExample } from 'src/components'

const FilterReport = ({ visible, onClose, onExport }) => {
  return (
    <>
      <CModal alignment="center" visible={visible} onClose={onClose}>
        <CModalHeader>
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol xs={12}>
              <CCard>
                <CCardHeader>Filter Report</CCardHeader>
                <CCardBody>
                  <CRow>
                    <CCol xs={12}>
                      <CFormSelect aria-label="Default select example">
                        <option>Open this select menu</option>
                        <option value="1">One</option>
                        <option value="2">Two</option>
                        <option value="3">Three</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose}>
            Close
          </CButton>
          <CButton color="primary" onClick={onExport}>Export Excel</CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}


export default FilterReport
