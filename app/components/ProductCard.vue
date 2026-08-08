<template>
  <ProductCardList v-if="variant === 'list'" :product="product" @click="$emit('click')" />
  <ProductCardOverlay v-else-if="variant === 'overlay'" :product="product" @click="$emit('click')" />
  <ProductCardGrid v-else :product="product" :variant="variant" @click="$emit('click')" />
</template>

<script setup lang="ts">
import ProductCardGrid from './storefront/ProductCardGrid.vue'
import ProductCardList from './storefront/ProductCardList.vue'
import ProductCardOverlay from './storefront/ProductCardOverlay.vue'
import type { Product } from '~/types'
import type { ThemeCardVariant } from '~/themes'

withDefaults(defineProps<{
  product: Product
  variant?: ThemeCardVariant
}>(), {
  variant: 'soft'
})

defineEmits<{ click: [] }>()
</script>
