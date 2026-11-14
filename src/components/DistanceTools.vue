<script setup>
import { computed, ref } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({ distance: { type: Number, default: 0 } })
const kilometers = ref('1')

const totalMeters = computed(() => Math.round(props.distance || 0))
const convertedMeters = computed(() => {
  const value = Number(kilometers.value)
  return Number.isFinite(value) && value > 0 ? Math.round(value * 1000) : 0
})
</script>

<template>
  <section class="mt-4 grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2" aria-label="Distance tools">
    <article class="w-full min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5" aria-live="polite">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="mb-1 text-[10px] font-bold tracking-[.16em] text-stone-500">GPS DISTANCE</p>
          <h2 class="font-display text-base font-bold text-stone-800">Total meters</h2>
        </div>
        <span class="grid h-9 w-9 place-items-center rounded-xl bg-lime-50 text-lime-700"><AppIcon name="route" class="h-5 w-5" /></span>
      </div>
      <p class="mt-4 font-display text-3xl font-bold tabular-nums tracking-tight text-forest sm:text-4xl">{{ totalMeters.toLocaleString() }} <span class="text-lg font-semibold text-stone-500">m</span></p>
      <p class="mt-1 text-xs text-stone-500">{{ (totalMeters / 1000).toFixed(3) }} km covered</p>
    </article>

    <article class="w-full min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="mb-1 text-[10px] font-bold tracking-[.16em] text-stone-500">QUICK CONVERTER</p>
          <h2 class="font-display text-base font-bold text-stone-800">Kilometers to meters</h2>
        </div>
        <span class="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600"><AppIcon name="ruler" class="h-5 w-5" /></span>
      </div>
      <label class="mt-4 block text-xs font-semibold text-stone-600" for="distance-kilometers">Kilometers</label>
      <div class="mt-1.5 flex w-full min-w-0 items-center gap-1.5 sm:gap-3">
        <input id="distance-kilometers" v-model="kilometers" class="h-11 w-full min-w-0 flex-1 rounded-xl border border-stone-200 bg-stone-50 px-2 font-display text-base font-semibold tabular-nums text-stone-800 outline-none transition focus:border-lime-600 focus:ring-2 focus:ring-lime-100 sm:px-3 sm:text-lg" type="number" inputmode="decimal" min="0" step="0.01" placeholder="Enter km" />
        <span class="shrink-0 text-xs font-medium text-stone-500 sm:text-sm">km</span>
        <span class="shrink-0 text-stone-300" aria-hidden="true">=</span>
        <output class="min-w-[60px] shrink-0 text-right font-display text-sm font-bold tabular-nums text-forest sm:min-w-[76px] sm:text-lg">{{ convertedMeters.toLocaleString() }} <span class="text-xs font-semibold text-stone-500">m</span></output>
      </div>
      <p class="mt-2 text-[11px] text-stone-500">1 km = 1,000 m</p>
    </article>
  </section>
</template>
