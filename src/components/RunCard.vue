<script setup>
import { computed } from 'vue'
import { fmtTime, fmtPace } from '../utils/geo'
import AppIcon from './AppIcon.vue'

const props = defineProps({ status: String, distance: Number, elapsed: Number, accuracy: Number, recovered: Boolean, error: String })
const emit = defineEmits(['start', 'pause', 'resume', 'finish'])
const km = computed(() => (props.distance || 0) / 1000)
const meters = computed(() => Math.round(props.distance || 0))
const speed = computed(() => props.elapsed > 0 && km.value > 0 ? (km.value / (props.elapsed / 3600)).toFixed(1) : '0.0')
const label = computed(() => {
  if (props.status === 'paused' && props.recovered) return 'Run restored · paused'
  if (props.status === 'running' && props.accuracy == null) return 'Finding GPS signal'
  if (props.status === 'running' && props.accuracy > 100) return 'Waiting for accurate GPS'
  if (props.status === 'running' && props.accuracy > 50) return 'Weak GPS signal'
  return ({ idle: 'Ready when you are', running: 'You’re on the move', paused: 'Run paused' }[props.status] || 'Ready')
})
const statusMessage = computed(() => {
  if (props.error) return props.error
  if (props.status === 'idle') return 'Tap Start your run to begin counting distance, pace, and speed.'
  if (props.status === 'running' && props.accuracy > 100) return 'GPS is too weak to measure distance reliably. Move to an open area or wait for a stronger signal.'
  if (props.status === 'running' && props.accuracy > 50) return 'Weak GPS signal. Distance is counting, but may be less accurate.'
  return ''
})
</script>

<template>
  <section class="relative flex min-h-[410px] w-full min-w-0 flex-col overflow-hidden rounded-3xl bg-forest p-5 text-white shadow-xl shadow-forest/10 sm:p-7" aria-label="Live run tracker">
    <div class="pointer-events-none absolute -right-20 top-24 h-56 w-56 rounded-full border border-lime/10 shadow-[0_0_0_25px_rgba(196,241,106,.025),0_0_0_55px_rgba(196,241,106,.02)]"></div>
    <div class="relative z-10 flex items-center justify-between">
      <span class="flex items-center gap-2 text-xs text-green-100"><span class="h-2 w-2 rounded-full" :class="status === 'running' ? 'animate-pulse bg-lime' : 'bg-stone-400'"></span>{{ label }}</span>
      <span class="text-[10px] font-bold tracking-[.16em] text-green-200/70">GPS RUN</span>
    </div>

    <div class="relative z-10 mt-8">
      <p class="mb-1 text-[10px] font-bold tracking-[.2em] text-green-100/70">DISTANCE</p>
      <div class="flex items-baseline whitespace-nowrap font-display tabular-nums tracking-[-.06em]">
        <span class="text-[clamp(3.5rem,16vw,6.2rem)] font-bold leading-none sm:text-[clamp(4.5rem,12vw,6.2rem)]">{{ Math.floor(meters / 1000) }}</span>
        <span class="text-4xl font-semibold text-lime sm:text-5xl">.{{ String(meters % 1000).padStart(3, '0') }}</span>
        <span class="ml-1 text-sm font-medium tracking-normal text-green-100 sm:ml-2 sm:text-base">km</span>
      </div>
      <p class="mt-3 flex flex-wrap items-center gap-2 text-xs text-green-50"><strong>{{ Math.floor(meters / 1000) }} km</strong><span class="text-green-200/50">/</span><strong>{{ meters % 1000 }} m</strong><span class="text-green-100/60">total distance</span></p>
    </div>

    <div class="relative z-10 mt-auto grid grid-cols-3 border-y border-white/10 py-4">
      <div class="min-w-0 pr-1 sm:pr-2"><span class="block text-[8px] font-bold tracking-wider text-green-100/70 sm:text-[9px] sm:tracking-widest">TIME</span><strong class="mt-1 block truncate font-display text-base tabular-nums sm:text-lg">{{ fmtTime(elapsed || 0) }}</strong></div>
      <div class="min-w-0 border-l border-white/10 px-2 sm:px-3"><span class="block text-[8px] font-bold tracking-wider text-green-100/70 sm:text-[9px] sm:tracking-widest">PACE /KM</span><strong class="mt-1 block truncate font-display text-base tabular-nums sm:text-lg">{{ fmtPace(elapsed || 0, km) }}<small class="ml-0.5 text-[9px] font-normal text-green-100 sm:ml-1 sm:text-[10px]">/km</small></strong></div>
      <div class="min-w-0 border-l border-white/10 pl-2 sm:pl-3"><span class="block text-[8px] font-bold tracking-wider text-green-100/70 sm:text-[9px] sm:tracking-widest">SPEED</span><strong class="mt-1 block truncate font-display text-base tabular-nums sm:text-lg">{{ speed }}<small class="ml-0.5 text-[9px] font-normal text-green-100 sm:ml-1 sm:text-[10px]">km/h</small></strong></div>
    </div>

    <div class="relative z-10 mt-4 flex gap-2">
      <button v-if="status === 'idle'" class="flex h-12 flex-1 items-center justify-between rounded-xl bg-lime px-4 text-sm font-bold text-forest transition hover:bg-lime-200" type="button" @click="emit('start')"><span class="flex items-center gap-2"><span class="grid h-7 w-7 place-items-center rounded-lg bg-forest/10"><AppIcon name="play" class="h-4 w-4" /></span>Start your run</span><AppIcon name="arrow-right" class="h-4 w-4" /></button>
      <template v-else-if="status === 'running'"><button class="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 text-sm font-bold transition hover:bg-white/15" type="button" @click="emit('pause')"><AppIcon name="pause" class="h-4 w-4" />Pause</button><button class="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 px-4 text-sm font-bold transition hover:bg-white/10" type="button" @click="emit('finish')"><AppIcon name="finish" class="h-4 w-4" />Finish</button></template>
      <template v-else><button class="flex h-12 flex-1 items-center justify-between rounded-xl bg-lime px-4 text-sm font-bold text-forest transition hover:bg-lime-200" type="button" @click="emit('resume')"><span class="flex items-center gap-2"><AppIcon name="play" class="h-4 w-4" />Resume run</span><AppIcon name="arrow-right" class="h-4 w-4" /></button><button class="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 px-4 text-sm font-bold transition hover:bg-white/10" type="button" @click="emit('finish')"><AppIcon name="finish" class="h-4 w-4" />Finish</button></template>
    </div>
    <p class="relative z-10 mt-2 min-h-4 text-[10px] leading-4" :class="error || (status === 'running' && accuracy > 100) ? 'text-orange-200' : 'text-green-100/75'" role="status">{{ statusMessage }}</p>
  </section>
</template>
