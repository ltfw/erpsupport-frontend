import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { CChartBar } from '@coreui/react-chartjs'
import { useAuth } from '../../contexts/AuthContext'
import './Dashboard.scss'

const ENDPOINT_URL = import.meta.env.VITE_BACKEND_URL

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const BULAN_PANJANG = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

const nf = (digits) =>
  new Intl.NumberFormat('id-ID', { minimumFractionDigits: digits, maximumFractionDigits: digits })

// Compact rupiah: M = miliar, jt = juta
const rupiahShort = (v) => {
  const abs = Math.abs(v)
  if (abs >= 1e12) return `Rp ${nf(2).format(v / 1e12)} T`
  if (abs >= 1e9) return `Rp ${nf(abs >= 1e11 ? 1 : 2).format(v / 1e9)} M`
  if (abs >= 1e6) return `Rp ${nf(abs >= 1e8 ? 0 : 1).format(v / 1e6)} jt`
  return `Rp ${nf(0).format(v)}`
}
const rupiahFull = (v) => `Rp ${nf(0).format(v)}`
const count = (v) => nf(0).format(v)
const pct = (v) => `${nf(1).format(v)}%`

const formatTanggal = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${BULAN_PANJANG[m - 1]} ${y}`
}

const monthOptions = () => {
  const now = new Date()
  return Array.from({ length: 24 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return { value, label: `${BULAN_PANJANG[d.getMonth()]} ${d.getFullYear()}` }
  })
}

// Re-read CSS tokens when the CoreUI light/dark theme changes, so chart colors follow it
const useThemeTokens = (ref) => {
  const [tokens, setTokens] = useState(null)
  useEffect(() => {
    const read = () => {
      if (!ref.current) return
      const s = getComputedStyle(ref.current)
      const v = (name) => s.getPropertyValue(name).trim()
      setTokens({
        series1: v('--dash-series-1'),
        series2: v('--dash-series-2'),
        surface: v('--dash-surface'),
        text: v('--dash-text-secondary'),
        grid: v('--dash-grid'),
      })
    }
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-coreui-theme'],
    })
    return () => observer.disconnect()
  }, [ref])
  return tokens
}

const Panel = ({ title, note, action, children, className = '' }) => (
  <section className={`dash-panel ${className}`}>
    <header className="dash-panel__head">
      <div>
        <h2 className="dash-panel__title">{title}</h2>
        {note && <p className="dash-panel__note">{note}</p>}
      </div>
      {action}
    </header>
    {children}
  </section>
)

const RankList = ({ rows, max, renderValue, highlight }) => (
  <ul className="dash-rank">
    {rows.map((r) => (
      <li key={r.key} className={`dash-rank__row ${highlight?.(r) ? 'is-critical' : ''}`}>
        <span className="dash-rank__label" title={r.label}>
          {r.label}
        </span>
        <span className="dash-rank__value">{renderValue(r)}</span>
        <span className="dash-rank__track" aria-hidden="true">
          <span
            className="dash-rank__bar"
            style={{ width: `${max > 0 ? Math.max((Math.max(r.value, 0) / max) * 100, 0.5) : 0}%` }}
          />
        </span>
      </li>
    ))}
  </ul>
)

const SalesTrend = ({ trend, month, isCurrentMonth, asOfDate, tokens }) => {
  const [showTable, setShowTable] = useState(false)
  const year = month.slice(0, 4)
  const lastIdx = trend.length - 1
  // Axis unit follows the scale: miliar for company-wide, juta for a small cabang
  const peak = Math.max(0, ...trend.map((t) => t.reguler + t.eKatalog))
  const axisTick = (v) => {
    if (v === 0) return '0'
    return peak >= 2e9 ? `Rp ${nf(0).format(v / 1e9)} M` : `Rp ${nf(0).format(v / 1e6)} jt`
  }
  const labels = trend.map((t, i) =>
    i === lastIdx && isCurrentMonth
      ? `${BULAN[t.bulan - 1]} (s.d. ${Number(asOfDate.slice(8))})`
      : BULAN[t.bulan - 1],
  )

  const data = {
    labels,
    datasets: [
      {
        label: 'Reguler',
        data: trend.map((t) => t.reguler),
        backgroundColor: tokens.series1,
        borderColor: tokens.surface,
        borderWidth: { top: 2 },
        borderSkipped: 'bottom',
        borderRadius: { bottomLeft: 4, bottomRight: 4 },
        stack: 'sales',
      },
      {
        label: 'E-Katalog',
        data: trend.map((t) => t.eKatalog),
        backgroundColor: tokens.series2,
        borderWidth: 0,
        borderRadius: { topLeft: 4, topRight: 4 },
        borderSkipped: false,
        stack: 'sales',
      },
    ],
  }

  const options = {
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    datasets: { bar: { maxBarThickness: 40, categoryPercentage: 0.7 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${rupiahShort(ctx.parsed.y)}`,
          footer: (items) => `Total: ${rupiahShort(items.reduce((s, i) => s + i.parsed.y, 0))}`,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: tokens.text },
        border: { display: false },
      },
      y: {
        stacked: true,
        border: { display: false },
        grid: { color: tokens.grid },
        ticks: {
          color: tokens.text,
          maxTicksLimit: 5,
          callback: axisTick,
        },
      },
    },
  }

  return (
    <Panel
      title={`Tren penjualan ${year}`}
      note="Total penjualan per bulan, dipisah menurut tipe jual"
      className="dash-panel--trend"
      action={
        <button type="button" className="dash-link" onClick={() => setShowTable((v) => !v)}>
          {showTable ? 'Tampilkan grafik' : 'Tampilkan tabel'}
        </button>
      }
    >
      <div className="dash-legend">
        <span className="dash-legend__item">
          <span className="dash-swatch dash-swatch--1" />
          Reguler
        </span>
        <span className="dash-legend__item">
          <span className="dash-swatch dash-swatch--2" />
          E-Katalog
        </span>
      </div>
      {showTable ? (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th scope="col">Bulan</th>
                <th scope="col" className="num">
                  Reguler
                </th>
                <th scope="col" className="num">
                  E-Katalog
                </th>
                <th scope="col" className="num">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {trend.map((t, i) => (
                <tr key={t.bulan}>
                  <td>{labels[i]}</td>
                  <td className="num">{rupiahFull(t.reguler)}</td>
                  <td className="num">{rupiahFull(t.eKatalog)}</td>
                  <td className="num">{rupiahFull(t.reguler + t.eKatalog)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="dash-chart">
          <CChartBar data={data} options={options} />
        </div>
      )}
    </Panel>
  )
}

const Kpi = ({ label, value, title, children }) => (
  <div className="dash-kpi">
    <p className="dash-kpi__label">{label}</p>
    <p className="dash-kpi__value" title={title}>
      {value}
    </p>
    <div className="dash-kpi__meta">{children}</div>
  </div>
)

const Dashboard = () => {
  const { user } = useAuth()
  const rootRef = useRef(null)
  const tokens = useThemeTokens(rootRef)
  const months = useMemo(monthOptions, [])

  const [month, setMonth] = useState(months[0].value)
  const [cabang, setCabang] = useState('')
  const [cabangList, setCabangList] = useState([])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ month })
      if (cabang) params.set('cabang', cabang)
      const res = await axios.get(`${ENDPOINT_URL}dashboard/summary?${params}`)
      setData(res.data)
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Data dashboard tidak dapat dimuat. Periksa koneksi lalu coba lagi.',
      )
    } finally {
      setLoading(false)
    }
  }, [month, cabang])

  useEffect(() => {
    load()
  }, [load])

  const canChooseCabang = data?.scope?.canChooseCabang
  useEffect(() => {
    if (!canChooseCabang || cabangList.length > 0) return
    axios
      .get(`${ENDPOINT_URL}departments?page=1&per_page=100`)
      .then((res) => setCabangList(res.data.data || []))
      .catch(() => setCabangList([]))
  }, [canChooseCabang, cabangList.length])

  const p = data?.penjualan
  const ar = data?.piutang
  const monthIdx = Number(month.slice(5)) - 1
  const monthLabel = `${BULAN_PANJANG[monthIdx]} ${month.slice(0, 4)}`

  const growth =
    p && p.penjualanBulanLalu > 0
      ? ((p.penjualan - p.penjualanBulanLalu) / p.penjualanBulanLalu) * 100
      : null
  // Average over completed months only, so a partial current month doesn't drag it down
  const averageNote = (() => {
    if (!p) return ''
    const partial = data.period.isCurrentMonth
    const fullMonths = partial ? monthIdx : monthIdx + 1
    if (fullMonths === 0) return 'Bulan pertama tahun ini, belum ada rata-rata'
    const avg = (partial ? p.ytd - p.penjualan : p.ytd) / fullMonths
    const range = fullMonths === 1 ? BULAN[0] : `Jan–${BULAN[fullMonths - 1]}`
    return `Rata-rata ${range}: ${rupiahShort(avg)} per bulan`
  })()
  const overdue90 = ar ? ar.aging[ar.aging.length - 1].value : 0
  const overdueAll = ar ? ar.aging.slice(1).reduce((s, a) => s + a.value, 0) : 0

  const grupRows = useMemo(() => {
    if (!p) return []
    const top = p.perGrup.slice(0, 7)
    const rest = p.perGrup.slice(7)
    const rows = top.map((g) => ({
      key: g.grup,
      label: g.grup,
      value: g.penjualan,
      pelanggan: g.pelanggan,
    }))
    if (rest.length > 0) {
      rows.push({
        key: '__lainnya',
        label: `Lainnya (${rest.length} grup)`,
        value: rest.reduce((s, g) => s + g.penjualan, 0),
        pelanggan: rest.reduce((s, g) => s + g.pelanggan, 0),
      })
    }
    return rows
  }, [p])

  const scopeName = (() => {
    if (!data) return ''
    if (data.scope.cabang.length === 0) return 'Semua cabang'
    const found = cabangList.find((c) => c.KodeDept === data.scope.cabang[0])
    return found?.NamaDept || p?.perCabang[0]?.nama || `Cabang ${data.scope.cabang.join(', ')}`
  })()

  return (
    <div className="dash" ref={rootRef}>
      <div className="dash-top">
        <div>
          <h1 className="dash-title">Ringkasan bisnis</h1>
          <p className="dash-subtitle">
            {user?.FullName ? `Halo, ${user.FullName}. ` : ''}
            {data
              ? `${scopeName}, data per ${formatTanggal(data.period.asOfDate)}.`
              : 'Memuat data…'}
          </p>
        </div>
        <div className="dash-filters">
          <label className="dash-filter">
            <span>Periode</span>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="form-select"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          {canChooseCabang && (
            <label className="dash-filter">
              <span>Cabang</span>
              <select
                value={cabang}
                onChange={(e) => setCabang(e.target.value)}
                className="form-select"
              >
                <option value="">Semua cabang</option>
                {cabangList.map((c) => (
                  <option key={c.KodeDept} value={c.KodeDept}>
                    {c.NamaDept}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>

      {error && (
        <div className="dash-error" role="alert">
          <span>{error}</span>
          <button type="button" className="dash-link" onClick={load}>
            Coba lagi
          </button>
        </div>
      )}

      {!data && loading && <div className="dash-loading">Memuat data dashboard…</div>}

      {data && tokens && (
        <div className={`dash-body ${loading ? 'is-loading' : ''}`} aria-busy={loading}>
          <div className="dash-kpis">
            <Kpi
              label={`Penjualan ${monthLabel}`}
              value={rupiahShort(p.penjualan)}
              title={rupiahFull(p.penjualan)}
            >
              {data.period.isCurrentMonth ? (
                <span>Bulan berjalan. Bulan lalu {rupiahShort(p.penjualanBulanLalu)}</span>
              ) : growth === null ? (
                <span>Tidak ada data bulan sebelumnya</span>
              ) : (
                <span className={growth >= 0 ? 'is-up' : 'is-down'}>
                  {growth >= 0 ? '▲' : '▼'} {pct(Math.abs(growth))} dari bulan sebelumnya
                </span>
              )}
            </Kpi>
            <Kpi
              label={`Penjualan Jan–${BULAN[monthIdx]} ${month.slice(0, 4)}`}
              value={rupiahShort(p.ytd)}
              title={rupiahFull(p.ytd)}
            >
              <span>{averageNote}</span>
            </Kpi>
            <Kpi label="Faktur terbit" value={count(p.faktur)}>
              <span>
                {count(p.pelanggan)} pelanggan aktif
                {p.retur > 0 ? `, retur ${rupiahShort(p.retur)}` : ''}
              </span>
            </Kpi>
            {ar ? (
              <Kpi
                label="Piutang belum lunas"
                value={rupiahShort(ar.total)}
                title={rupiahFull(ar.total)}
              >
                <span className={overdue90 > 0 ? 'is-down' : ''}>
                  {rupiahShort(overdue90)} lewat jatuh tempo &gt; 90 hari
                </span>
              </Kpi>
            ) : (
              <Kpi label="Pelanggan aktif" value={count(p.pelanggan)}>
                <span>Bertransaksi di {monthLabel}</span>
              </Kpi>
            )}
          </div>

          <div className="dash-grid">
            <SalesTrend
              trend={p.trend}
              month={data.period.month}
              isCurrentMonth={data.period.isCurrentMonth}
              asOfDate={data.period.asOfDate}
              tokens={tokens}
            />

            {ar && (
              <Panel
                title="Umur piutang"
                note={`Menurut hari lewat jatuh tempo, posisi ${formatTanggal(ar.asOf)}. ${count(ar.faktur)} faktur belum lunas.`}
              >
                <RankList
                  rows={ar.aging.map((a) => ({ key: a.bucket, label: a.bucket, value: a.value }))}
                  max={Math.max(...ar.aging.map((a) => a.value))}
                  highlight={(r) => r.key === '> 90 hari' && r.value > 0}
                  renderValue={(r) => (
                    <>
                      {rupiahShort(r.value)}
                      <small>{ar.total > 0 ? pct((r.value / ar.total) * 100) : '–'}</small>
                    </>
                  )}
                />
                <p className="dash-foot">
                  Total lewat jatuh tempo {rupiahShort(overdueAll)} (
                  {ar.total > 0 ? pct((overdueAll / ar.total) * 100) : '0%'} dari piutang).
                </p>
              </Panel>
            )}

            {data.scope.cabang.length !== 1 && (
              <Panel title="Penjualan per cabang" note={monthLabel}>
                {p.perCabang.length === 0 ? (
                  <p className="dash-empty">Belum ada penjualan di periode ini.</p>
                ) : (
                  <RankList
                    rows={p.perCabang.map((c) => ({
                      key: c.kode,
                      label: c.nama,
                      value: c.penjualan,
                    }))}
                    max={Math.max(...p.perCabang.map((c) => c.penjualan))}
                    renderValue={(r) => (
                      <>
                        {rupiahShort(r.value)}
                        <small>{p.penjualan > 0 ? pct((r.value / p.penjualan) * 100) : '–'}</small>
                      </>
                    )}
                  />
                )}
              </Panel>
            )}

            <Panel title="Penjualan per grup pelanggan" note={monthLabel}>
              {grupRows.length === 0 ? (
                <p className="dash-empty">Belum ada penjualan di periode ini.</p>
              ) : (
                <RankList
                  rows={grupRows}
                  max={Math.max(...grupRows.map((g) => g.value))}
                  renderValue={(r) => (
                    <>
                      {rupiahShort(r.value)}
                      <small>{count(r.pelanggan)} plg</small>
                    </>
                  )}
                />
              )}
            </Panel>

            <Panel
              title="Produk terlaris"
              note={`10 teratas menurut nilai penjualan, ${monthLabel}`}
            >
              <TopTable
                rows={p.topProduk.map((r) => ({
                  key: r.kode,
                  primary: r.nama,
                  secondary: r.kode,
                  value: r.penjualan,
                }))}
              />
            </Panel>

            <Panel
              title="Pelanggan teratas"
              note={`10 teratas menurut nilai penjualan, ${monthLabel}`}
            >
              <TopTable
                rows={p.topPelanggan.map((r) => ({
                  key: `${r.kode}-${r.cabang}`,
                  primary: r.nama,
                  secondary: `${r.kode}${r.cabang ? `, ${r.cabang}` : ''}`,
                  value: r.penjualan,
                }))}
              />
            </Panel>
          </div>

          <p className="dash-footnote">
            Nilai penjualan = harga jual × qty sebelum PPN, sama dengan Total Penjualan di Laporan
            PNL. {monthLabel}: Total Penjualan {rupiahFull(p.penjualan)} − retur{' '}
            {rupiahFull(p.retur)} − diskon distributor {rupiahFull(p.diskonDistributor)} = Penjualan
            Bersih {rupiahFull(p.penjualanBersih)}. Faktur klaim diskon (DSI) tidak ikut dihitung.
          </p>
        </div>
      )}
    </div>
  )
}

const TopTable = ({ rows }) => {
  if (rows.length === 0) return <p className="dash-empty">Belum ada penjualan di periode ini.</p>
  const max = Math.max(...rows.map((r) => r.value))
  return (
    <ol className="dash-top-list">
      {rows.map((r, i) => (
        <li key={r.key} className="dash-top-list__row">
          <span className="dash-top-list__rank">{i + 1}</span>
          <span className="dash-top-list__name">
            <span title={r.primary}>{r.primary}</span>
            <small>{r.secondary}</small>
          </span>
          <span className="dash-top-list__value" title={rupiahFull(r.value)}>
            {rupiahShort(r.value)}
          </span>
          <span className="dash-top-list__track" aria-hidden="true">
            <span style={{ width: `${max > 0 ? (Math.max(r.value, 0) / max) * 100 : 0}%` }} />
          </span>
        </li>
      ))}
    </ol>
  )
}

export default Dashboard
