import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div className="ms-auto">
        <span className="me-1">Created by</span>
          IT Satoria Group
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
