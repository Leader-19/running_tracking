<script setup>
import AppIcon from './AppIcon.vue'
defineProps({ installable: Boolean })
defineEmits(['install'])
</script>

<template>
  <header class="sticky top-0 z-[1000] border-b border-stone-200/80 bg-white/90 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:px-6">
      <a class="flex min-w-0 items-center gap-2 font-display text-sm font-extrabold tracking-tight text-forest sm:gap-2.5 sm:text-lg" href="#"
        aria-label="Running Tracking home">
        <span class="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-forest text-lime sm:h-9 sm:w-9">
          <AppIcon name="run" class="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
        <span class="whitespace-nowrap">Running Tracking<span class="text-lime-700">.</span></span>
      </a>
      <div class="flex items-center gap-3 sm:gap-6">
        <span class="hidden items-center gap-2 text-xs text-stone-500 sm:flex"><span
            class="h-2 w-2 rounded-full bg-lime-600"></span>Runs stay on this device</span>
        <button v-if="installable"
          class="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-xl border border-stone-200 bg-white px-2 text-[10px] font-bold text-forest transition hover:bg-stone-50 sm:gap-2 sm:px-3 sm:text-xs"
          type="button" @click="$emit('install')">
          <AppIcon name="download" class="h-4 w-4" />
          Install app
        </button>
      </div>
    </div>
  </header>
</template>
