<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useGeoTracker } from '../composables/useGeoTracker'
import AppHeader from './AppHeader.vue'
import RunCard from './RunCard.vue'
import RouteMapCard from './RouteMapCard.vue'
import RunHistory from './RunHistory.vue'
import AppFooter from './AppFooter.vue'
import AppIcon from './AppIcon.vue'
import DistanceTools from './DistanceTools.vue'
import LocationPermissionDialog from './LocationPermissionDialog.vue'
import InstallHelpDialog from './InstallHelpDialog.vue'

const tracker = useGeoTracker()
const KEY = 'runtracker:runs'
const runs = ref(readRuns())
const installPrompt = ref(null)
const isInstalled = ref(window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true)
const showLocationDialog = ref(false)
const showInstallHelp = ref(false)

function readRuns() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

watch(runs, (value) => localStorage.setItem(KEY, JSON.stringify(value)), { deep: true })

function finishRun() {
  const run = tracker.stop()
  if (run) runs.value.unshift(run)
}

function confirmStartRun() {
  showLocationDialog.value = false
  tracker.start()
}

function removeRun(id) {
  runs.value = runs.value.filter((run) => run.id !== id)
}

async function installApp() {
  if (!installPrompt.value) {
    showInstallHelp.value = true
    return
  }
  const prompt = installPrompt.value
  installPrompt.value = null
  await prompt.prompt()
  const choice = await prompt.userChoice
  if (choice.outcome === 'accepted') isInstalled.value = true
}

function onInstallPrompt(event) {
  event.preventDefault()
  installPrompt.value = event
}

function onAppInstalled() {
  isInstalled.value = true
  installPrompt.value = null
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', onInstallPrompt)
  window.addEventListener('appinstalled', onAppInstalled)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', onInstallPrompt)
  window.removeEventListener('appinstalled', onAppInstalled)
})
</script>

<template>
  <div class="min-h-screen w-full overflow-x-clip bg-canvas">
    <AppHeader :installable="!isInstalled" @install="installApp" />
    <main class="mx-auto w-full min-w-0 max-w-6xl px-3 pb-4 sm:px-6">
      <section class="flex min-h-36 items-center justify-between gap-4 py-6 sm:min-h-48 sm:py-10">
        <div class="min-w-0"><p class="mb-2 flex items-center gap-2 text-[9px] font-bold tracking-[.15em] text-stone-500 sm:text-[10px] sm:tracking-[.18em]"><span class="h-px w-5 shrink-0 bg-lime-600"></span>YOUR RUNNING COMPANION</p><h1 class="font-display text-[clamp(1.5rem,7vw,2.25rem)] font-bold leading-tight tracking-tight text-stone-800 sm:text-4xl">Every step counts<span class="text-lime-700">.</span></h1><p class="mt-2 text-xs text-stone-500 sm:text-sm">Find your pace. Enjoy the miles. We’ll keep track.</p></div>
        <div class="hidden items-center gap-2 rounded-2xl border border-stone-200 bg-white/70 p-3 sm:flex"><span class="grid h-9 w-9 place-items-center rounded-xl bg-lime-50 text-amber-500"><AppIcon name="sun" class="h-5 w-5" /></span><span><strong class="block text-xs text-stone-600">Today is a good day</strong><small class="text-[10px] text-stone-400">to get out there</small></span></div>
      </section>

      <section class="grid w-full min-w-0 grid-cols-1 gap-4 lg:grid-cols-[.92fr_1.08fr] lg:gap-5" aria-label="Run tracker">
        <RunCard :status="tracker.status.value" :distance="tracker.distance.value" :elapsed="tracker.elapsed.value" :accuracy="tracker.accuracy.value" :recovered="tracker.recovered.value" :error="tracker.error.value" @start="showLocationDialog = true" @pause="tracker.pause" @resume="tracker.resume" @finish="finishRun" />
        <RouteMapCard :points="tracker.points.value" :position="tracker.position.value" :accuracy="tracker.accuracy.value" />
      </section>

      <DistanceTools :distance="tracker.distance.value" />

      <RunHistory :runs="runs" @remove="removeRun" />
      <div class="mt-5 flex flex-wrap items-center justify-center gap-2 text-center text-[10px] text-stone-400 sm:hidden"><span class="h-1.5 w-1.5 rounded-full bg-lime-600"></span>Routes stay private on this device</div>
      <AppFooter />
      <LocationPermissionDialog v-if="showLocationDialog" @cancel="showLocationDialog = false" @confirm="confirmStartRun" />
      <InstallHelpDialog v-if="showInstallHelp" @close="showInstallHelp = false" />
    </main>
  </div>
</template>
