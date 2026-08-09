<template>
  <div :class="['rounded-2xl border p-4', unlocked ? 'border-[#f0f0f2] bg-white' : 'border-gray-200 bg-gray-50']">
    <div class="flex items-center justify-between mb-3">
      <h4 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <Icon v-if="!unlocked" name="lucide:lock" class="w-3.5 h-3.5 text-gray-400" />
        {{ title }}
      </h4>
      <NuxtLink
        v-if="!unlocked"
        to="/dashboard/billing"
        class="text-xs font-bold text-brand-600 active:text-brand-700 flex items-center gap-1"
      >
        Desbloquear
        <Icon name="lucide:arrow-right" class="w-3.5 h-3.5" />
      </NuxtLink>
    </div>

    <div :class="unlocked ? '' : 'opacity-60 pointer-events-none'">
      <slot />
    </div>

    <p v-if="!unlocked" class="text-xs text-gray-500 mt-2">Disponible en el plan Pro.</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  unlocked: boolean
}>()
</script>
