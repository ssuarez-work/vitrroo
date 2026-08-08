<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[100] flex flex-col justify-end"
        role="dialog"
        aria-modal="true"
        :aria-label="product?.name ?? 'Producto'"
      >
        <div
          class="absolute inset-0 bg-gray-900/40 backdrop-blur-xs"
          :style="backdropStyle"
          @click="close"
        ></div>

        <Transition name="slide-up">
          <div
            v-if="modelValue"
            ref="dialogRef"
            tabindex="-1"
            class="relative w-full max-w-md md:max-w-lg lg:max-w-2xl mx-auto shadow-modal flex flex-col max-h-[90vh] md:max-h-[88vh] lg:max-h-[85vh] overflow-hidden outline-none"
            :style="[sheetStyle, dragStyle]"
          >
            <div
              class="w-full flex justify-center pt-4 pb-3 cursor-grab active:cursor-grabbing touch-none"
              @pointerdown="onPointerDown"
              @pointermove="onPointerMove"
              @pointerup="onPointerUp"
              @pointercancel="onPointerUp"
              @click="close"
            >
              <div class="w-12 h-1.5 rounded-full" :style="handleStyle"></div>
            </div>

            <div class="overflow-y-auto px-6 md:px-8 lg:px-10 pb-36 md:pb-32 scrollbar-hide">
              <div
                :class="['aspect-square overflow-hidden mb-3 relative touch-pan-y', mediaClass]"
                :style="mediaStyle"
                @pointerdown="onGalleryPointerDown"
                @pointerup="onGalleryPointerUp"
                @pointercancel="onGalleryPointerCancel"
              >
                <Transition name="gallery">
                  <FadeInImage
                    v-if="currentImage"
                    :key="currentImage"
                    :src="currentImage"
                    :alt="product?.name ?? 'Producto'"
                    loading="eager"
                    class="absolute inset-0 w-full h-full object-cover"
                  />
                </Transition>
                <div v-if="!currentImage" class="w-full h-full flex items-center justify-center" :style="{ color: 'var(--store-text-muted)' }">
                  <Icon name="lucide:image" class="w-12 h-12 opacity-50" />
                </div>

                <template v-if="galleryImages.length > 1">
                  <button
                    type="button"
                    class="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center shadow-sm active:scale-95"
                    :style="navButtonStyle"
                    aria-label="Imagen anterior"
                    @click="previousImage"
                  >
                    <Icon name="lucide:chevron-left" class="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center shadow-sm active:scale-95"
                    :style="navButtonStyle"
                    aria-label="Siguiente imagen"
                    @click="nextImage"
                  >
                    <Icon name="lucide:chevron-right" class="w-5 h-5" />
                  </button>
                </template>
              </div>

              <div v-if="galleryImages.length > 1" class="flex justify-center gap-2 mb-5">
                <button
                  v-for="(url, index) in galleryImages"
                  :key="url + index"
                  type="button"
                  class="w-6 h-1.5 rounded-full origin-center gallery-dot"
                  :style="dotStyle(index)"
                  :aria-label="`Ir a imagen ${index + 1}`"
                  @click="activeImageIndex = index"
                ></button>
              </div>

              <h2 class="text-2xl md:text-3xl lg:text-4xl mb-1.5 md:mb-2 leading-tight" :style="titleStyle">{{ product?.name }}</h2>
              <p class="text-xl md:text-2xl lg:text-3xl font-bold mb-6 md:mb-8" :style="priceStyle">${{ fromCents(product?.price ?? 0) }}</p>

              <div v-if="variants.length > 0" class="mb-6">
                <label class="block text-sm font-semibold mb-3" :style="labelStyle">Selecciona una variante</label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="variant in variants"
                    :key="variant.id"
                    type="button"
                    :disabled="isOutOfStock(variant)"
                    :class="optionButtonClass"
                    :style="variantPillStyle(variant)"
                    @click="selectVariant(variant)"
                  >
                    <span>{{ variant.label }}</span>
                    <span v-if="variant.stock_quantity !== null" class="text-xs ml-1.5 opacity-75">
                      {{ isOutOfStock(variant) ? 'Agotado' : `${variant.stock_quantity} disp.` }}
                    </span>
                  </button>
                </div>
              </div>

              <div v-else-if="legacyOptions.length > 0" class="mb-6">
                <label class="block text-sm font-semibold mb-3" :style="labelStyle">Selecciona una opción</label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="opt in legacyOptions"
                    :key="opt"
                    type="button"
                    :class="optionButtonClass"
                    :style="optionPillStyle(opt)"
                    @click="selectOption(opt)"
                  >
                    {{ opt }}
                  </button>
                </div>
              </div>
            </div>

            <div class="absolute bottom-0 left-0 right-0 p-5 md:p-6 lg:p-8 safe-bottom" :style="footerStyle">
              <button
                v-if="canOrder"
                type="button"
                class="wa-cta btn-press w-full py-4 md:py-5 text-lg md:text-xl font-semibold inline-flex items-center justify-center gap-2 md:gap-3 shadow-wa"
                :style="ctaStyle"
                :disabled="isOpeningWhatsApp"
                @click="sendWhatsApp"
              >
                <Icon
                  :name="isOpeningWhatsApp ? 'lucide:loader-2' : 'ic:baseline-whatsapp'"
                  :class="['w-6 h-6', isOpeningWhatsApp ? 'animate-spin' : '']"
                />
                {{ isOpeningWhatsApp ? 'Abriendo WhatsApp…' : 'Pedir por WhatsApp' }}
              </button>
              <p v-else class="text-center text-sm" :style="{ color: 'var(--store-text-muted)' }">{{ disabledReason }}</p>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Product, ProductVariant, Store } from '~/types'

const OPENING_FEEDBACK_MS = 1400
const INACTIVE_DOT_SCALE = 0.25

const props = defineProps<{
  modelValue: boolean
  product: Product | null
  store: Store | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'whatsapp-click': [product: Product, variant: ProductVariant | null]
}>()

const { fromCents } = usePrice()
const { buildWhatsAppUrl } = useStorefront()
const { resolveTheme } = useStoreTheme()

const haptics = useHaptics()

const dialogRef = ref<HTMLElement | null>(null)
const selectedVariantId = ref<string | null>(null)
const selectedOption = ref<string | null>(null)
const activeImageIndex = ref(0)
const isOpeningWhatsApp = ref(false)

const close = () => emit('update:modelValue', false)

const {
  progress: dragProgress,
  dragStyle,
  reset: resetDrag,
  onPointerDown,
  onPointerMove,
  onPointerUp
} = useSheetDrag({ sheet: dialogRef, onDismiss: close })

const backdropStyle = computed(() => ({ opacity: 1 - dragProgress.value }))

const theme = computed(() => resolveTheme(props.store ?? null))

const variants = computed<ProductVariant[]>(() => props.product?.product_variants ?? [])
const legacyOptions = computed<string[]>(() => props.product?.options ?? [])

const galleryImages = computed<string[]>(() => {
  if (!props.product) return []
  const fromTable = sortedProductImages(props.product).map((image) => image.url)
  if (fromTable.length > 0) return fromTable
  return props.product.image_url ? [props.product.image_url] : []
})

const currentImage = computed(() => galleryImages.value[activeImageIndex.value] ?? null)

const isOutOfStock = (variant: ProductVariant): boolean => {
  return variant.stock_quantity !== null && variant.stock_quantity <= 0
}

const selectedVariant = computed<ProductVariant | null>(() => {
  if (!selectedVariantId.value) return null
  return variants.value.find((v) => v.id === selectedVariantId.value) ?? null
})

const hasWhatsApp = computed(() => Boolean(props.store?.whatsapp_number))
const needsVariantSelection = computed(() => variants.value.length > 0 && !selectedVariant.value)
const variantIsOutOfStock = computed(() => selectedVariant.value !== null && isOutOfStock(selectedVariant.value))

const canOrder = computed(() => {
  return hasWhatsApp.value && !needsVariantSelection.value && !variantIsOutOfStock.value && Boolean(props.product)
})

const disabledReason = computed(() => {
  if (!hasWhatsApp.value) return 'Esta tienda aún no tiene un número de WhatsApp configurado.'
  if (variantIsOutOfStock.value) return 'La variante seleccionada está agotada.'
  if (needsVariantSelection.value) return 'Selecciona una variante disponible.'
  return ''
})

const sheetRadius = computed(() => {
  if (theme.value.cardRadius === '0rem' || theme.value.cardRadius === '0px') return '0px'
  return `max(${theme.value.cardRadius}, 1.25rem)`
})

const sheetStyle = computed(() => ({
  backgroundColor: 'var(--store-surface)',
  color: 'var(--store-text)',
  fontFamily: 'var(--store-body-font)',
  borderTopLeftRadius: sheetRadius.value,
  borderTopRightRadius: sheetRadius.value
}))

const handleStyle = computed(() => ({
  backgroundColor: theme.value.isDark ? 'rgba(255,255,255,0.18)' : 'rgba(15,15,16,0.15)'
}))

const mediaClass = computed(() => 'bg-black/5')
const mediaStyle = computed(() => ({
  borderRadius: 'var(--store-card-radius)'
}))

const navButtonStyle = computed(() => ({
  backgroundColor: theme.value.isDark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.9)',
  color: theme.value.isDark ? '#ffffff' : '#0f0f10'
}))

const dotStyle = (index: number) => {
  const isActive = index === activeImageIndex.value
  return {
    transform: `scaleX(${isActive ? 1 : INACTIVE_DOT_SCALE})`,
    backgroundColor: isActive ? 'var(--store-text)' : 'var(--store-text-muted)'
  }
}

const titleStyle = computed(() => ({
  fontFamily: 'var(--store-heading-font)',
  color: 'var(--store-text)',
  letterSpacing: 'var(--store-letter-spacing)',
  textTransform: theme.value.uppercaseHeadings ? 'uppercase' : 'none',
  fontWeight: theme.value.headingFont === 'cormorant' || theme.value.headingFont === 'playfair' || theme.value.headingFont === 'dm-serif' ? 600 : 700
}))

const priceStyle = computed(() => ({
  color: theme.value.brandColor,
  fontFamily: 'var(--store-body-font)'
}))

const labelStyle = computed(() => ({
  color: 'var(--store-text)',
  fontFamily: 'var(--store-heading-font)',
  letterSpacing: theme.value.uppercaseHeadings ? '0.1em' : 'normal',
  textTransform: theme.value.uppercaseHeadings ? 'uppercase' : 'none'
}))

const optionButtonClass = 'option-pill px-4 py-2.5 text-sm font-medium border btn-press flex items-center'

const baseOptionStyle = computed(() => ({
  borderRadius: 'var(--store-button-radius)',
  backgroundColor: 'transparent',
  borderColor: theme.value.isDark ? 'rgba(255,255,255,0.18)' : 'rgba(15,15,16,0.15)',
  color: 'var(--store-text)',
  fontFamily: 'var(--store-body-font)'
}))

const selectedOptionStyle = computed(() => ({
  borderRadius: 'var(--store-button-radius)',
  backgroundColor: hexWithAlpha(theme.value.brandColor, 0.14),
  borderColor: theme.value.brandColor,
  color: theme.value.isDark ? '#ffffff' : theme.value.brandColor,
  boxShadow: `0 0 0 3px ${hexWithAlpha(theme.value.brandColor, 0.18)}`,
  fontFamily: 'var(--store-body-font)'
}))

const disabledVariantStyle = computed(() => ({
  borderRadius: 'var(--store-button-radius)',
  backgroundColor: 'transparent',
  borderColor: theme.value.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,15,16,0.08)',
  color: 'var(--store-text-muted)',
  fontFamily: 'var(--store-body-font)',
  opacity: 0.5,
  cursor: 'not-allowed'
}))

const variantPillStyle = (variant: ProductVariant) => {
  if (isOutOfStock(variant)) return disabledVariantStyle.value
  if (selectedVariantId.value === variant.id) return selectedOptionStyle.value
  return baseOptionStyle.value
}

const optionPillStyle = (option: string) => {
  if (selectedOption.value === option) return selectedOptionStyle.value
  return baseOptionStyle.value
}

const footerStyle = computed(() => {
  const surface = theme.value.surface
  return {
    background: `linear-gradient(180deg, transparent 0%, ${surface} 40%, ${surface} 100%)`
  }
})

const ctaStyle = computed(() => ({
  borderRadius: 'var(--store-button-radius)',
  fontFamily: 'var(--store-body-font)'
}))

const pickFirstAvailableVariant = () => {
  const firstAvailable = variants.value.find((v) => !isOutOfStock(v))
  selectedVariantId.value = firstAvailable?.id ?? null
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) return
    resetDrag()
    isOpeningWhatsApp.value = false
    selectedOption.value = props.product?.options?.[0] ?? null
    pickFirstAvailableVariant()
    activeImageIndex.value = 0
  }
)

useModalDismiss(() => props.modelValue, close, dialogRef)
useBodyScrollLock(() => props.modelValue)

const previousImage = () => {
  if (galleryImages.value.length === 0) return
  activeImageIndex.value = (activeImageIndex.value - 1 + galleryImages.value.length) % galleryImages.value.length
}

const nextImage = () => {
  if (galleryImages.value.length === 0) return
  activeImageIndex.value = (activeImageIndex.value + 1) % galleryImages.value.length
}

const {
  onPointerDown: onGalleryPointerDown,
  onPointerUp: onGalleryPointerUp,
  onPointerCancel: onGalleryPointerCancel
} = useSwipeNavigation({ onNext: nextImage, onPrevious: previousImage })

const selectVariant = (variant: ProductVariant) => {
  selectedVariantId.value = variant.id
  haptics.tap()
}

const selectOption = (option: string) => {
  selectedOption.value = option
  haptics.tap()
}

const sendWhatsApp = () => {
  if (!props.store || !props.product || isOpeningWhatsApp.value) return
  const url = buildWhatsAppUrl(props.store, props.product, {
    variantId: selectedVariantId.value,
    option: selectedOption.value
  })
  if (!url) return

  haptics.confirm()
  isOpeningWhatsApp.value = true
  emit('whatsapp-click', props.product, selectedVariant.value)
  window.open(url, '_blank')

  setTimeout(() => {
    isOpeningWhatsApp.value = false
  }, OPENING_FEEDBACK_MS)
}

const hexWithAlpha = (hex: string, alpha: number): string => {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return hex
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

.gallery-enter-active,
.gallery-leave-active {
  transition: opacity 220ms ease;
}
.gallery-enter-from,
.gallery-leave-to {
  opacity: 0;
}

.gallery-dot {
  transition: transform 200ms var(--ease-out), background-color 200ms var(--ease-out);
}

.option-pill {
  transition: background-color 200ms var(--ease-out),
              border-color 200ms var(--ease-out),
              color 200ms var(--ease-out),
              box-shadow 200ms var(--ease-out),
              transform var(--duration-press) var(--ease-out);
}

.wa-cta {
  background-color: var(--color-wa);
  color: #ffffff;
  transition: background-color 160ms var(--ease-out),
              transform var(--duration-press) var(--ease-out);
}

.wa-cta:disabled {
  cursor: progress;
}

@media (hover: hover) and (pointer: fine) {
  .wa-cta:not(:disabled):hover {
    background-color: var(--color-wa-dark);
  }
}

@media (prefers-reduced-motion: reduce) {
  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: opacity 200ms ease;
  }
  .slide-up-enter-from,
  .slide-up-leave-to {
    transform: none;
    opacity: 0;
  }
  .gallery-dot {
    transition: background-color 200ms ease;
  }
}
</style>
