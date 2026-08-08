import { computed, ref } from 'vue'
import type { Ref } from 'vue'

const DISMISS_DISTANCE_RATIO = 0.35
const DISMISS_VELOCITY = 0.11
const UPWARD_RESISTANCE = 4
const SETTLE_MS = 240

interface SheetDragOptions {
  sheet: Ref<HTMLElement | null>
  onDismiss: () => void
}

const withUpwardResistance = (distance: number): number => {
  if (distance >= 0) return distance
  return -Math.sqrt(-distance) * UPWARD_RESISTANCE
}

export const useSheetDrag = (options: SheetDragOptions) => {
  const offset = ref(0)
  const isDragging = ref(false)
  const isSettling = ref(false)
  const sheetHeight = ref(0)

  let startY = 0
  let startedAt = 0
  let activePointerId: number | null = null
  let settleTimer: ReturnType<typeof setTimeout> | null = null

  const progress = computed(() => {
    if (sheetHeight.value === 0) return 0
    return Math.min(1, Math.max(0, offset.value / sheetHeight.value))
  })

  const dragStyle = computed(() => {
    if (!isDragging.value && !isSettling.value && offset.value === 0) return undefined
    return {
      transform: `translateY(${offset.value}px)`,
      transition: isDragging.value ? 'none' : `transform ${SETTLE_MS}ms var(--ease-drawer)`
    }
  })

  const reset = () => {
    if (settleTimer !== null) clearTimeout(settleTimer)
    settleTimer = null
    offset.value = 0
    isDragging.value = false
    isSettling.value = false
    activePointerId = null
  }

  const scheduleSettle = (target: number, onSettled?: () => void) => {
    isSettling.value = true
    offset.value = target
    settleTimer = setTimeout(() => {
      isSettling.value = false
      settleTimer = null
      onSettled?.()
    }, SETTLE_MS)
  }

  const release = () => {
    const elapsed = performance.now() - startedAt
    const velocity = elapsed > 0 ? offset.value / elapsed : 0
    const passedDistance = offset.value > sheetHeight.value * DISMISS_DISTANCE_RATIO

    isDragging.value = false
    activePointerId = null

    if (passedDistance || velocity > DISMISS_VELOCITY) {
      scheduleSettle(sheetHeight.value, () => {
        offset.value = 0
        options.onDismiss()
      })
      return
    }

    scheduleSettle(0)
  }

  const onPointerDown = (event: PointerEvent) => {
    if (activePointerId !== null) return

    const handle = event.currentTarget as HTMLElement
    handle.setPointerCapture(event.pointerId)

    activePointerId = event.pointerId
    sheetHeight.value = options.sheet.value?.offsetHeight ?? 0
    startY = event.clientY
    startedAt = performance.now()
    offset.value = 0
    isDragging.value = true
    isSettling.value = false
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!isDragging.value || event.pointerId !== activePointerId) return
    offset.value = withUpwardResistance(event.clientY - startY)
  }

  const onPointerUp = (event: PointerEvent) => {
    if (event.pointerId !== activePointerId) return
    release()
  }

  return {
    progress,
    dragStyle,
    isDragging,
    reset,
    onPointerDown,
    onPointerMove,
    onPointerUp
  }
}
