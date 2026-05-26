<template>
  <div class="min-h-[100dvh] selection:bg-brand-100 selection:text-brand-700" :style="outerStyle">
    <div
      class="mx-auto min-h-[100dvh] relative w-full max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl shadow-sm md:shadow-xl md:my-6 lg:my-10 md:rounded-3xl md:overflow-hidden border-x border-[#f0f0f2] md:border"
      :style="innerStyle"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const outerStyle = {
  backgroundColor: 'var(--store-bg, #f8f8fa)',
  color: 'var(--store-text, #0f0f10)'
}

const innerStyle = {
  backgroundColor: 'var(--store-surface, #ffffff)',
  color: 'var(--store-text, #0f0f10)'
}
</script>
