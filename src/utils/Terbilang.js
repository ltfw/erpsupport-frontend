const SATUAN = [
  '',
  'Satu',
  'Dua',
  'Tiga',
  'Empat',
  'Lima',
  'Enam',
  'Tujuh',
  'Delapan',
  'Sembilan',
  'Sepuluh',
  'Sebelas',
]

const words = (n) => {
  if (n < 12) return SATUAN[n]
  if (n < 20) return `${SATUAN[n - 10]} Belas`
  if (n < 100) return `${SATUAN[Math.floor(n / 10)]} Puluh ${words(n % 10)}`
  if (n < 200) return `Seratus ${words(n - 100)}`
  if (n < 1000) return `${SATUAN[Math.floor(n / 100)]} Ratus ${words(n % 100)}`
  if (n < 2000) return `Seribu ${words(n - 1000)}`
  if (n < 1e6) return `${words(Math.floor(n / 1000))} Ribu ${words(n % 1000)}`
  if (n < 1e9) return `${words(Math.floor(n / 1e6))} Juta ${words(n % 1e6)}`
  if (n < 1e12) return `${words(Math.floor(n / 1e9))} Milyar ${words(n % 1e9)}`
  return `${words(Math.floor(n / 1e12))} Triliun ${words(n % 1e12)}`
}

const clean = (s) => s.replace(/\s+/g, ' ').trim()

// 5889090.56 -> "Lima Juta ... Sembilan Puluh Rupiah koma Lima Puluh Enam"
export const terbilangRupiah = (value) => {
  const cents = Math.round(Math.abs(parseFloat(value) || 0) * 100)
  const rupiah = Math.floor(cents / 100)
  const sen = cents % 100
  let result = `${rupiah === 0 ? 'Nol' : clean(words(rupiah))} Rupiah`
  if (sen > 0) result += ` koma ${clean(words(sen))}`
  return result
}
