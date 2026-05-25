<template>
  <div class="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2]">
    <div class="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
      <div :class="['w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0', tones[tone]]">
        <Icon :name="icon" class="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <div class="min-w-0">
        <p class="text-xs md:text-sm font-medium text-gray-500 truncate">{{ label }}</p>
        <h3 class="text-xl md:text-2xl font-bold text-gray-900">{{ formattedValue }}</h3>
      </div>
    </div>
    <NuxtLink
      v-if="linkTo"
      :to="linkTo"
      class="text-sm font-semibold text-brand-600 active:text-brand-700 flex items-center gap-1"
    >
      {{ linkLabel }}
      <Icon name="lucide:arrow-right" class="w-4 h-4" />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  icon: string
  label: string
  value: number
  tone?: 'blue' | 'green' | 'purple'
  linkTo?: string
  linkLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'blue',
  linkLabel: 'Ver más'
})

const tones = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-brand-600',
  purple: 'bg-purple-50 text-purple-600'
}

const formattedValue = computed(() => props.value.toLocaleString('es-MX'))
</script>
