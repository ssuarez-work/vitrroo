<template>
  <div
    class="flex items-center gap-4 md:gap-6 cursor-pointer btn-press hover-lift hover-lift-shadow group bg-[var(--store-surface)] border border-black/5 p-3 md:p-4 rounded-[var(--store-card-radius)] shadow-sm relative"
    @click="$emit('click')"
  >
    <div v-if="product.is_pinned" class="absolute top-2 right-2 z-10 bg-brand-500 text-white rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
      <Icon name="lucide:sparkles" class="w-3 h-3" />
    </div>

    <div class="w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
      <FadeInImage
        v-if="coverImage"
        :src="coverImage"
        :alt="product.name"
        class="w-full h-full object-cover hover-zoom"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
        <Icon name="lucide:image" class="w-7 h-7 opacity-50" />
      </div>
    </div>

    <div class="flex-1 min-w-0">
      <h3 class="font-[var(--store-heading-font)] font-semibold text-[var(--store-text)] text-base leading-snug line-clamp-2 mb-1">
        {{ product.name }}
      </h3>
      <p class="text-sm text-[var(--store-text-muted)] line-clamp-1 mb-1.5">
        {{ shortDescription }}
      </p>
      <p class="font-bold text-brand-600 text-lg">${{ fromCents(product.price) }}</p>
    </div>

    <Icon name="lucide:chevron-right" class="w-5 h-5 text-[var(--store-text-muted)] flex-shrink-0" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '~/types'

const props = defineProps<{ product: Product }>()
defineEmits<{ click: [] }>()

const { fromCents } = usePrice()

const coverImage = computed(() => coverImageOf(props.product))

const shortDescription = computed(() => {
  const variants = props.product.product_variants ?? []
  if (variants.length > 0) return variants.map((v) => v.label).join(' · ')
  if (props.product.options.length > 0) return props.product.options.join(' · ')
  return ''
})
</script>
