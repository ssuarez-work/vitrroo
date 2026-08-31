import { onBeforeUnmount, ref, watch } from 'vue'
import type { Ref } from 'vue'

const DURATION_MS = 450

const easeOut = (progress: number): number => 1 - Math.pow(1 - progress, 3)

const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const useAnimatedNumber = (target: Ref<number>) => {
  const displayed = ref(target.value)
  let frame: number | null = null

  const cancel = () => {
    if (frame === null) return
    cancelAnimationFrame(frame)
    frame = null
  }

  const animateTo = (to: number) => {
    cancel()

    if (prefersReducedMotion()) {
      displayed.value = to
      return
    }

    const from = displayed.value
    const startedAt = performance.now()

    const step = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / DURATION_MS)
      displayed.value = Math.round(from + (to - from) * easeOut(progress))
      frame = progress < 1 ? requestAnimationFrame(step) : null
    }

    frame = requestAnimationFrame(step)
  }

  watch(target, animateTo)
  onBeforeUnmount(cancel)

  return { displayed }
}
