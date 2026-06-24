<template>
  <div class="flex items-center gap-2 md:gap-3 p-3 bg-white border border-[#f0f0f2] rounded-xl">
    <button
      type="button"
      class="hidden md:flex w-6 h-6 items-center justify-center text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0"
      :aria-label="`Reordenar ${currentNetwork.label}`"
    >
      <Icon name="lucide:grip-vertical" class="w-4 h-4" />
    </button>

    <select
      v-model="selectedType"
      class="px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none w-32 md:w-40 flex-shrink-0"
      :aria-label="`Tipo de red social en posición ${position + 1}`"
    >
      <option v-for="network in availableTypes" :key="network.key" :value="network.key">
        {{ network.label }}
      </option>
    </select>

    <div class="flex-1 min-w-0 relative">
      <input
        v-model="rawValue"
        type="text"
        :placeholder="currentNetwork.inputPlaceholder"
        :inputmode="currentNetwork.inputType === 'url' ? 'url' : 'text'"
        autocapitalize="none"
        autocorrect="off"
        spellcheck="false"
        class="form-input pr-8"
        :aria-invalid="validationState === 'invalid'"
      >
      <span class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <Icon v-if="validationState === 'valid'" name="lucide:check-circle-2" class="w-4 h-4 text-brand-500" />
        <Icon v-else-if="validationState === 'invalid'" name="lucide:alert-circle" class="w-4 h-4 text-red-500" />
      </span>
    </div>

    <button
      type="button"
      class="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
      :aria-label="`Eliminar ${currentNetwork.label}`"
      @click="$emit('remove')"
    >
      <Icon name="lucide:trash-2" class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { SocialLink, SocialNetwork } from '~/types'

interface Props {
  modelValue: SocialLink
  position: number
  takenTypes: SocialNetwork[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: SocialLink]
  'remove': []
}>()

const { definitions, byKey, exists } = useSocialNetworks()
const { detectNetworkFromInput, normalizeHandleInput, normalizeUrlInput } = useSocialLinkParser()

const selectedType = ref<SocialNetwork>(props.modelValue.type)
const rawValue = ref<string>(props.modelValue.value)

const currentNetwork = computed(() => byKey(selectedType.value))

const availableTypes = computed(() => {
  return definitions.filter((network) => {
    if (network.key === selectedType.value) return true
    if (network.allowMultiple) return true
    return !props.takenTypes.includes(network.key)
  })
})

const validationState = computed<'idle' | 'valid' | 'invalid'>(() => {
  const value = rawValue.value.trim()
  if (!value) return 'idle'
  const result = normalize(value)
  return result.ok ? 'valid' : 'invalid'
})

const normalize = (raw: string) => {
  if (currentNetwork.value.inputType === 'handle') {
    return normalizeHandleInput(raw)
  }
  if (currentNetwork.value.hostPatterns.length > 0) {
    return normalizeUrlInput(raw, currentNetwork.value.hostPatterns)
  }
  return normalizeUrlInput(raw)
}

const emitUpdate = () => {
  const result = normalize(rawValue.value)
  emit('update:modelValue', {
    type: selectedType.value,
    value: result.ok ? result.value : rawValue.value.trim()
  })
}

const handleSmartPaste = (text: string) => {
  if (!text) return
  const detected = detectNetworkFromInput(text)
  if (detected && detected !== selectedType.value && availableTypes.value.some((n) => n.key === detected)) {
    selectedType.value = detected
  }
}

watch(selectedType, () => emitUpdate())
watch(rawValue, (next, previous) => {
  if (previous === '' && next.length > 0) handleSmartPaste(next)
  emitUpdate()
})

watch(
  () => props.modelValue,
  (incoming) => {
    if (incoming.type !== selectedType.value && exists(incoming.type)) {
      selectedType.value = incoming.type
    }
    if (incoming.value !== rawValue.value) {
      rawValue.value = incoming.value
    }
  },
  { deep: true }
)
</script>
