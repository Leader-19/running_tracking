export function haversine(a, b) {
  const R = 6371000, r = Math.PI / 180
  const dLa = (b.lat - a.lat) * r, dLo = (b.lon - a.lon) * r
  const x = Math.sin(dLa / 2) ** 2 +
    Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLo / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

export function fmtTime(s) {
  s = Math.floor(s)
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), c = s % 60
  const p = (n) => String(n).padStart(2, '0')
  return h ? `${h}:${p(m)}:${p(c)}` : `${p(m)}:${p(c)}`
}

export function fmtPace(sec, km) {
  if (km < 0.02) return '–:––'
  const p = sec / km
  if (p > 5999) return '–:––'
  return `${Math.floor(p / 60)}:${String(Math.floor(p % 60)).padStart(2, '0')}`
}
