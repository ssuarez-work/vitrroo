<template>
  <div class="space-y-3">
    <div v-if="links.length === 0" class="text-center py-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
      <Icon name="lucide:link" class="w-8 h-8 text-gray-300 mx-auto mb-2" />
      <p class="text-sm text-gray-500">Aún no tienes redes sociales agregadas.</p>
    </div>

    <SocialLinkRow
      v-for="(link, index) in links"
      :key="`${link.type}-${index}`"
      :model-value="link"
      :position="index"
      :taken-types="otherSelectedTypes(index)"
      @update:model-value="(updated: SocialLink) => updateLink(index, updated)"
      @remove="removeLink(index)"
    />

    <button
      type="button"
      :disabled="!canAddMore"
      class="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-brand-500 hover:text-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-12"
      @click="addLink"
    >
      <Icon name="lucide:plus" class="w-4 h-4" />
      Agregar red social
    </button>

    <p v-if="!canAddMore" class="text-xs text-gray-500 text-center">
      Has alcanzado el máximo de {{ MAX_LINKS }} redes sociales.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SocialLink, SocialNetwork } from '~/types'

interface Props {
  modelValue: SocialLink[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: SocialLink[]]
}>()

const MAX_LINKS = 6

const { definitions, byKey } = useSocialNetworks()

const links = computed(() => props.modelValue)

const canAddMore = computed(() => links.value.length < MAX_LINKS)

const usedSingleTypes = computed(() => {
  return links.value
    .filter((link) => !byKey(link.type).allowMultiple)
    .map((link) => link.type)
})

const otherSelectedTypes = (currentIndex: number): SocialNetwork[] => {
  return links.value
    .filter((_, index) => index !== currentIndex)
    .filter((link) => !byKey(link.type).allowMultiple)
    .map((link) => link.type)
}

const nextDefaultType = (): SocialNetwork => {
  const taken = new Set(usedSingleTypes.value)
  const available = definitions.find((network) => network.allowMultiple || !taken.has(network.key))
  return available?.key ?? 'website'
}

const addLink = () => {
  if (!canAddMore.value) return
  const next = [...links.value, { type: nextDefaultType(), value: '' }]
  emit('update:modelValue', next)
}

const updateLink = (index: number, link: SocialLink) => {
  const next = links.value.map((item, i) => (i === index ? link : item))
  emit('update:modelValue', next)
}

const removeLink = (index: number) => {
  const next = links.value.filter((_, i) => i !== index)
  emit('update:modelValue', next)
}
</script>
