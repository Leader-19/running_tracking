<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'

defineEmits(['close'])

const platform = computed(() => {
  const agent = navigator.userAgent || ''
  if (/iPhone|iPad|iPod/i.test(agent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios'
  if (/Android/i.test(agent)) return 'android'
  return 'desktop'
})
</script>

<template>
  <div class="fixed inset-0 z-[2000] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm" @keydown.esc="$emit('close')">
    <section class="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl shadow-slate-950/20 sm:p-7" role="dialog" aria-modal="true" aria-labelledby="install-title" aria-describedby="install-copy">
      <div class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-lime-50 text-forest"><AppIcon name="download" class="h-7 w-7" /></div>
      <div class="mt-5 text-center">
        <h2 id="install-title" class="font-display text-xl font-bold tracking-tight text-stone-800">Install Running Tracking</h2>
        <p id="install-copy" class="mt-2 text-sm leading-6 text-stone-600">Add the app to your home screen for quick access.</p>
      </div>

      <div v-if="platform === 'ios'" class="mt-5 rounded-2xl bg-stone-50 p-4 text-sm leading-6 text-stone-700">
        <p class="font-semibold text-stone-800">In Safari:</p>
        <ol class="mt-2 list-inside list-decimal space-y-1.5">
          <li>Tap the <strong>Share</strong> button.</li>
          <li>Choose <strong>Add to Home Screen</strong>.</li>
          <li>Tap <strong>Add</strong>.</li>
        </ol>
        <p class="mt-3 text-xs text-stone-500">If you’re viewing this in another iPhone browser, open this page in Safari first.</p>
      </div>
      <div v-else-if="platform === 'android'" class="mt-5 rounded-2xl bg-stone-50 p-4 text-sm leading-6 text-stone-700">
        <p class="font-semibold text-stone-800">In your browser menu:</p>
        <ol class="mt-2 list-inside list-decimal space-y-1.5">
          <li>Tap the menu button <span class="font-bold">⋮</span>.</li>
          <li>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
          <li>Confirm the installation.</li>
        </ol>
      </div>
      <div v-else class="mt-5 rounded-2xl bg-stone-50 p-4 text-sm leading-6 text-stone-700">
        <p>Use your browser’s install icon in the address bar, or open its menu and choose <strong>Install Running Tracking</strong>.</p>
      </div>

      <button class="mt-5 h-11 w-full rounded-xl bg-forest px-5 text-sm font-bold text-white transition hover:bg-emerald-950" type="button" autofocus @click="$emit('close')">Got it</button>
    </section>
  </div>
</template>
