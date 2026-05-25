<template>
  <div :class="['skeleton', roundedClass]" role="status" aria-label="Cargando..."></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

const props = withDefaults(defineProps<Props>(), {
  rounded: 'md'
})

const roundedClass = computed(() => {
  switch (props.rounded) {
    case 'sm': return 'rounded'
    case 'lg': return 'rounded-lg'
    case 'xl': return 'rounded-xl'
    case '2xl': return 'rounded-2xl'
    case 'full': return 'rounded-full'
    case 'md':
    default: return 'rounded-md'
  }
})
</script>
