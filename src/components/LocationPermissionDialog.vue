<script setup>
import AppIcon from './AppIcon.vue'

defineEmits(['cancel', 'confirm'])
</script>

<template>
  <div class="fixed inset-0 z-[2000] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm" @keydown.esc="$emit('cancel')">
    <section class="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl shadow-slate-950/20 sm:p-7" role="dialog" aria-modal="true" aria-labelledby="location-dialog-title" aria-describedby="location-dialog-copy">
      <div class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600">
        <AppIcon name="locate" class="h-7 w-7" />
      </div>
      <div class="mt-5 text-center">
        <h2 id="location-dialog-title" class="font-display text-xl font-bold tracking-tight text-stone-800">Allow location to track your run?</h2>
        <p id="location-dialog-copy" class="mt-2 text-sm leading-6 text-stone-600">Running Tracking uses your GPS to measure distance and draw your route while you run. Your run history is saved on this device.</p>
      </div>
      <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
        <button class="h-11 rounded-xl border border-stone-200 px-5 text-sm font-semibold text-stone-600 transition hover:bg-stone-50" type="button" @click="$emit('cancel')">Not now</button>
        <button class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-forest px-5 text-sm font-bold text-white transition hover:bg-emerald-950" type="button" autofocus @click="$emit('confirm')"><AppIcon name="locate" class="h-4 w-4" />Continue</button>
      </div>
      <p class="mt-4 text-center text-[11px] leading-5 text-stone-500">Your browser will show its location permission prompt next.</p>
    </section>
  </div>
</template>
