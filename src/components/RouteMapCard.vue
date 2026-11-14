<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import AppIcon from './AppIcon.vue'

const props = defineProps({ points: { type: Array, default: () => [] }, position: Object, accuracy: Number })
const mapEl = ref(null)
const locating = ref(false)
const locationError = ref('')
const locationAccuracy = ref(null)
const gps = computed(() => {
  const accuracy = props.accuracy ?? locationAccuracy.value
  if (locating.value) return { cls: 'bg-amber-400 animate-pulse', text: 'Finding location' }
  if (accuracy == null) return { cls: 'bg-stone-400', text: 'Location not shared' }
  if (accuracy > 50) return { cls: 'bg-orange-400', text: `Weak signal · ±${Math.round(accuracy)} m` }
  return { cls: 'bg-lime-600', text: `GPS locked · ±${Math.round(accuracy)} m` }
})

let map
let routeLine
let positionMarker
let accuracyCircle

onMounted(() => {
  map = L.map(mapEl.value, { zoomControl: false, attributionControl: true }).setView([20, 0], 2)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)
  routeLine = L.polyline([], { color: '#8ebc45', weight: 5, opacity: 0.95 }).addTo(map)
  positionMarker = L.circleMarker([0, 0], {
    radius: 8, color: '#ffffff', weight: 3, fillColor: '#4285f4', fillOpacity: 1
  })
  accuracyCircle = L.circle([0, 0], {
    color: '#4285f4', weight: 1, fillColor: '#4285f4', fillOpacity: 0.12
  })
})

function showPosition(position, center = false) {
  if (!map) return
  const lat = position.coords?.latitude ?? position.lat
  const lon = position.coords?.longitude ?? position.lon
  const accuracy = position.coords?.accuracy ?? position.accuracy ?? 25
  const latlng = [lat, lon]
  locationAccuracy.value = accuracy
  locationError.value = ''
  positionMarker.setLatLng(latlng).addTo(map)
  accuracyCircle.setLatLng(latlng).setRadius(accuracy).addTo(map)
  if (center) map.setView(latlng, 16)
  else map.panTo(latlng)
}

function locateMe() {
  locationError.value = ''
  if (!navigator.geolocation) {
    locationError.value = 'This browser does not support location.'
    return
  }
  if (!window.isSecureContext) {
    locationError.value = 'Location requires HTTPS or localhost.'
    return
  }
  locating.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => { showPosition(position, true); locating.value = false },
    (error) => {
      locationError.value = error.code === 1
        ? 'Location permission was denied. Allow it in your browser settings.'
        : 'Could not find your location. Try again somewhere with a clearer GPS signal.'
      locating.value = false
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
  )
}

watch(() => props.position, (position) => {
  if (position) showPosition(position)
})

watch(() => props.points.length, (count) => {
  if (!map || !routeLine) return
  if (!count) {
    routeLine.setLatLngs([])
    return
  }
  const coordinates = props.points.map(({ lat, lon }) => [lat, lon])
  routeLine.setLatLngs(coordinates)
  positionMarker.setLatLng(coordinates[count - 1]).addTo(map)
  if (props.accuracy != null) accuracyCircle.setLatLng(coordinates[count - 1]).setRadius(props.accuracy).addTo(map)
  map.panTo(coordinates[count - 1])
  if (count === 1) map.setZoom(17)
})

onBeforeUnmount(() => { if (map) map.remove() })
</script>

<template>
  <section class="min-w-0 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5" aria-label="Route map">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div><p class="mb-1 text-[10px] font-bold tracking-[.18em] text-stone-400">YOUR ROUTE</p><h2 class="font-display text-lg font-bold tracking-tight text-stone-800">Every step, mapped.</h2></div>
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 rounded-full border border-stone-100 px-2.5 py-2 text-[9px] text-stone-600 sm:text-[10px]"><span class="h-2 w-2 rounded-full" :class="gps.cls"></span>{{ gps.text }}</span>
        <button class="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-2 text-[10px] font-bold text-forest transition hover:bg-lime-50 disabled:cursor-wait disabled:opacity-70" type="button" :disabled="locating" @click="locateMe"><AppIcon name="locate" class="h-4 w-4 text-blue-500" />{{ locating ? 'Locating…' : 'Locate me' }}</button>
      </div>
    </div>
    <div class="relative isolate h-[270px] overflow-hidden rounded-2xl bg-stone-100 sm:h-[300px]">
      <div ref="mapEl" class="absolute inset-0 z-0" role="img" aria-label="Map showing your current location and running route"></div>
      <div v-if="!points.length && !locationAccuracy" class="pointer-events-none absolute left-1/2 top-1/2 z-[401] flex w-48 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center">
        <span class="mb-2 grid h-10 w-10 place-items-center rounded-xl border border-white bg-white/90 text-lime-700 shadow"><AppIcon name="pin" class="h-5 w-5" /></span>
        <strong class="text-xs text-stone-700">Find where you are</strong><span class="mt-1 text-[10px] text-stone-500">Tap Locate me to center the map</span>
      </div>
    </div>
    <div class="flex items-center justify-between gap-2 pt-3 text-[9px] text-stone-400 sm:text-[10px]"><span class="inline-flex items-center gap-1.5 font-bold tracking-wider text-stone-500"><span class="h-1.5 w-1.5 rounded-full bg-lime-600"></span>LIVE ROUTE</span><span>GPS-powered · Private by design</span></div>
    <p v-if="locationError" class="mt-2 text-xs leading-5 text-red-700" role="status">{{ locationError }}</p>
  </section>
</template>
