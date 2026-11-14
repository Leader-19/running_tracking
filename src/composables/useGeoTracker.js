import { ref, computed, onUnmounted } from 'vue'
import { haversine } from '../utils/geo'

const MAX_ACCURACY = 100  // metres: very weak fixes are shown on the map but not used for distance
const MAX_SPEED = 15      // m/s: reject jumps faster than 54 km/h
const SESSION_KEY = 'runtracker:active-run:v1'

function readSavedSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
    if (!saved || !Number.isFinite(saved.distance) || saved.distance < 0 || !Number.isFinite(saved.elapsed) || saved.elapsed < 0) return null
    const points = Array.isArray(saved.points) ? saved.points.filter((p) =>
      Number.isFinite(p.lat) && p.lat >= -90 && p.lat <= 90 &&
      Number.isFinite(p.lon) && p.lon >= -180 && p.lon <= 180 && Number.isFinite(p.t)
    ) : []
    const gap = saved.wasRunning && Number.isFinite(saved.savedAt)
      ? Math.min(30, Math.max(0, (Date.now() - saved.savedAt) / 1000))
      : 0
    return {
      distance: saved.distance,
      elapsed: saved.elapsed + gap,
      points,
      accuracy: Number.isFinite(saved.accuracy) ? saved.accuracy : null,
      position: saved.position && Number.isFinite(saved.position.lat) && Number.isFinite(saved.position.lon)
        ? saved.position
        : null
    }
  } catch {
    return null
  }
}

export function useGeoTracker() {
  const savedSession = readSavedSession()
  const status = ref(savedSession ? 'paused' : 'idle') // idle | running | paused
  const points = ref(savedSession?.points || [])       // [{ lat, lon, t }]
  const position = ref(savedSession?.position || null) // latest GPS fix, including lower accuracy fixes
  const distance = ref(savedSession?.distance || 0)    // metres
  const accuracy = ref(savedSession?.accuracy ?? null)
  const recovered = ref(Boolean(savedSession))
  const error = ref('')
  const now = ref(Date.now())

  let watchId = null, wakeLock = null, ticker = null
  let banked = savedSession?.elapsed || 0, startedAt = 0, last = null

  const elapsed = computed(() =>
    banked + (status.value === 'running' ? (now.value - startedAt) / 1000 : 0))

  function persistSession() {
    if (status.value === 'idle') return
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        distance: distance.value,
        elapsed: elapsed.value,
        points: points.value,
        accuracy: accuracy.value,
        position: position.value,
        savedAt: Date.now(),
        wasRunning: status.value === 'running'
      }))
      lastSavedAt = Date.now()
    } catch (storageError) {
      console.warn('Could not save the active run locally:', storageError)
    }
  }

  function clearGpsWatch() {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    watchId = null
  }

  function startTicker() {
    clearInterval(ticker)
    ticker = setInterval(() => {
      now.value = Date.now()
      if (now.value - lastSavedAt >= 5000) persistSession()
    }, 1000)
  }

  let lastSavedAt = Date.now()

  function onPosition(p) {
    const c = p.coords
    accuracy.value = c.accuracy
    position.value = { lat: c.latitude, lon: c.longitude, accuracy: c.accuracy }
    if (c.accuracy > MAX_ACCURACY) { persistSession(); return }
    const pt = { lat: c.latitude, lon: c.longitude, t: p.timestamp, accuracy: c.accuracy }
    if (status.value !== 'running') { points.value = [...points.value]; return }
    if (last) {
      const d = haversine(last, pt), dt = (pt.t - last.t) / 1000
      if (dt <= 0) return
      const movementThreshold = Math.max(3, Math.min(8, ((last.accuracy || c.accuracy) + c.accuracy) * 0.06))
      if (d < movementThreshold) return               // filter GPS drift without ignoring normal walking steps
      if (d / dt > MAX_SPEED) return                  // outlier
      distance.value += d
    }
    last = pt
    points.value.push(pt)
    persistSession()
  }

  function onError(e) {
    error.value = {
      1: 'Location permission denied. Allow location access and try again.',
      2: 'Position unavailable. Move to open sky and check that GPS is on.',
      3: 'GPS timed out. Move to open sky and try again.'
    }[e.code] || 'Could not read GPS.'
    if (status.value === 'running') {
      banked = elapsed.value
      status.value = 'paused'
      last = null
      clearGpsWatch()
      clearInterval(ticker)
      ticker = null
      unlockScreen()
      persistSession()
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
    recovered.value = false
    last = null
    startedAt = Date.now(); now.value = startedAt
    status.value = 'running'
    watchGPS()
    startTicker()
    persistSession()
    lockScreen()
  }

  function pause() {
    banked = elapsed.value
    status.value = 'paused'
    last = null
    clearGpsWatch()
    clearInterval(ticker)
    ticker = null
    unlockScreen()
    persistSession()
  }

  function resume() {
    error.value = ''
    startedAt = Date.now(); now.value = startedAt
    status.value = 'running'
    recovered.value = false
    if (watchId === null) watchGPS()
    startTicker()
    lockScreen()
    persistSession()
  }

  // Returns the finished run (or null if too short to keep)
  function stop() {
    const run = distance.value >= 20
      ? {
        id: Date.now(), date: Date.now(), dist: distance.value, time: elapsed.value,
        pts: points.value.map((p) => [p.lat, p.lon])
      }
      : null
    clearGpsWatch()
    clearInterval(ticker); ticker = null; unlockScreen()
    status.value = 'idle'
    try { localStorage.removeItem(SESSION_KEY) } catch { }
    return run
  }

  function onPageHide() {
    if (status.value === 'running') pause()
    else persistSession()
  }

  window.addEventListener('pagehide', onPageHide)
  onUnmounted(() => {
    onPageHide()
    clearGpsWatch()
    clearInterval(ticker)
    unlockScreen()
    window.removeEventListener('pagehide', onPageHide)
  })

  return { status, points, position, distance, elapsed, accuracy, error, recovered, start, pause, resume, stop }
}
