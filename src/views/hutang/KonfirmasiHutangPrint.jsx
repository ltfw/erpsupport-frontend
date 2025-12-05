import axios from 'axios'
import React, { useRef, useEffect, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import { useParams, useNavigate } from 'react-router-dom'
import { formatRupiahWithoutDecimal } from '../../utils/Number'
import { formatDateToDDMMYYYY } from '../../utils/Date'

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

// Base cell style
const cellStyle = {
  border: '1px solid black',
  padding: '5px',
  fontSize: '11px',
}

// Header style
const headerCellStyle = {
  ...cellStyle,
  fontWeight: 'bold',
  textAlign: 'center',
  backgroundColor: '#e0e0e0',
}

// Style for total row labels (left side)
const totalLabelStyle = {
  ...cellStyle,
  borderLeft: 'none',
  borderRight: 'none',
  borderBottom: 'none',
  borderTop: '2px solid black',
  fontWeight: 'bold',
  backgroundColor: '#f0f0f0',
}

// Style for total amount (right side)
const totalAmountStyle = {
  ...totalLabelStyle,
  textAlign: 'right',
}

// Grand total style (slightly bolder)
const grandTotalLabelStyle = {
  ...totalLabelStyle,
  borderTop: '3px double black',
  backgroundColor: '#e8e8e8',
  fontWeight: 'bold',
}

const grandTotalAmountStyle = {
  ...totalAmountStyle,
  borderTop: '3px double black',
  backgroundColor: '#e8e8e8',
}

const groupByNama = (rows) => {
  const groups = {}
  rows.forEach((row) => {
    const key = row.NamaLgn?.trim() || 'Tanpa Nama'
    if (!groups[key]) {
      groups[key] = { rows: [], total: 0 }
    }
    groups[key].rows.push(row)
    groups[key].total += Number(row.Nominal || 0)
  })
  return groups
}

const KonfirmasiHutangPrint = () => {
  const { startDate, endDate, selectedSupplier } = useParams()
  const navigate = useNavigate()
  const componentRef = useRef()

  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Pengajuan Pembayaran Hutang',
    pageStyle: `
      @page { size: A4 portrait; margin: 1cm; }
      body { font-family: Arial, sans-serif; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `,
    onAfterPrint: () => navigate(-1),
  })

  useEffect(() => {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    if (selectedSupplier && selectedSupplier !== 'all') params.append('vendor', selectedSupplier)
    params.append('page', '1')
    params.append('per_page', '10000')

    axios
      .get(`${ENDPOINT_URL}hutang/konfirmasihutang?${params.toString()}`)
      .then((res) => {
        setRows(res.data?.data || [])
        setIsLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setIsLoading(false)
      })
  }, [startDate, endDate, selectedSupplier])

  useEffect(() => {
    if (!isLoading && rows.length > 0) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => handlePrint(), 300)
    }
  }, [isLoading, rows, handlePrint])

  const PrintTemplate = () => {
    const groups = groupByNama(rows)
    const grandTotal = rows.reduce((sum, r) => sum + Number(r.Nominal || 0), 0)

    return (
      <div style={{ padding: '3px', lineHeight: '1' }}>
        {/* Header Letter */}
        <p style={{ margin: '0 0 4px 0', textDecoration: 'underline' }}>Kepada Yth,</p>
        <p style={{ margin: '0 0 20px 0' }}>Tim Finance PT Bumi Satoria</p>

        <p style={{ textAlign: 'justify', marginBottom: '16px' }}>
          Sesuai dengan daftar hutang yang tercatat di PT SDL sebagaimana terlampir, bersama ini kami
          mengajukan alokasi dana untuk pembayaran hutang dagang dengan rincian sebagai berikut:
        </p>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr>
              <th style={{ ...headerCellStyle, width: '35px' }}>No</th>
              <th style={{ ...headerCellStyle, width: '140px' }}>Nama</th>
              <th style={{ ...headerCellStyle, width: '100px' }}>No Faktur</th>
              <th style={{ ...headerCellStyle, width: '120px' }}>No Invoice Supplier</th>
              <th style={{ ...headerCellStyle, width: '90px' }}>Tgl Faktur</th>
              <th style={{ ...headerCellStyle, width: '90px' }}>Tgl Jatuh Tempo</th>
              <th style={{ ...headerCellStyle, width: '70px' }}>Overdue</th>
              <th style={{ ...headerCellStyle, width: '110px' }}>Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groups).map(([nama, group], groupIndex) => {
              let rowNum = 1
              const isLastGroup = groupIndex === Object.keys(groups).length - 1

              return (
                <React.Fragment key={nama}>
                  {group.rows.map((row, idx) => (
                    <tr key={`${nama}-${row.NoFaktur}-${idx}`}>
                      <td style={{ ...cellStyle, textAlign: 'center' }}>{rowNum++}</td>
                      <td style={cellStyle}>{row.NamaLgn || '-'}</td>
                      <td style={cellStyle}>{row.NoFaktur || '-'}</td>
                      <td style={cellStyle}>{row.NoFakturSupplier || '-'}</td>
                      <td style={{ ...cellStyle, textAlign: 'center' }}>{formatDateToDDMMYYYY(row.TglTrn) || '-'}</td>
                      <td style={{ ...cellStyle, textAlign: 'center' }}>{formatDateToDDMMYYYY(row.TglJthTmp) || '-'}</td>
                      <td style={{ ...cellStyle, textAlign: 'center' }}>
                        {row.UmurHutang != null ? `${row.UmurHutang} hari` : '-'}
                      </td>
                      <td style={{ ...cellStyle, textAlign: 'right' }}>
                        Rp {formatRupiahWithoutDecimal(row.Nominal)}
                      </td>
                    </tr>
                  ))}

                  {/* Spacer to break border continuity */}
                  <tr>
                    <td colSpan={8} style={{ border: 'none', padding: 0, height: '4px' }} />
                  </tr>

                  {/* Total per supplier */}
                  <tr>
                    <td colSpan={7} style={totalLabelStyle}>
                      Total {nama === 'Tanpa Nama' ? 'Tanpa Nama Supplier' : nama}
                    </td>
                    <td style={totalAmountStyle}>
                      Rp {formatRupiahWithoutDecimal(group.total)}
                    </td>
                  </tr>

                  {/* Extra spacing before next group (except last) */}
                  {!isLastGroup && (
                    <tr>
                      <td colSpan={8} style={{ border: 'none', padding: 0, height: '8px' }} />
                    </tr>
                  )}
                </React.Fragment>
              )
            })}

            {/* Grand Total */}
            <tr>
              <td colSpan={8} style={{ border: 'none', padding: 0, height: '8px' }} />
            </tr>
            <tr>
              <td colSpan={7} style={grandTotalLabelStyle}>GRAND TOTAL</td>
              <td style={grandTotalAmountStyle}>
                Rp {formatRupiahWithoutDecimal(grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Closing */}
        <p style={{ textAlign: 'justify', marginTop: '20px' }}>
          Demikian pengajuan ini kami sampaikan. Besar harapan kami agar dapat diproses sesuai prosedur
          yang berlaku. Atas perhatian dan kerja sama yang diberikan, kami ucapkan terima kasih.
        </p>

        <div style={{ marginTop: '50px', marginBottom: '80px' }}>
          <p style={{ margin: 0 }}>Hormat kami,</p>
          <p style={{ margin: '60px 0 0 0', fontWeight: 'bold' }}>Finance PT. SDL</p>
        </div>
      </div>
    )
  }

  if (isLoading || rows.length === 0) return null

  return (
    <div style={{ display: 'none' }}>
      <div ref={componentRef}>
        <PrintTemplate />
      </div>
    </div>
  )
}

export default KonfirmasiHutangPrint