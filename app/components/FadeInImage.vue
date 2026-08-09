<template>
  <img
    ref="image"
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
import { nextTick, onMounted, ref, watch } from 'vue'

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

const image = ref<HTMLImageElement | null>(null)
const hasLoaded = ref(true)

const syncWithElement = () => {
  hasLoaded.value = image.value?.complete ?? true
}

onMounted(syncWithElement)

watch(() => props.src, async () => {
  await nextTick()
  syncWithElement()
})
</script>
