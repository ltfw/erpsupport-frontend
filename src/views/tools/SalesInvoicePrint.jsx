import React from 'react'
import PropTypes from 'prop-types'
import logoSdl from '../../assets/brand/logo-sdl.png'
import { formatRupiah } from '../../utils/Number'
import { terbilangRupiah } from '../../utils/Terbilang'

// Half letter landscape: 21.59 x 13.97 cm
export const SALES_INVOICE_PAGE_STYLE = `
  @page { size: 215.9mm 139.7mm; margin: 5mm 6mm; }
  html, body { margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; color: #000; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`

const ROWS_PER_PAGE = 8
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

const fmtTanggal = (iso) => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d} ${BULAN[parseInt(m, 10) - 1]} ${y}`
}

const fmtQty = (n) => (parseFloat(n) || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 })

const fmtDisc = (item) =>
  [item.ItemDisPsn, item.ItemDisPsn2, item.ItemDisPsn3]
    .map((p) => parseFloat(p) || 0)
    .filter((p, i) => i === 0 || p > 0)
    .map((p) => formatRupiah(p))
    .join('+')

// Collapse the long whitespace runs stored in Departments.IzinPBF / IzinPAK
const fmtIzin = (s) => (s || '').trim().replace(/\s{2,}/g, '\u00a0'.repeat(6))

const B = '1px solid #000'
const S = {
  page: {
    width: '203.9mm',
    height: '129.5mm',
    fontSize: '7.5pt',
    lineHeight: 1.25,
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
  cell: { border: B, padding: '1mm 1.5mm', verticalAlign: 'top' },
  th: { border: B, padding: '0.6mm 1mm', fontWeight: 'normal', textAlign: 'center' },
  td: { padding: '0.3mm 1mm', whiteSpace: 'nowrap', overflow: 'hidden' },
  right: { textAlign: 'right' },
  center: { textAlign: 'center' },
}

const InfoRow = ({ label, value }) => (
  <tr>
    <td style={{ width: '15mm', padding: 0 }}>{label}</td>
    <td style={{ padding: 0 }}>: {value}</td>
  </tr>
)
InfoRow.propTypes = { label: PropTypes.node, value: PropTypes.node }

const Header = ({ h }) => (
  <div style={{ display: 'flex', gap: '2mm' }}>
    {/* Branch / order info */}
    <div style={{ width: '50%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5mm' }}>
        <img
          src={new URL(logoSdl, window.location.href).href}
          alt="SDL"
          style={{ width: '13mm', marginTop: '1mm' }}
        />
        <div>
          <div style={{ fontSize: '8.5pt' }}>PT. SATORIA DISTRIBUSI LESTARI</div>
          <div>NPWP &nbsp;: {h.NpwpCabang}</div>
          <div style={{ fontSize: '6.5pt' }}>{h.AlamatCabang}</div>
        </div>
      </div>
      <table style={{ ...S.table, marginTop: '0.5mm' }}>
        <tbody>
          <InfoRow label="Izin PBF" value={fmtIzin(h.IzinPBF)} />
          <InfoRow label="Izin DAK" value={fmtIzin(h.IzinPAK)} />
        </tbody>
      </table>
      <div style={{ display: 'flex', marginTop: '0.5mm' }}>
        <table style={{ ...S.table, width: '55%' }}>
          <tbody>
            <InfoRow label="No. SP" value={h.PoLanggan} />
            <InfoRow label="Tgl Order" value={fmtTanggal(h.TglPo || h.TglFaktur)} />
            <InfoRow label="Salesman" value={h.NamaSales} />
            <InfoRow label="No. SO" value={h.AllNoSo} />
            <InfoRow label="TOP" value={h.KetSyaratBayar} />
          </tbody>
        </table>
        <div style={{ width: '45%' }}>
          <div>Jth Tempo &nbsp;: {fmtTanggal(h.TglJthtmp)}</div>
          <div>PEMBAYARAN DITUJUKAN:</div>
          <div>{h.PembayaranKe}</div>
          <div>VA/No Rek BCA &nbsp;: {h.NoVa}</div>
        </div>
      </div>
    </div>

    {/* Invoice box */}
    <table style={{ ...S.table, width: '50%', height: 'fit-content' }}>
      <tbody>
        <tr>
          <td style={{ ...S.cell, ...S.center, width: '55%', backgroundColor: '#d9d9d9' }}>
            INVOICE
          </td>
          <td style={S.cell}></td>
        </tr>
        <tr>
          <td style={{ ...S.cell, ...S.center }}>{h.NoBukti}</td>
          <td style={{ ...S.cell, ...S.center }}>Tanggal : {fmtTanggal(h.TglFaktur)}</td>
        </tr>
        <tr>
          <td style={{ ...S.cell, height: '22mm' }}>
            <div>Kepada Yth.</div>
            <div style={{ minHeight: '6mm' }}>{h.NamaTagih}</div>
            <div style={{ fontSize: '7pt' }}>{h.AlamatTagih}</div>
          </td>
          <td style={S.cell}>
            <div>Alamat Pengiriman:</div>
            <div style={{ minHeight: '6mm' }}>{h.NamaKirim}</div>
            <div style={{ fontSize: '7pt' }}>{h.AlamatKirim}</div>
          </td>
        </tr>
        <tr>
          <td style={S.cell}>NPWP : {h.NpwpLgn}</td>
          <td style={S.cell}>Kode Pelanggan: {h.KodeLgn}</td>
        </tr>
      </tbody>
    </table>
  </div>
)
Header.propTypes = { h: PropTypes.object.isRequired }

const ItemsTable = ({ rows, startNo }) => (
  <table style={{ ...S.table, marginTop: '1.5mm' }}>
    <colgroup>
      <col style={{ width: '7mm' }} />
      <col style={{ width: '18mm' }} />
      <col style={{ width: '50mm' }} />
      <col style={{ width: '33mm' }} />
      <col style={{ width: '13mm' }} />
      <col style={{ width: '9mm' }} />
      <col style={{ width: '20mm' }} />
      <col style={{ width: '20mm' }} />
      <col />
    </colgroup>
    <thead>
      <tr>
        {[
          'No.',
          'Kode Barang',
          'Nama Barang',
          'Batch & ED',
          'Qty',
          'UoM',
          'Harga Satuan',
          '%Disc',
          'Jumlah Harga',
        ].map((t) => (
          <th key={t} style={S.th}>
            {t}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((r, i) => (
        <tr key={`${r.SalesInvoiceItemId}-${r.BatchNumber || i}`}>
          <td style={{ ...S.td, ...S.center }}>{startNo + i}</td>
          <td style={S.td}>{r.KodeItem}</td>
          <td style={S.td}>{r.NamaBarang}</td>
          <td style={{ ...S.td, ...S.center }}>
            {r.BatchNumber ? `${r.BatchNumber} - ${r.TglExpired || ''}` : ''}
          </td>
          <td style={{ ...S.td, ...S.right }}>{fmtQty(r.Qty)}</td>
          <td style={S.td}>{r.Satuan}</td>
          <td style={{ ...S.td, ...S.right }}>{formatRupiah(r.HargaJual)}</td>
          <td style={{ ...S.td, ...S.right }}>{fmtDisc(r)}</td>
          <td style={{ ...S.td, ...S.right }}>
            {formatRupiah((parseFloat(r.Qty) || 0) * (parseFloat(r.HargaJual) || 0))}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)
ItemsTable.propTypes = { rows: PropTypes.array.isRequired, startNo: PropTypes.number.isRequired }

const Totals = ({ t }) => (
  <table style={{ ...S.table, marginTop: '2mm' }}>
    <tbody>
      <tr>
        {['Total', 'Potongan', 'DPP', 'Dpp Lain', 'PPN', 'Biaya Kirim', 'Jumlah Tagihan'].map(
          (l) => (
            <td key={l} style={{ ...S.cell, ...S.center, padding: '0.5mm' }}>
              {l}
            </td>
          ),
        )}
      </tr>
      <tr>
        {[t.total, t.potongan, t.dpp, t.dppLain, t.ppn, t.biayaKirim, t.tagihan].map((v, i) => (
          <td key={i} style={{ ...S.cell, ...S.center, padding: '0.5mm' }}>
            {formatRupiah(v)}
          </td>
        ))}
      </tr>
    </tbody>
  </table>
)
Totals.propTypes = { t: PropTypes.object.isRequired }

const Footer = ({ t, kemasan, apoteker, pageNo, pageCount, isLast }) => (
  <div style={{ display: 'flex', marginTop: '1mm' }}>
    <div style={{ flex: 1 }}>
      <div style={{ minHeight: '4mm' }}>
        {isLast && (
          <>
            Terbilang &nbsp;: <span style={{ fontSize: '8pt' }}>{terbilangRupiah(t.tagihan)}</span>
          </>
        )}
      </div>
      <div style={{ display: 'flex', marginTop: '1mm' }}>
        <div style={{ width: '33%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ paddingLeft: '10mm' }}>Hormat Kami,</div>
          <div style={{ marginTop: 'auto' }}>{apoteker?.NamaPenanggungJawab}</div>
          <div style={{ fontSize: '6pt' }}>{apoteker?.NoPenanggungJawab}</div>
        </div>
        <div style={{ width: '24%', textAlign: 'center' }}>
          <div>Penerima</div>
          <div>Tgl &amp; Jam,</div>
          <div style={{ marginTop: '13mm' }}>
            ( <span style={{ display: 'inline-block', width: '30mm', borderBottom: B }} /> )
          </div>
        </div>
        <div style={{ width: '43%', fontSize: '6pt', lineHeight: 1.3 }}>
          <div>Perhatian;</div>
          <div>
            1. Barang yang telah diterima dengan baik tidak dapat dikembalikan atau ditukar dengan
            barang lain.
          </div>
          <div>2. Invoice ASLI berlaku sebagai kwitansi</div>
          <div>3. Tidak menerima pembayaran tunai</div>
          <div>
            4. Pembayaran dengan Cheque atau Giro harus ada atas nama PT. Satoria Distribusi Lestari
            dan dianggap lunas setelah diuangkan
          </div>
        </div>
      </div>
    </div>
    <div style={{ width: '30mm', marginLeft: '2mm' }}>
      <table style={S.table}>
        <tbody>
          <tr>
            <td colSpan={2} style={{ ...S.cell, ...S.center, padding: '0.3mm' }}>
              Kemasan
            </td>
          </tr>
          {[
            ['Kg', isLast ? formatRupiah(kemasan.kg) : ''],
            [
              'Dimensi',
              isLast
                ? kemasan.m3.toLocaleString('id-ID', {
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 4,
                  })
                : '',
            ],
            ['Koli', ''],
            ['Lbr', ''],
          ].map(([l, v]) => (
            <tr key={l}>
              <td style={{ ...S.cell, padding: '0.3mm 1mm', width: '45%' }}>{l}</td>
              <td style={{ ...S.cell, ...S.right, padding: '0.3mm 1mm', height: '3.5mm' }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ paddingLeft: '2mm' }}>
        Hal &nbsp;{pageNo}/{pageCount}
      </div>
    </div>
  </div>
)
Footer.propTypes = {
  t: PropTypes.object.isRequired,
  kemasan: PropTypes.object.isRequired,
  apoteker: PropTypes.object,
  pageNo: PropTypes.number.isRequired,
  pageCount: PropTypes.number.isRequired,
  isLast: PropTypes.bool.isRequired,
}

const num = (v) => parseFloat(v) || 0
const round2 = (v) => Math.round(v * 100) / 100

export const PEMBULATAN = { ATAS: 'atas', BAWAH: 'bawah' }

// atas: 100,10 -> 101 | bawah: 100,10 -> 100, 100,50 -> 101
const bulatkanDpp = (dpp, mode) => {
  const rupiah = Math.round(dpp * 100) / 100
  return mode === PEMBULATAN.ATAS ? Math.ceil(rupiah) : Math.round(rupiah)
}

const hitungTotal = (h, items, mode) => {
  const total = items.reduce((s, r) => s + num(r.Qty) * num(r.HargaJual), 0)
  const dppAsli = num(h.Dpp)
  const ppnAsli = num(h.PPN)

  const dpp = bulatkanDpp(dppAsli, mode)
  let ppn = 0
  if (ppnAsli !== 0) {
    const rate = num(h.PpnPersen) > 0 ? num(h.PpnPersen) / 100 : ppnAsli / dppAsli
    // Always half-up to whole rupiah: 100,10 -> 100, 100,50 -> 101
    ppn = Math.round(round2(dpp * rate))
  }

  return {
    total,
    // Discount is what the customer actually got, so it stays on the unrounded DPP.
    // PPN-inclusive invoices carry the tax inside the gross price.
    potongan: total - dppAsli - (h.TypePpn === 'I' ? ppnAsli : 0),
    dpp,
    dppLain: Math.round(round2((dpp * 11) / 12)),
    ppn,
    biayaKirim: num(h.OngkosAngkut),
    // Keep every other GrandTotal component (ongkos kirim, meterai, ...) and swap DPP + PPN
    tagihan: round2(num(h.GrandTotal) - dppAsli - ppnAsli + dpp + ppn),
  }
}

const SalesInvoicePrint = ({ data, pembulatan }) => {
  const { header: h, items, apoteker } = data
  const t = hitungTotal(h, items, pembulatan)

  // Weight/volume per shipping carton from BeratProduks, scaled to the base-unit qty
  const kemasan = items.reduce(
    (acc, r) => {
      const isi = num(r.IsiKemasan)
      if (!isi) return acc
      const karton = (num(r.Qty) * (num(r.Konversi) || 1)) / isi
      acc.kg += karton * num(r.BeratKemasan)
      acc.m3 += karton * num(r.VolumeKemasan)
      return acc
    },
    { kg: 0, m3: 0 },
  )

  const pages = []
  for (let i = 0; i < Math.max(items.length, 1); i += ROWS_PER_PAGE) {
    pages.push(items.slice(i, i + ROWS_PER_PAGE))
  }

  return (
    <>
      {pages.map((rows, p) => {
        const isLast = p === pages.length - 1
        return (
          <div key={p} style={{ ...S.page, pageBreakAfter: isLast ? 'auto' : 'always' }}>
            <Header h={h} />
            <div style={{ height: '41mm' }}>
              <ItemsTable rows={rows} startNo={p * ROWS_PER_PAGE + 1} />
            </div>
            {isLast ? (
              <Totals t={t} />
            ) : (
              <div style={{ ...S.right, marginTop: '2mm', height: '8.5mm' }}>Bersambung...</div>
            )}
            <Footer
              t={t}
              kemasan={kemasan}
              apoteker={apoteker}
              pageNo={p + 1}
              pageCount={pages.length}
              isLast={isLast}
            />
          </div>
        )
      })}
    </>
  )
}

SalesInvoicePrint.propTypes = {
  data: PropTypes.shape({
    header: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,
    apoteker: PropTypes.object,
  }).isRequired,
  pembulatan: PropTypes.oneOf(Object.values(PEMBULATAN)).isRequired,
}

export default SalesInvoicePrint
