<script setup>
import { computed } from 'vue'
import { fmtTime, fmtPace } from '../utils/geo'
import AppIcon from './AppIcon.vue'

const props = defineProps({ runs: { type: Array, required: true } })
const emit = defineEmits(['remove'])
const totalKm = computed(() => props.runs.reduce((sum, run) => sum + run.dist, 0) / 1000)
</script>

<template>
  <section class="mt-9" aria-labelledby="history-heading">
    <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div><p class="mb-1 flex items-center gap-2 text-[10px] font-bold tracking-[.18em] text-stone-400"><span class="h-px w-5 bg-lime-600"></span>YOUR JOURNEY</p><h2 id="history-heading" class="font-display text-2xl font-bold tracking-tight text-stone-800">Run history</h2></div>
      <div class="flex items-center gap-3 pb-1 text-xs text-stone-500"><span><strong class="text-stone-700">{{ runs.length }}</strong> {{ runs.length === 1 ? 'run' : 'runs' }}</span><span class="h-4 w-px bg-stone-300"></span><span><strong class="text-stone-700">{{ totalKm.toFixed(1) }}</strong> km total</span></div>
    </div>
    <div v-if="!runs.length" class="flex min-h-20 items-center gap-3 rounded-2xl border border-stone-200 bg-white/75 px-4 py-4 sm:px-5">
      <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-lime-50 text-lime-700"><AppIcon name="run" class="h-5 w-5" /></span>
      <div><strong class="font-display text-sm font-semibold text-stone-700">Your first run is waiting.</strong><p class="mt-1 text-xs text-stone-400">When you finish a run, it’ll show up here.</p></div>
      <span class="ml-auto shrink-0 font-display text-lg font-semibold text-stone-300">0.00 <small class="font-sans text-xs font-normal">km</small></span>
    </div>
    <div v-else class="overflow-hidden rounded-2xl border border-stone-200 bg-white/90">
      <article v-for="run in runs" :key="run.id" class="grid grid-cols-[36px_minmax(0,1fr)_minmax(0,1fr)_28px] grid-rows-2 items-center gap-x-2 gap-y-1 px-3 py-3 sm:grid-cols-[42px_minmax(120px,1fr)_minmax(90px,.75fr)_minmax(90px,.8fr)_32px] sm:grid-rows-1 sm:gap-3 sm:px-5" :class="{ 'border-t border-stone-100': run.id !== runs[0]?.id }">
        <div class="row-span-2 grid h-9 w-9 place-items-center rounded-xl bg-lime-50 text-lime-700 sm:row-span-1"><AppIcon name="route" class="h-5 w-5" /></div>
        <div class="col-span-2 flex min-w-0 items-baseline gap-2 sm:col-span-1 sm:block"><strong class="shrink-0 font-display text-sm font-bold tabular-nums text-forest sm:block sm:text-base">{{ (run.dist / 1000).toFixed(2) }} <small class="font-sans text-[10px] font-medium">km</small></strong><span class="truncate text-[9px] text-stone-400 sm:mt-0.5 sm:block sm:text-[10px]">{{ new Date(run.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) }}</span></div>
        <div class="col-start-2 row-start-2 min-w-0 sm:col-start-auto sm:row-auto"><span class="mb-0.5 block text-[8px] font-bold tracking-wider text-stone-400 sm:mb-1">DURATION</span><strong class="block truncate font-display text-[11px] font-semibold tabular-nums text-stone-600 sm:text-xs">{{ fmtTime(run.time) }}</strong></div>
        <div class="col-start-3 row-start-2 min-w-0 sm:col-start-auto sm:row-auto"><span class="mb-0.5 block text-[8px] font-bold tracking-wider text-stone-400 sm:mb-1">AVG. PACE</span><strong class="block truncate font-display text-[11px] font-semibold tabular-nums text-stone-600 sm:text-xs">{{ fmtPace(run.time, run.dist / 1000) }} <small class="font-sans text-[8px] font-normal">/km</small></strong></div>
        <button class="col-start-4 row-span-2 grid h-8 w-8 place-items-center rounded-lg text-stone-400 transition hover:bg-red-50 hover:text-red-600 sm:col-start-auto sm:row-span-1" type="button" :aria-label="`Delete ${((run.dist / 1000).toFixed(2))} km run`" @click="emit('remove', run.id)"><AppIcon name="trash" class="h-4 w-4" /></button>
      </article>
    </div>
  </section>
</template>
