<template>
  <div
    class="relative overflow-hidden rounded-[var(--store-card-radius)] cursor-pointer btn-press group aspect-[4/5] bg-gray-200 md:transition-transform md:duration-200 md:hover:-translate-y-1 md:hover:shadow-xl"
    @click="$emit('click')"
  >
    <img
      v-if="coverImage"
      :src="coverImage"
      :alt="product.name"
      loading="lazy"
      class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
    />
    <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
      <Icon name="lucide:image" class="w-14 h-14 opacity-50" />
    </div>

    <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>

    <div v-if="product.is_pinned" class="absolute top-3 left-3 z-10 bg-white/90 text-gray-900 rounded-full px-2.5 py-1 text-[10px] font-bold flex items-center gap-1">
      <Icon name="lucide:sparkles" class="w-3 h-3" />
      Destacado
    </div>

    <div class="absolute inset-x-0 bottom-0 p-5 md:p-7 text-white">
      <h3 class="font-[var(--store-heading-font)] text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight mb-1 md:mb-2 line-clamp-2">
        {{ product.name }}
      </h3>
      <p class="text-lg md:text-xl lg:text-2xl font-bold opacity-95">${{ fromCents(product.price) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '~/types'

const props = defineProps<{ product: Product }>()
defineEmits<{ click: [] }>()

const { fromCents } = usePrice()

const coverImage = computed(() => {
  const images = [...(props.product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  return images[0]?.url ?? props.product.image_url ?? null
})
</script>
