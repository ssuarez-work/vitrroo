<template>
  <AdminSheet :model-value="modelValue" :title="title" @update:model-value="onSheetToggle">
    <div class="flex items-start gap-4">
      <div :class="['w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0', iconClasses]">
        <Icon :name="icon" class="w-5 h-5" />
      </div>
      <p class="text-sm text-gray-600 leading-relaxed pt-2">{{ message }}</p>
    </div>

    <template #footer>
      <div class="flex gap-3">
        <button
          type="button"
          class="flex-1 px-5 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 active:bg-gray-300 transition-colors btn-press min-h-12"
          @click="close"
        >
          {{ cancelLabel }}
        </button>
        <button
          type="button"
          :disabled="isBusy"
          :class="['flex-1 px-5 py-3 rounded-xl font-semibold transition-colors btn-press min-h-12 flex items-center justify-center gap-2 disabled:opacity-60', confirmClasses]"
          @click="$emit('confirm')"
        >
          <Icon v-if="isBusy" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          {{ confirmLabel }}
        </button>
      </div>
    </template>
  </AdminSheet>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type ConfirmTone = 'danger' | 'neutral'

interface Props {
  modelValue: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: ConfirmTone
  isBusy?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
  tone: 'danger',
  isBusy: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

const isDanger = computed(() => props.tone === 'danger')

const icon = computed(() => (isDanger.value ? 'lucide:alert-triangle' : 'lucide:help-circle'))

const iconClasses = computed(() => {
  return isDanger.value ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
})

const confirmClasses = computed(() => {
  return isDanger.value
    ? 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800'
    : 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700'
})

const close = () => emit('update:modelValue', false)

const onSheetToggle = (value: boolean) => {
  if (!value) close()
}
</script>
