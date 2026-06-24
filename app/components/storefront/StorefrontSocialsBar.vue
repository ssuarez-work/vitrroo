<template>
  <nav v-if="visibleLinks.length > 0" :class="containerClass" :aria-label="ariaLabel">
    <a
      v-for="link in visibleLinks"
      :key="`${link.type}-${link.value}`"
      :href="buildAbsoluteUrl(link)"
      target="_blank"
      rel="noopener noreferrer nofollow"
      :aria-label="`${byKey(link.type).label} de ${storeName}`"
      :class="buttonClass"
      :style="buttonStyle"
    >
      <Icon :name="byKey(link.type).icon" class="w-5 h-5" />
    </a>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SocialLink } from '~/types'

interface Props {
  links: SocialLink[]
  storeName: string
  align?: 'center' | 'start'
  isDark?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  align: 'center',
  isDark: false
})

const { byKey, buildAbsoluteUrl, exists } = useSocialNetworks()

const visibleLinks = computed(() => {
  return props.links.filter((link) => exists(link.type) && link.value.trim().length > 0)
})

const ariaLabel = computed(() => `Redes sociales de ${props.storeName}`)

const containerClass = computed(() => {
  const base = 'flex items-center gap-2 px-5 md:px-8 lg:px-10 -mt-4 mb-6 md:mb-8 overflow-x-auto scrollbar-hide'
  const alignment = props.align === 'center' ? 'justify-center' : 'justify-start'
  return `${base} ${alignment}`
})

const buttonClass = computed(() => {
  return 'flex items-center justify-center w-11 h-11 rounded-full border transition-all duration-200 active:scale-95 flex-shrink-0 hover:scale-105'
})

const buttonStyle = computed(() => ({
  borderColor: props.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(15,15,16,0.1)',
  color: 'var(--store-text)',
  backgroundColor: props.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)'
}))
</script>
