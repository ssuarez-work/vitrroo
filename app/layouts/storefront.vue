<template>
  <div class="min-h-[100dvh] selection:bg-brand-100 selection:text-brand-700" :style="outerStyle">
    <div class="max-w-md mx-auto min-h-[100dvh] relative shadow-sm border-x border-[#f0f0f2]" :style="innerStyle">
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
