<template>
  <div>
    <div
      ref="surface"
      class="relative touch-pan-y select-none"
      @pointerdown="onPointerMove"
      @pointermove="onPointerMove"
      @pointerleave="activeIndex = null"
      @pointercancel="activeIndex = null"
    >
      <svg :viewBox="`0 0 ${WIDTH} ${HEIGHT}`" class="w-full h-40" preserveAspectRatio="none" role="img" :aria-label="ariaLabel">
        <path v-if="visitsArea" :d="visitsArea" fill="rgb(var(--brand-500))" fill-opacity="0.12" />
        <path v-if="visitsLine" :d="visitsLine" fill="none" stroke="rgb(var(--brand-500))" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
        <path v-if="clicksLine" :d="clicksLine" fill="none" stroke="#0f0f10" stroke-width="2" stroke-dasharray="4 3" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />

        <line
          v-if="activePoint"
          :x1="activePoint.x"
          :x2="activePoint.x"
          :y1="0"
          :y2="HEIGHT"
          stroke="#0f0f10"
          stroke-opacity="0.15"
          stroke-width="1"
          vector-effect="non-scaling-stroke"
        />
        <circle v-if="activePoint" :cx="activePoint.x" :cy="activePoint.visitsY" r="3" fill="rgb(var(--brand-500))" vector-effect="non-scaling-stroke" />
      </svg>

      <div
        v-if="peak && !activePoint"
        class="absolute -translate-x-1/2 -translate-y-full pointer-events-none"
        :style="{ left: `${peak.leftPercent}%`, top: `${peak.topPercent}%` }"
      >
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-500 text-white text-[10px] font-bold whitespace-nowrap shadow-sm">
          <Icon name="lucide:trending-up" class="w-2.5 h-2.5" />
          {{ peak.label }}
        </span>
      </div>

      <div
        v-if="activePoint"
        class="absolute z-10 -translate-x-1/2 pointer-events-none bg-gray-900 text-white rounded-xl px-3 py-2 shadow-modal whitespace-nowrap"
        :style="{ left: `${activePoint.leftPercent}%`, top: '0' }"
      >
        <p class="text-[10px] font-semibold text-gray-300 uppercase tracking-wide">{{ activePoint.dateLabel }}</p>
        <p class="text-xs font-bold">{{ activePoint.visits }} visitas</p>
        <p class="text-xs font-bold text-brand-400">{{ activePoint.clicks }} clics</p>
      </div>
    </div>

    <div class="flex items-center justify-between mt-3 text-[11px] text-gray-500">
      <span class="flex items-center gap-1.5">
        <span class="w-3 h-0.5 rounded-full bg-brand-500"></span>
        Visitas
      </span>
      <span v-if="rangeLabel" class="font-medium">{{ rangeLabel }}</span>
      <span class="flex items-center gap-1.5">
        <span class="w-3 h-0.5 rounded-full border-t-2 border-dashed border-gray-900"></span>
        Clics WhatsApp
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AnalyticsBucket } from '~/types'

interface Props {
  buckets: AnalyticsBucket[]
}

const props = defineProps<Props>()

const WIDTH = 300
const HEIGHT = 120
const PADDING = 4

const surface = ref<HTMLElement | null>(null)
const activeIndex = ref<number | null>(null)

const points = computed(() => props.buckets)

const maxValue = computed(() => {
  const values = points.value.flatMap((bucket) => [bucket.visits, bucket.whatsapp_clicks])
  return Math.max(1, ...values)
})

const stepX = computed(() => {
  return points.value.length > 1 ? (WIDTH - PADDING * 2) / (points.value.length - 1) : 0
})

const xAt = (index: number): number => PADDING + index * stepX.value

const yAt = (value: number): number => {
  return HEIGHT - PADDING - (value / maxValue.value) * (HEIGHT - PADDING * 2)
}

const buildLine = (pick: (bucket: AnalyticsBucket) => number): string => {
  if (points.value.length === 0) return ''
  const coords = points.value.map((bucket, index) => `${xAt(index).toFixed(2)},${yAt(pick(bucket)).toFixed(2)}`)
  return `M ${coords.join(' L ')}`
}

const visitsLine = computed(() => buildLine((bucket) => bucket.visits))
const clicksLine = computed(() => buildLine((bucket) => bucket.whatsapp_clicks))

const visitsArea = computed(() => {
  if (!visitsLine.value) return ''
  const lastX = xAt(points.value.length - 1)
  return `${visitsLine.value} L ${lastX.toFixed(2)},${HEIGHT - PADDING} L ${PADDING},${HEIGHT - PADDING} Z`
})

const formatDate = (bucket: string): string => {
  const parsed = new Date(bucket)
  if (Number.isNaN(parsed.getTime())) return bucket
  return parsed.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

const rangeLabel = computed(() => {
  const first = points.value[0]
  const last = points.value[points.value.length - 1]
  if (!first || !last || points.value.length < 2) return ''
  return `${formatDate(first.bucket)} — ${formatDate(last.bucket)}`
})

const peakIndex = computed(() => {
  if (points.value.length < 2) return null
  let best = 0
  points.value.forEach((bucket, index) => {
    if (bucket.visits > (points.value[best]?.visits ?? 0)) best = index
  })
  return (points.value[best]?.visits ?? 0) > 0 ? best : null
})

const peak = computed(() => {
  if (peakIndex.value === null) return null
  const bucket = points.value[peakIndex.value]
  if (!bucket) return null
  return {
    leftPercent: (xAt(peakIndex.value) / WIDTH) * 100,
    topPercent: (yAt(bucket.visits) / HEIGHT) * 100,
    label: `${bucket.visits} · ${formatDate(bucket.bucket)}`
  }
})

const activePoint = computed(() => {
  if (activeIndex.value === null) return null
  const bucket = points.value[activeIndex.value]
  if (!bucket) return null
  return {
    x: xAt(activeIndex.value),
    visitsY: yAt(bucket.visits),
    leftPercent: (xAt(activeIndex.value) / WIDTH) * 100,
    dateLabel: formatDate(bucket.bucket),
    visits: bucket.visits,
    clicks: bucket.whatsapp_clicks
  }
})

const ariaLabel = computed(() => {
  return `Tendencia de visitas y clics de WhatsApp en ${points.value.length} días`
})

const onPointerMove = (event: PointerEvent) => {
  const element = surface.value
  if (!element || points.value.length === 0) return

  const bounds = element.getBoundingClientRect()
  if (bounds.width === 0) return

  const ratio = (event.clientX - bounds.left) / bounds.width
  const index = Math.round(ratio * (points.value.length - 1))
  activeIndex.value = Math.min(points.value.length - 1, Math.max(0, index))
}
</script>
