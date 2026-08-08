<template>
  <div :class="['cursor-pointer btn-press hover-lift group flex flex-col relative', containerClass]" @click="$emit('click')">
    <div v-if="product.is_pinned" class="absolute top-2 left-2 z-10 bg-brand-500 text-white rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-1 shadow-sm">
      <Icon name="lucide:sparkles" class="w-3 h-3" />
      Destacado
    </div>

    <div :class="['aspect-square bg-gray-100 relative overflow-hidden', imageWrapperClass]">
      <FadeInImage
        v-if="coverImage"
        :src="coverImage"
        :alt="product.name"
        class="w-full h-full object-cover hover-zoom"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
        <Icon name="lucide:image" class="w-8 h-8 opacity-50" />
      </div>
    </div>
    <div :class="['flex-1 flex flex-col justify-between', textBlockClass]">
      <h3 :class="['leading-snug mb-1 line-clamp-2', headingClass]">{{ product.name }}</h3>
      <p :class="['font-bold', priceClass]">${{ fromCents(product.price) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '~/types'
import type { ThemeCardVariant } from '~/themes'

interface Props {
  product: Product
  variant: ThemeCardVariant
}

const props = defineProps<Props>()
defineEmits<{ click: [] }>()

const { fromCents } = usePrice()

const coverImage = computed(() => coverImageOf(props.product))

const containerClass = computed(() => {
  const base = 'overflow-hidden'
  switch (props.variant) {
    case 'flat':
      return `${base} bg-[var(--store-surface)] border-2 border-current rounded-[var(--store-card-radius)]`
    case 'sharp':
      return `${base} bg-[var(--store-surface)] rounded-[var(--store-card-radius)] shadow-sm border border-black/5`
    case 'rounded':
      return `${base} bg-[var(--store-surface)] rounded-[var(--store-card-radius)] shadow-md`
    case 'minimal':
      return 'bg-transparent overflow-visible'
    case 'polaroid':
      return `${base} bg-white rounded-sm shadow-md pb-3`
    case 'soft':
    default:
      return `${base} bg-[var(--store-surface)] rounded-[var(--store-card-radius)] shadow-card border border-[#f0f0f2]`
  }
})

const imageWrapperClass = computed(() => {
  switch (props.variant) {
    case 'minimal':
    case 'polaroid':
      return 'rounded-sm'
    default:
      return ''
  }
})

const textBlockClass = computed(() => {
  switch (props.variant) {
    case 'minimal':
      return 'py-3'
    case 'polaroid':
      return 'px-2 pt-2'
    default:
      return 'p-3.5'
  }
})

const headingClass = computed(() => {
  const baseStyle = 'font-[var(--store-heading-font)] tracking-[var(--store-letter-spacing)]'
  switch (props.variant) {
    case 'flat':
      return `${baseStyle} text-[0.85rem] font-extrabold text-[var(--store-text)] uppercase`
    case 'minimal':
      return `${baseStyle} text-[0.95rem] font-medium text-[var(--store-text)]`
    case 'polaroid':
      return `${baseStyle} text-sm font-semibold text-gray-800`
    default:
      return `${baseStyle} text-[0.9rem] font-semibold text-[var(--store-text)]`
  }
})

const priceClass = computed(() => {
  switch (props.variant) {
    case 'minimal':
      return 'text-[var(--store-text)] text-sm'
    case 'flat':
      return 'text-brand-600'
    default:
      return 'text-brand-600'
  }
})
</script>
