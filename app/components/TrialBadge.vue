<template>
  <div class="bg-gradient-to-r from-brand-500 to-emerald-400 text-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
    <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
      <Icon name="lucide:sparkles" class="w-5 h-5" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-bold">Estás probando Pro</p>
      <p class="text-xs opacity-90">{{ daysText }} restantes para mantener Pro sin perder funciones.</p>
    </div>
    <NuxtLink
      to="/dashboard/billing"
      class="bg-white text-brand-700 text-xs font-bold px-3 py-2 rounded-lg shadow-sm flex-shrink-0"
    >
      Activar Pro
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ days: number }>()

const daysText = computed(() => (props.days === 1 ? '1 día' : `${props.days} días`))
</script>
