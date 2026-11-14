<script setup>
defineProps({ name: { type: String, required: true } })
</script>

<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <template v-if="name === 'run'">
      <circle cx="16" cy="4.5" r="2" />
      <path d="m14 8-3 4-4 1m7-5 3 3 3 .5m-9.5-2L13 15l-2 5m2-5 5 2 2 3m-9-7-4 4H4" />
    </template>
    <template v-else-if="name === 'sun'">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
    </template>
    <template v-else-if="name === 'pin'">
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </template>
    <template v-else-if="name === 'locate'">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
    </template>
    <template v-else-if="name === 'play'">
      <path d="m8 5 11 7-11 7V5Z" fill="currentColor" stroke="none" />
    </template>
    <template v-else-if="name === 'pause'">
      <path d="M9 5v14M15 5v14" stroke-width="2.5" />
    </template>
    <template v-else-if="name === 'arrow-right'">
      <path d="M4 12h15m-6-6 6 6-6 6" />
    </template>
    <template v-else-if="name === 'finish'">
      <path d="M5 21V4m0 1h13l-2.5 3L18 11H5" />
    </template>
    <template v-else-if="name === 'route'">
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="6" r="2" />
      <path d="M8 18h2a3 3 0 0 0 3-3v-2a3 3 0 0 1 3-3h2" />
    </template>
    <template v-else-if="name === 'trash'">
      <path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" />
    </template>
    <template v-else-if="name === 'download'">
      <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v3h16v-3" />
    </template>
  </svg>
</template>
