import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { STORE_THEMES, type StoreTheme } from '~/themes'

interface UseThemeCarouselOptions {
  intervalMs?: number
  themes?: StoreTheme[]
}

const DEFAULT_INTERVAL_MS = 3500

export const useThemeCarousel = (options: UseThemeCarouselOptions = {}) => {
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS
  const themes = options.themes ?? STORE_THEMES
  const currentIndex = ref(0)
  const currentTheme = computed<StoreTheme>(() => themes[currentIndex.value])

  let timer: ReturnType<typeof setInterval> | null = null

  const advance = () => {
    currentIndex.value = (currentIndex.value + 1) % themes.length
  }

  const start = () => {
    if (timer !== null) return
    timer = setInterval(advance, intervalMs)
  }

  const stop = () => {
    if (timer === null) return
    clearInterval(timer)
    timer = null
  }

  onMounted(start)
  onBeforeUnmount(stop)

  return { themes, currentIndex, currentTheme, advance, start, stop }
}
