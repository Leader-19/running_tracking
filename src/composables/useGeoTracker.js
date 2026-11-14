import { ref, computed, onUnmounted } from 'vue'
import { haversine } from '../utils/geo'

const MAX_ACCURACY = 50   // metres: ignore weaker fixes
const MAX_SPEED = 12      // m/s: ignore impossible jumps

export function useGeoTracker() {
  const status = ref('idle')          // idle | running | paused
  const points = ref([])              // [{ lat, lon, t }]
  const position = ref(null)          // latest GPS fix, including lower accuracy fixes
  const distance = ref(0)             // metres
  const accuracy = ref(null)
  const error = ref('')
  const now = ref(Date.now())

  let watchId = null, wakeLock = null, ticker = null
  let banked = 0, startedAt = 0, last = null

  const elapsed = computed(() =>
    banked + (status.value === 'running' ? (now.value - startedAt) / 1000 : 0))

  function onPosition(p) {
    const c = p.coords
    accuracy.value = c.accuracy
    position.value = { lat: c.latitude, lon: c.longitude, accuracy: c.accuracy }
    if (c.accuracy > MAX_ACCURACY) return
    const pt = { lat: c.latitude, lon: c.longitude, t: p.timestamp }
    if (status.value !== 'running') { points.value = [...points.value]; return }
    if (last) {
      const d = haversine(last, pt), dt = (pt.t - last.t) / 1000
      if (dt <= 0) return
      if (d < Math.max(3, c.accuracy * 0.4)) return   // standing-still jitter
      if (d / dt > MAX_SPEED) return                  // outlier
      distance.value += d
    }
    last = pt
    points.value.push(pt)
  }

  function onError(e) {
    error.value = {
      1: 'Location permission denied. Allow location access and try again.',
      2: 'Position unavailable. Move to open sky and check that GPS is on.',
      3: 'GPS timed out. Move to open sky and try again.'
    }[e.code] || 'Could not read GPS.'
    if (status.value === 'running') {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId)
      watchId = null
      banked = elapsed.value
      status.value = 'paused'
      last = null
      unlockScreen()
    }
  }

  function watchGPS() {
    watchId = navigator.geolocation.watchPosition(onPosition, onError,
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 })
  }

  async function lockScreen() {
    try { wakeLock = await navigator.wakeLock?.request('screen') } catch { }
  }
  function unlockScreen() { try { wakeLock?.release() } catch { } wakeLock = null }

  function start() {
    error.value = ''
    if (!('geolocation' in navigator)) { error.value = 'This browser does not support GPS.'; return }
    if (!window.isSecureContext) {
      error.value = 'GPS requires a secure connection. Open this app on HTTPS or localhost.'
      return
    }
    points.value = []
    position.value = null
    distance.value = 0
    accuracy.value = null
    banked = 0
    last = null
    watchGPS()
    startedAt = Date.now(); now.value = startedAt
    status.value = 'running'
    ticker = setInterval(() => (now.value = Date.now()), 1000)
    lockScreen()
  }

  function pause() {
    banked = elapsed.value
    status.value = 'paused'
    last = null
    unlockScreen()
  }

  function resume() {
    error.value = ''
    startedAt = Date.now(); now.value = startedAt
    status.value = 'running'
    if (watchId === null) watchGPS()
    lockScreen()
  }

  // Returns the finished run (or null if too short to keep)
  function stop() {
    const run = distance.value >= 20
      ? {
        id: Date.now(), date: Date.now(), dist: distance.value, time: elapsed.value,
        pts: points.value.map((p) => [p.lat, p.lon])
      }
      : null
    if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    watchId = null; clearInterval(ticker); unlockScreen()
    status.value = 'idle'
    return run
  }

  onUnmounted(() => { if (status.value !== 'idle') stop() })

  return { status, points, position, distance, elapsed, accuracy, error, start, pause, resume, stop }
}
