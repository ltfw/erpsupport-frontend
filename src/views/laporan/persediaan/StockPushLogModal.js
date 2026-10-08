import { useEffect, useState } from 'react'
import { CBadge, CButton, CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react'
import axios from 'axios'
import { DataTable } from 'src/components'
const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const STATUS_COLOR = { SUCCESS: 'success', FAILED: 'danger', SKIPPED: 'secondary' }

const formatDateTime = (value) => {
  if (!value) return '-'
  const [date, time] = value.split(' ')
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year} ${time}`
}

const formatDate = (value) => (value ? formatDateTime(value).split(' ')[0] : '-')

const LogDetail = ({ data }) => (
  <div className="p-3 small">
    {data.Branches?.length > 0 && (
      <div className="mb-2">
        <strong>Per cabang:</strong>{' '}
        {data.Branches.map((b) => `${b.distributor_code}: ${b.items} item`).join(', ')}
      </div>
    )}
    {data.HttpStatus && (
      <div className="mb-2">
        <strong>HTTP status:</strong> {data.HttpStatus}
      </div>
    )}
    {data.Message && (
      <div className="mb-2">
        <strong>Pesan:</strong> {data.Message}
      </div>
    )}
    {data.ResponseBody && (
      <div>
        <strong>Respon Stock API:</strong>
        <pre className="mb-0 mt-1 p-2 bg-body-tertiary rounded" style={{ whiteSpace: 'pre-wrap' }}>
          {data.ResponseBody}
        </pre>
      </div>
    )}
  </div>
)

const StockPushLogModal = ({ visible, onClose }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [error, setError] = useState('')

  const loadLogs = async (page, perPage) => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get(`${ENDPOINT_URL}stocks/perbatch/push-logs`, {
        params: { page, per_page: perPage },
      })
      setData(response.data.data)
      setTotalRows(response.data.pagination.total)
    } catch (err) {
      console.error('Error fetching push logs:', err)
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible) loadLogs(page, perPage)
  }, [visible, page, perPage])

  const columns = [
    {
      name: 'Waktu',
      selector: (row) => formatDateTime(row.StartedAt),
      width: '160px',
    },
    {
      name: 'Pemicu',
      selector: (row) =>
        row.TriggerBy === 'cron' ? 'Otomatis' : row.TriggerBy.replace('manual:', 'Manual: '),
      wrap: true,
    },
    {
      name: 'Tgl Stok',
      selector: (row) => formatDate(row.StockDate),
      width: '110px',
    },
    {
      name: 'Request ID',
      selector: (row) => row.RequestId || '-',
      wrap: true,
    },
    {
      name: 'Status',
      cell: (row) => <CBadge color={STATUS_COLOR[row.Status] || 'secondary'}>{row.Status}</CBadge>,
      width: '100px',
    },
    {
      name: 'Total Item',
      selector: (row) => row.TotalItems ?? '-',
      right: true,
      width: '100px',
    },
  ]

  return (
    <CModal visible={visible} onClose={onClose} size="xl" scrollable>
      <CModalHeader>
        <CModalTitle>Log Push Stok</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <small className="text-body-secondary">
            Push otomatis setiap hari jam 09:00 WIB (kecuali Minggu). Klik baris untuk melihat
            detail.
          </small>
          <CButton
            color="secondary"
            variant="outline"
            size="sm"
            onClick={() => loadLogs(page, perPage)}
          >
            Refresh
          </CButton>
        </div>
        {error && <div className="alert alert-danger py-2">Gagal memuat log: {error}</div>}
        <DataTable
          dense
          columns={columns}
          data={data}
          progressPending={loading}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          onChangePage={setPage}
          onChangeRowsPerPage={(newPerPage, newPage) => {
            setPerPage(newPerPage)
            setPage(newPage)
          }}
          expandableRows
          expandableRowsComponent={LogDetail}
          expandOnRowClicked
          noDataComponent={<div className="p-3">Belum ada log push stok</div>}
        />
      </CModalBody>
    </CModal>
  )
}

export default StockPushLogModal
