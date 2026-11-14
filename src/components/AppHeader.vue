<script setup>
import AppIcon from './AppIcon.vue'
defineProps({ installable: Boolean })
defineEmits(['install'])
</script>

<template>
  <header class="sticky top-0 z-[1000] border-b border-stone-200/80 bg-white/90 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
      <a class="flex items-center gap-2.5 font-display text-lg font-extrabold tracking-tight text-forest" href="#"
        aria-label="Running Tracking home">
        <span class="grid h-9 w-9 place-items-center rounded-xl bg-forest text-lime"><AppIcon name="run" class="h-5 w-5" /></span>
        <span>Running Tracking<span class="text-lime-700">.</span></span>
      </a>
      <div class="flex items-center gap-3 sm:gap-6">
        <span class="hidden items-center gap-2 text-xs text-stone-500 sm:flex"><span
            class="h-2 w-2 rounded-full bg-lime-600"></span>Runs stay on this device</span>
        <button v-if="installable"
          class="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-forest transition hover:bg-stone-50"
          type="button" @click="$emit('install')">
          <AppIcon name="download" class="h-4 w-4" />
          Install app
        </button>
      </div>
    </div>
  </header>
</template>
