<template>
  <svg :viewBox="`0 0 ${width} ${height}`" class="w-full h-24" preserveAspectRatio="none">
    <path v-if="areaPath" :d="areaPath" :fill="color" fill-opacity="0.15" />
    <path v-if="linePath" :d="linePath" fill="none" :stroke="color" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  values: number[]
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'rgb(34 197 94)'
})

const width = 200
const height = 60
const padding = 2

const linePath = computed(() => {
  const values = props.values
  if (values.length === 0) return ''
  const max = Math.max(...values, 1)
  const stepX = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0
  const points = values.map((value, index) => {
    const x = padding + index * stepX
    const y = height - padding - (value / max) * (height - padding * 2)
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })
  return `M ${points.join(' L ')}`
})

const areaPath = computed(() => {
  if (!linePath.value) return ''
  const values = props.values
  const stepX = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0
  const lastX = padding + (values.length - 1) * stepX
  return `${linePath.value} L ${lastX.toFixed(2)},${height - padding} L ${padding},${height - padding} Z`
})
</script>
