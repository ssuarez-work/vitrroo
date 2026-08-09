<template>
  <div v-if="shouldRender" :class="containerClass">
    <div class="flex items-start gap-3 flex-1 min-w-0">
      <div :class="['w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', iconBg]">
        <Icon :name="icon" class="w-4 h-4" />
      </div>
      <div class="min-w-0">
        <p class="text-sm font-semibold" :class="textClass">{{ headline }}</p>
        <p v-if="subline" class="text-xs mt-0.5" :class="sublineClass">{{ subline }}</p>
        <div v-if="numericLimit" class="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div class="h-full bg-brand-500 transition-all" :style="{ width: `${percent}%` }"></div>
        </div>
      </div>
    </div>

    <NuxtLink
      v-if="!isPro"
      to="/dashboard/billing"
      class="ml-2 px-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-colors flex-shrink-0"
    >
      Ver Pro
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Store } from '~/types'
import type { LimitValue } from '~/composables/usePlanLimits'

interface Props {
  store: Store
  current: number
  limit: LimitValue
  label: string
}

const props = defineProps<Props>()

const storeRef = computed(() => props.store)
const { isPro, isOnTrial, trialDays } = usePlanLimits(storeRef)

const numericLimit = computed(() => (typeof props.limit === 'number' ? props.limit : null))
const percent = computed(() => {
  if (numericLimit.value === null || numericLimit.value === 0) return 0
  return Math.min(100, Math.round((props.current / numericLimit.value) * 100))
})

const isNearLimit = computed(() => numericLimit.value !== null && percent.value >= 80)
const isAtLimit = computed(() => numericLimit.value !== null && props.current >= numericLimit.value)

const shouldRender = computed(() => {
  if (isOnTrial.value) return true
  if (numericLimit.value === null) return false
  return isNearLimit.value
})

const headline = computed(() => {
  if (isOnTrial.value) {
    const word = trialDays.value === 1 ? 'día' : 'días'
    return `Estás probando Pro · ${trialDays.value} ${word} restantes`
  }
  if (isAtLimit.value) return `Llegaste al límite de ${numericLimit.value} ${props.label}.`
  return `Estás cerca del límite (${props.current}/${numericLimit.value} ${props.label}).`
})

const subline = computed(() => {
  if (isOnTrial.value) return 'Mantén Pro al finalizar el trial para no perder estas funciones.'
  if (isAtLimit.value) return 'Pasa a Pro y olvídate de los límites.'
  return 'Sube a Pro y vende sin restricciones.'
})

const containerClass = computed(() => {
  const base = 'flex items-center gap-3 rounded-2xl border p-4'
  if (isOnTrial.value) return `${base} bg-brand-50 border-brand-100`
  if (isAtLimit.value) return `${base} bg-red-50 border-red-100`
  return `${base} bg-yellow-50 border-yellow-100`
})

const iconBg = computed(() => {
  if (isOnTrial.value) return 'bg-brand-500 text-white'
  if (isAtLimit.value) return 'bg-red-500 text-white'
  return 'bg-yellow-500 text-white'
})

const icon = computed(() => {
  if (isOnTrial.value) return 'lucide:sparkles'
  if (isAtLimit.value) return 'lucide:alert-triangle'
  return 'lucide:info'
})

const textClass = computed(() => {
  if (isOnTrial.value) return 'text-brand-700'
  if (isAtLimit.value) return 'text-red-700'
  return 'text-yellow-800'
})

const sublineClass = computed(() => {
  if (isOnTrial.value) return 'text-brand-700/80'
  if (isAtLimit.value) return 'text-red-700/80'
  return 'text-yellow-700'
})
</script>
