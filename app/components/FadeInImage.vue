<template>
  <img
    :src="src"
    :alt="alt"
    :loading="loading"
    :decoding="decoding"
    class="fade-in-image"
    :class="hasLoaded ? 'opacity-100' : 'opacity-0'"
    @load="hasLoaded = true"
    @error="hasLoaded = true"
  >
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  src: string
  alt: string
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'sync' | 'auto'
}

const props = withDefaults(defineProps<Props>(), {
  loading: 'lazy',
  decoding: 'async'
})

const hasLoaded = ref(false)

watch(() => props.src, () => {
  hasLoaded.value = false
})
</script>
