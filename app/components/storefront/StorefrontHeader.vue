<template>
  <header v-if="variant === 'centered-circle'" class="pt-14 md:pt-20 pb-8 md:pb-12 px-6 md:px-10 text-center">
    <div class="w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 mx-auto bg-gray-100 rounded-full overflow-hidden mb-4 md:mb-6 shadow-sm ring-4 ring-white">
      <img v-if="store.logo_url" :src="store.logo_url" :alt="logoAlt" class="w-full h-full object-cover">
      <div v-else class="w-full h-full flex items-center justify-center text-brand-500 bg-brand-50">
        <Icon name="lucide:store" class="w-8 h-8 md:w-12 md:h-12" />
      </div>
    </div>
    <h1 :class="['mb-2 md:mb-3', titleClass]" :style="titleStyle">{{ store.name }}</h1>
    <p v-if="store.description" class="text-[var(--store-text-muted)] text-[0.95rem] md:text-base lg:text-lg leading-relaxed max-w-[280px] md:max-w-md mx-auto">
      {{ store.description }}
    </p>
  </header>

  <header v-else-if="variant === 'centered-square'" class="pt-12 md:pt-20 pb-10 md:pb-14 px-6 md:px-10 text-center">
    <div class="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 mx-auto bg-gray-100 overflow-hidden mb-5 md:mb-7 ring-1 ring-black/5">
      <img v-if="store.logo_url" :src="store.logo_url" :alt="logoAlt" class="w-full h-full object-cover">
      <div v-else class="w-full h-full flex items-center justify-center text-brand-500 bg-brand-50">
        <Icon name="lucide:store" class="w-7 h-7 md:w-10 md:h-10" />
      </div>
    </div>
    <h1 :class="['mb-2 md:mb-3', titleClass]" :style="titleStyle">{{ store.name }}</h1>
    <p v-if="store.description" class="text-[var(--store-text-muted)] text-sm md:text-base lg:text-lg leading-relaxed max-w-[300px] md:max-w-md mx-auto">
      {{ store.description }}
    </p>
  </header>

  <header v-else-if="variant === 'banner-overlay'" class="relative pt-16 md:pt-24 pb-12 md:pb-16 px-6 md:px-10 text-center overflow-hidden">
    <div v-if="store.logo_url" class="absolute inset-0 -z-10">
      <img :src="store.logo_url" :alt="logoAlt" class="w-full h-full object-cover blur-2xl opacity-40 scale-110">
      <div class="absolute inset-0 bg-[var(--store-bg)]/70" />
    </div>
    <div class="w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 mx-auto bg-gray-100 rounded-full overflow-hidden mb-4 md:mb-6 shadow-xl ring-4 ring-white/30">
      <img v-if="store.logo_url" :src="store.logo_url" :alt="logoAlt" class="w-full h-full object-cover">
      <div v-else class="w-full h-full flex items-center justify-center text-brand-500 bg-brand-50">
        <Icon name="lucide:store" class="w-8 h-8 md:w-12 md:h-12" />
      </div>
    </div>
    <h1 :class="['mb-2 md:mb-3', titleClass]" :style="titleStyle">{{ store.name }}</h1>
    <p v-if="store.description" class="text-[var(--store-text-muted)] text-[0.95rem] md:text-base lg:text-lg leading-relaxed max-w-[280px] md:max-w-md mx-auto">
      {{ store.description }}
    </p>
  </header>

  <header v-else-if="variant === 'left-compact'" class="pt-8 md:pt-12 pb-6 md:pb-8 px-5 md:px-8 lg:px-10 flex items-center gap-4 md:gap-6 border-b border-black/5">
    <div class="w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-gray-100 rounded-xl md:rounded-2xl overflow-hidden flex-shrink-0">
      <img v-if="store.logo_url" :src="store.logo_url" :alt="logoAlt" class="w-full h-full object-cover">
      <div v-else class="w-full h-full flex items-center justify-center text-brand-500 bg-brand-50">
        <Icon name="lucide:store" class="w-6 h-6 md:w-9 md:h-9" />
      </div>
    </div>
    <div class="flex-1 min-w-0">
      <h1 :class="['leading-tight mb-0.5 md:mb-1', titleClass]" :style="titleStyle">{{ store.name }}</h1>
      <p v-if="store.description" class="text-[var(--store-text-muted)] text-xs md:text-sm lg:text-base leading-snug line-clamp-2 md:line-clamp-3">
        {{ store.description }}
      </p>
    </div>
  </header>

  <header v-else class="pt-16 md:pt-24 lg:pt-32 pb-10 md:pb-14 px-6 md:px-12 lg:px-16">
    <p class="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-[var(--store-text-muted)] mb-3 md:mb-4">Catálogo</p>
    <h1 :class="['mb-3 md:mb-4 leading-[1.05]', titleClass]" :style="titleStyle">{{ store.name }}</h1>
    <p v-if="store.description" class="text-[var(--store-text-muted)] text-base md:text-lg lg:text-xl leading-relaxed max-w-[420px] md:max-w-xl">
      {{ store.description }}
    </p>
    <div v-if="store.logo_url" class="mt-6 md:mt-10 w-16 h-16 md:w-24 md:h-24 lg:w-28 lg:h-28 overflow-hidden">
      <img :src="store.logo_url" :alt="logoAlt" class="w-full h-full object-cover">
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Store } from '~/types'
import type { ThemeHeaderVariant } from '~/themes'

interface Props {
  store: Store
  variant: ThemeHeaderVariant
}

const props = defineProps<Props>()

const logoAlt = computed(() => `Logo de ${props.store.name}`)

const titleClass = computed(() => {
  switch (props.variant) {
    case 'editorial':
      return 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--store-text)]'
    case 'left-compact':
      return 'text-lg md:text-2xl lg:text-3xl font-bold text-[var(--store-text)]'
    case 'centered-square':
      return 'text-xl md:text-3xl lg:text-4xl font-semibold text-[var(--store-text)]'
    default:
      return 'text-[1.75rem] md:text-4xl lg:text-5xl font-extrabold text-[var(--store-text)]'
  }
})

const titleStyle = computed(() => ({
  fontFamily: 'var(--store-heading-font)',
  textTransform: 'var(--store-heading-transform)',
  letterSpacing: 'var(--store-letter-spacing)'
}))
</script>
