<template>
  <header v-if="variant === 'centered-circle'" class="pt-14 pb-8 px-6 text-center">
    <div class="w-24 h-24 mx-auto bg-gray-100 rounded-full overflow-hidden mb-4 shadow-sm ring-4 ring-white">
      <img v-if="store.logo_url" :src="store.logo_url" :alt="logoAlt" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full flex items-center justify-center text-brand-500 bg-brand-50">
        <Icon name="lucide:store" class="w-8 h-8" />
      </div>
    </div>
    <h1 :class="['mb-2', titleClass]" :style="titleStyle">{{ store.name }}</h1>
    <p v-if="store.description" class="text-[var(--store-text-muted)] text-[0.95rem] leading-relaxed max-w-[280px] mx-auto">
      {{ store.description }}
    </p>
  </header>

  <header v-else-if="variant === 'centered-square'" class="pt-12 pb-10 px-6 text-center">
    <div class="w-20 h-20 mx-auto bg-gray-100 overflow-hidden mb-5 ring-1 ring-black/5">
      <img v-if="store.logo_url" :src="store.logo_url" :alt="logoAlt" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full flex items-center justify-center text-brand-500 bg-brand-50">
        <Icon name="lucide:store" class="w-7 h-7" />
      </div>
    </div>
    <h1 :class="['mb-2', titleClass]" :style="titleStyle">{{ store.name }}</h1>
    <p v-if="store.description" class="text-[var(--store-text-muted)] text-sm leading-relaxed max-w-[300px] mx-auto">
      {{ store.description }}
    </p>
  </header>

  <header v-else-if="variant === 'banner-overlay'" class="relative pt-16 pb-12 px-6 text-center overflow-hidden">
    <div v-if="store.logo_url" class="absolute inset-0 -z-10">
      <img :src="store.logo_url" :alt="logoAlt" class="w-full h-full object-cover blur-2xl opacity-40 scale-110" />
      <div class="absolute inset-0 bg-[var(--store-bg)]/70"></div>
    </div>
    <div class="w-24 h-24 mx-auto bg-gray-100 rounded-full overflow-hidden mb-4 shadow-xl ring-4 ring-white/30">
      <img v-if="store.logo_url" :src="store.logo_url" :alt="logoAlt" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full flex items-center justify-center text-brand-500 bg-brand-50">
        <Icon name="lucide:store" class="w-8 h-8" />
      </div>
    </div>
    <h1 :class="['mb-2', titleClass]" :style="titleStyle">{{ store.name }}</h1>
    <p v-if="store.description" class="text-[var(--store-text-muted)] text-[0.95rem] leading-relaxed max-w-[280px] mx-auto">
      {{ store.description }}
    </p>
  </header>

  <header v-else-if="variant === 'left-compact'" class="pt-8 pb-6 px-5 flex items-center gap-4 border-b border-black/5">
    <div class="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
      <img v-if="store.logo_url" :src="store.logo_url" :alt="logoAlt" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full flex items-center justify-center text-brand-500 bg-brand-50">
        <Icon name="lucide:store" class="w-6 h-6" />
      </div>
    </div>
    <div class="flex-1 min-w-0">
      <h1 :class="['leading-tight mb-0.5', titleClass]" :style="titleStyle">{{ store.name }}</h1>
      <p v-if="store.description" class="text-[var(--store-text-muted)] text-xs leading-snug line-clamp-2">
        {{ store.description }}
      </p>
    </div>
  </header>

  <header v-else class="pt-16 pb-10 px-6">
    <p class="text-[10px] font-bold tracking-[0.3em] uppercase text-[var(--store-text-muted)] mb-3">Catálogo</p>
    <h1 :class="['mb-3 leading-[1.05]', titleClass]" :style="titleStyle">{{ store.name }}</h1>
    <p v-if="store.description" class="text-[var(--store-text-muted)] text-base leading-relaxed max-w-[420px]">
      {{ store.description }}
    </p>
    <div v-if="store.logo_url" class="mt-6 w-16 h-16 overflow-hidden">
      <img :src="store.logo_url" :alt="logoAlt" class="w-full h-full object-cover" />
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
      return 'text-4xl sm:text-5xl font-bold text-[var(--store-text)]'
    case 'left-compact':
      return 'text-lg font-bold text-[var(--store-text)]'
    case 'centered-square':
      return 'text-xl font-semibold text-[var(--store-text)]'
    default:
      return 'text-[1.75rem] font-extrabold text-[var(--store-text)]'
  }
})

const titleStyle = computed(() => ({
  fontFamily: 'var(--store-heading-font)',
  textTransform: 'var(--store-heading-transform)',
  letterSpacing: 'var(--store-letter-spacing)'
}))
</script>
