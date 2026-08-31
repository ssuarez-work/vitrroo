<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <button
      v-for="theme in themes"
      :key="theme.id"
      type="button"
      :class="cardClasses(theme)"
      :aria-label="isLocked(theme) ? `${theme.name} — disponible en Pro` : theme.name"
      @click="onSelect(theme)"
    >
      <div
        class="rounded-xl overflow-hidden border border-black/5 mb-3 h-32 p-3 flex flex-col relative"
        :style="previewBackground(theme)"
      >
        <span
          v-if="isLocked(theme)"
          class="absolute top-2 right-2 z-10 flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-full bg-gray-900 text-white text-[10px] font-bold shadow-sm"
        >
          <Icon name="lucide:lock" class="w-2.5 h-2.5" />
          Pro
        </span>
        <div class="flex items-center gap-2 mb-2">
          <div class="w-5 h-5 rounded-full" :style="{ backgroundColor: theme.brandColor }"></div>
          <div
            class="text-[10px] font-bold flex-1 truncate"
            :style="previewTitleStyle(theme)"
          >
            {{ theme.name }}
          </div>
        </div>

        <div class="flex-1" :class="previewLayout(theme)">
          <div
            v-for="i in previewItemCount(theme)"
            :key="i"
            class="rounded"
            :style="previewItemStyle(theme)"
          ></div>
        </div>
      </div>

      <div class="text-left px-1">
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-bold text-gray-900 truncate">{{ theme.name }}</p>
          <Icon
            v-if="modelValue === theme.id && !isLocked(theme)"
            name="lucide:check-circle-2"
            class="w-4 h-4 text-brand-500 flex-shrink-0"
          />
        </div>
        <p class="text-[11px] text-gray-500 leading-tight mt-0.5 line-clamp-2">{{ theme.audience }}</p>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { FONT_DEFINITIONS, THEMES_FREE_FIRST, type StoreTheme } from '~/themes'

interface Props {
  modelValue: string | null
  canUseProThemes?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canUseProThemes: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'locked-select': [theme: StoreTheme]
}>()

const themes = THEMES_FREE_FIRST

const isLocked = (theme: StoreTheme): boolean => {
  return theme.tier === 'pro' && !props.canUseProThemes
}

const cardClasses = (theme: StoreTheme): string => {
  const base = 'p-3 rounded-2xl border-2 bg-white transition-colors text-left btn-press'
  if (isLocked(theme)) {
    return `${base} border-[#f0f0f2] hover:border-gray-900`
  }
  if (props.modelValue === theme.id) {
    return `${base} border-brand-500 ring-2 ring-brand-500/15`
  }
  return `${base} border-[#f0f0f2] hover:border-gray-300 active:border-gray-400`
}

const previewBackground = (theme: StoreTheme) => ({
  backgroundColor: theme.background,
  color: theme.textPrimary
})

const previewTitleStyle = (theme: StoreTheme) => ({
  fontFamily: FONT_DEFINITIONS[theme.headingFont].fontFamilyCss,
  textTransform: theme.uppercaseHeadings ? 'uppercase' : 'none',
  letterSpacing: theme.letterSpacing,
  color: theme.textPrimary
})

const previewLayout = (theme: StoreTheme): string => {
  switch (theme.layout) {
    case 'grid-3':
      return 'grid grid-cols-3 gap-1'
    case 'single':
      return 'flex flex-col gap-1.5'
    case 'list':
      return 'flex flex-col gap-1'
    case 'grid-2':
    default:
      return 'grid grid-cols-2 gap-1.5'
  }
}

const previewItemCount = (theme: StoreTheme): number => {
  switch (theme.layout) {
    case 'grid-3': return 6
    case 'single': return 2
    case 'list': return 3
    default: return 4
  }
}

const previewItemStyle = (theme: StoreTheme) => {
  const base: Record<string, string> = {
    backgroundColor: theme.surface,
    minHeight: theme.layout === 'list' ? '14px' : '24px'
  }
  if (theme.cardVariant === 'flat') {
    base.border = `1.5px solid ${theme.textPrimary}`
    base.borderRadius = '2px'
  } else if (theme.cardVariant === 'rounded') {
    base.borderRadius = '10px'
  } else if (theme.cardVariant === 'minimal') {
    base.backgroundColor = 'transparent'
    base.border = `1px solid ${theme.textMuted}30`
    base.borderRadius = '2px'
  } else if (theme.cardVariant === 'overlay') {
    base.background = `linear-gradient(180deg, ${theme.brandColor}40 0%, ${theme.textPrimary}60 100%)`
    base.borderRadius = theme.cardRadius
  } else if (theme.cardVariant === 'list') {
    base.borderRadius = '8px'
    base.backgroundColor = theme.surface
  } else if (theme.cardVariant === 'polaroid') {
    base.borderRadius = '2px'
    base.boxShadow = '0 1px 3px rgba(0,0,0,0.15)'
  } else if (theme.cardVariant === 'sharp') {
    base.borderRadius = '4px'
  } else {
    base.borderRadius = '10px'
    base.boxShadow = '0 1px 2px rgba(0,0,0,0.06)'
  }
  return base
}

const onSelect = (theme: StoreTheme) => {
  if (isLocked(theme)) {
    emit('locked-select', theme)
    return
  }
  emit('update:modelValue', theme.id)
}
</script>
