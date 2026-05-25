<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[150] flex md:items-center items-end justify-center md:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="absolute inset-0 bg-gray-900/70 md:backdrop-blur-sm" @click="cancel"></div>

      <div class="relative z-10 w-full md:max-w-md bg-white md:rounded-3xl rounded-t-[1.75rem] shadow-modal overflow-hidden max-h-[95dvh] md:max-h-[90vh] flex flex-col">
        <button
          class="md:hidden w-full flex justify-center pt-3 pb-1"
          aria-label="Cerrar"
          @click="cancel"
        >
          <span class="w-12 h-1.5 bg-gray-200 rounded-full"></span>
        </button>

        <div class="px-5 md:px-6 pt-2 md:pt-6 pb-3 md:pb-4 border-b border-[#f0f0f2] flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900">Ajusta tu imagen</h2>
          <button
            class="min-w-11 min-h-11 -mr-2 flex items-center justify-center text-gray-400 active:text-gray-700 transition-colors"
            aria-label="Cerrar"
            @click="cancel"
          >
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>

        <div class="px-5 md:px-6 py-5 flex-1 overflow-y-auto">
          <div
            ref="viewportRef"
            class="relative mx-auto bg-gray-100 overflow-hidden touch-none select-none"
            :class="frameClasses"
            :style="frameStyles"
            @mousedown="onPointerDown"
            @touchstart.passive="onPointerDown"
            @wheel.prevent="onWheel"
          >
            <img
              v-if="imageUrl"
              :src="imageUrl"
              :style="imageStyles"
              class="absolute top-1/2 left-1/2 pointer-events-none select-none origin-center max-w-none"
              alt="Recorte"
              @load="onImageLoad"
            />
            <div class="absolute inset-0 pointer-events-none border-2 border-white/60" :class="overlayClasses"></div>
          </div>

          <div class="mt-5 flex items-center gap-3">
            <Icon name="lucide:zoom-out" class="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              v-model.number="userScale"
              type="range"
              :min="MIN_SCALE"
              :max="MAX_SCALE"
              step="0.01"
              class="flex-1 accent-brand-500 h-6"
              aria-label="Zoom"
            />
            <Icon name="lucide:zoom-in" class="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>
        </div>

        <div class="px-5 md:px-6 py-4 border-t border-[#f0f0f2] pb-[calc(env(safe-area-inset-bottom)+1rem)] md:pb-4 flex gap-3 bg-white">
          <button
            type="button"
            class="flex-1 px-4 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 active:bg-gray-200 transition-colors min-h-12"
            @click="cancel"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="!imageLoaded || isProcessing"
            class="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-gray-900 hover:bg-gray-800 active:bg-gray-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 min-h-12"
            @click="confirm"
          >
            <Icon v-if="isProcessing" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            Aplicar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface Props {
  file: File
  variant?: 'circle' | 'square'
  outputSize?: number
  outputType?: 'image/jpeg' | 'image/webp' | 'image/png'
  outputQuality?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'square',
  outputSize: 800,
  outputType: 'image/jpeg',
  outputQuality: 0.92
})

const emit = defineEmits<{
  confirm: [file: File]
  cancel: []
}>()

const MIN_SCALE = 1
const MAX_SCALE = 3
const MIN_VIEWPORT_PX = 240
const MAX_VIEWPORT_PX = 320

const viewportRef = ref<HTMLDivElement | null>(null)
const imageUrl = ref<string | null>(null)
const imageLoaded = ref(false)
const isProcessing = ref(false)
const viewportPx = ref(MAX_VIEWPORT_PX)

const userScale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)

const naturalWidth = ref(0)
const naturalHeight = ref(0)

const baseScale = computed(() => {
  if (!naturalWidth.value || !naturalHeight.value) return 1
  return Math.max(viewportPx.value / naturalWidth.value, viewportPx.value / naturalHeight.value)
})

const renderedScale = computed(() => baseScale.value * userScale.value)

const renderedSize = computed(() => ({
  width: naturalWidth.value * renderedScale.value,
  height: naturalHeight.value * renderedScale.value
}))

const maxOffsetX = computed(() => Math.max(0, (renderedSize.value.width - viewportPx.value) / 2))
const maxOffsetY = computed(() => Math.max(0, (renderedSize.value.height - viewportPx.value) / 2))

const frameClasses = computed(() => (props.variant === 'circle' ? 'rounded-full' : 'rounded-3xl'))
const overlayClasses = computed(() => (props.variant === 'circle' ? 'rounded-full' : 'rounded-3xl'))
const frameStyles = computed(() => ({
  width: `${viewportPx.value}px`,
  height: `${viewportPx.value}px`
}))

const imageStyles = computed(() => ({
  width: `${renderedSize.value.width}px`,
  height: `${renderedSize.value.height}px`,
  transform: `translate(calc(-50% + ${offsetX.value}px), calc(-50% + ${offsetY.value}px))`
}))

const clampOffsets = () => {
  offsetX.value = Math.max(-maxOffsetX.value, Math.min(maxOffsetX.value, offsetX.value))
  offsetY.value = Math.max(-maxOffsetY.value, Math.min(maxOffsetY.value, offsetY.value))
}

watch(userScale, clampOffsets)

const computeViewportPx = () => {
  if (typeof window === 'undefined') return
  const horizontalPadding = 40
  const target = window.innerWidth - horizontalPadding
  viewportPx.value = Math.max(MIN_VIEWPORT_PX, Math.min(MAX_VIEWPORT_PX, target))
}

const loadFile = () => {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
  imageUrl.value = URL.createObjectURL(props.file)
  imageLoaded.value = false
  userScale.value = 1
  offsetX.value = 0
  offsetY.value = 0
}

watch(() => props.file, loadFile, { immediate: false })

onMounted(() => {
  computeViewportPx()
  window.addEventListener('resize', computeViewportPx)
  loadFile()
})

onBeforeUnmount(() => {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
  if (typeof window !== 'undefined') window.removeEventListener('resize', computeViewportPx)
})

const onImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  naturalWidth.value = img.naturalWidth
  naturalHeight.value = img.naturalHeight
  imageLoaded.value = true
}

type PointerLikeEvent = MouseEvent | TouchEvent

const getPointerCoords = (event: PointerLikeEvent): { x: number; y: number } | null => {
  if ('touches' in event) {
    const touch = event.touches[0]
    if (!touch) return null
    return { x: touch.clientX, y: touch.clientY }
  }
  return { x: event.clientX, y: event.clientY }
}

const onPointerDown = (event: PointerLikeEvent) => {
  if (!imageLoaded.value) return
  const start = getPointerCoords(event)
  if (!start) return

  const startOffsetX = offsetX.value
  const startOffsetY = offsetY.value

  const onMove = (moveEvent: Event) => {
    const point = getPointerCoords(moveEvent as PointerLikeEvent)
    if (!point) return
    offsetX.value = startOffsetX + (point.x - start.x)
    offsetY.value = startOffsetY + (point.y - start.y)
    clampOffsets()
  }

  const onEnd = () => {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onEnd)
    window.removeEventListener('touchmove', onMove)
    window.removeEventListener('touchend', onEnd)
  }

  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onEnd)
  window.addEventListener('touchmove', onMove, { passive: true })
  window.addEventListener('touchend', onEnd)
}

const onWheel = (event: WheelEvent) => {
  const delta = -event.deltaY * 0.002
  userScale.value = Math.max(MIN_SCALE, Math.min(MAX_SCALE, userScale.value + delta))
}

const cancel = () => emit('cancel')

const buildOutputFile = async (): Promise<File | null> => {
  if (!imageLoaded.value) return null

  const sourceSize = viewportPx.value / renderedScale.value
  const sourceCenterX = naturalWidth.value / 2 - offsetX.value / renderedScale.value
  const sourceCenterY = naturalHeight.value / 2 - offsetY.value / renderedScale.value
  const sourceX = sourceCenterX - sourceSize / 2
  const sourceY = sourceCenterY - sourceSize / 2

  const image = new Image()
  image.src = imageUrl.value as string
  if (!image.complete) {
    await new Promise<void>((resolve) => {
      image.onload = () => resolve()
    })
  }

  const canvas = document.createElement('canvas')
  canvas.width = props.outputSize
  canvas.height = props.outputSize
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  if (props.outputType === 'image/jpeg') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  ctx.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, props.outputSize, props.outputSize)

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), props.outputType, props.outputQuality)
  })

  if (!blob) return null

  const extension = props.outputType.split('/')[1]
  const baseName = props.file.name.replace(/\.[^.]+$/, '') || 'image'
  return new File([blob], `${baseName}.${extension}`, { type: props.outputType })
}

const confirm = async () => {
  isProcessing.value = true
  const file = await buildOutputFile()
  isProcessing.value = false
  if (file) emit('confirm', file)
}
</script>
