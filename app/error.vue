<template>
  <div class="min-h-[100dvh] bg-[#f8f8fa] flex items-center justify-center p-5">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-card border border-[#f0f0f2] p-8 md:p-10 text-center">
      <div :class="['w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5', iconBg]">
        <Icon :name="icon" class="w-8 h-8" :class="iconColor" />
      </div>

      <p class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Error {{ statusCode }}</p>
      <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">{{ title }}</h1>
      <p class="text-gray-500 leading-relaxed mb-8">{{ message }}</p>

      <div class="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          class="flex-1 px-5 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 active:bg-gray-700 transition-colors min-h-12"
          @click="handleHome"
        >
          Ir al inicio
        </button>
        <button
          v-if="!isNotFound"
          type="button"
          class="flex-1 px-5 py-3 rounded-xl bg-gray-100 text-gray-900 font-semibold hover:bg-gray-200 transition-colors min-h-12"
          @click="reload"
        >
          Reintentar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NuxtError } from '#app'

interface Props {
  error: NuxtError
}

const props = defineProps<Props>()

const statusCode = computed(() => props.error?.statusCode ?? 500)
const isNotFound = computed(() => statusCode.value === 404)

const title = computed(() => {
  if (isNotFound.value) return 'Página no encontrada'
  if (statusCode.value === 429) return 'Demasiadas peticiones'
  return 'Algo salió mal'
})

const message = computed(() => {
  if (isNotFound.value) return 'El enlace que abriste no existe o fue movido. Revisa la URL o vuelve al inicio.'
  if (statusCode.value === 429) return 'Estamos recibiendo muchas peticiones tuyas. Espera unos segundos e inténtalo de nuevo.'
  return 'Tuvimos un problema procesando tu solicitud. Ya nos enteramos y lo estamos revisando.'
})

const icon = computed(() => {
  if (isNotFound.value) return 'lucide:map-pin-off'
  if (statusCode.value === 429) return 'lucide:timer'
  return 'lucide:alert-triangle'
})

const iconBg = computed(() => {
  if (isNotFound.value) return 'bg-gray-100'
  if (statusCode.value === 429) return 'bg-yellow-50'
  return 'bg-red-50'
})

const iconColor = computed(() => {
  if (isNotFound.value) return 'text-gray-500'
  if (statusCode.value === 429) return 'text-yellow-600'
  return 'text-red-600'
})

const handleHome = () => {
  clearError({ redirect: '/' })
}

const reload = () => {
  if (typeof window !== 'undefined') window.location.reload()
}

useHead({ title: `Error ${statusCode.value} | Vitrroo` })
</script>
