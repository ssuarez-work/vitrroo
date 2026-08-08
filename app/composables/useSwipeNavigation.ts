const SWIPE_DISTANCE = 40
const SWIPE_VELOCITY = 0.25
const DIRECTION_RATIO = 1.2

interface SwipeNavigationOptions {
  onNext: () => void
  onPrevious: () => void
}

export const useSwipeNavigation = (options: SwipeNavigationOptions) => {
  let startX = 0
  let startY = 0
  let startedAt = 0
  let activePointerId: number | null = null

  const isHorizontal = (deltaX: number, deltaY: number): boolean => {
    return Math.abs(deltaX) > Math.abs(deltaY) * DIRECTION_RATIO
  }

  const onPointerDown = (event: PointerEvent) => {
    if (activePointerId !== null) return
    activePointerId = event.pointerId
    startX = event.clientX
    startY = event.clientY
    startedAt = performance.now()
  }

  const onPointerUp = (event: PointerEvent) => {
    if (event.pointerId !== activePointerId) return
    activePointerId = null

    const deltaX = event.clientX - startX
    const deltaY = event.clientY - startY
    if (!isHorizontal(deltaX, deltaY)) return

    const elapsed = performance.now() - startedAt
    const velocity = elapsed > 0 ? Math.abs(deltaX) / elapsed : 0
    if (Math.abs(deltaX) < SWIPE_DISTANCE && velocity < SWIPE_VELOCITY) return

    if (deltaX < 0) options.onNext()
    else options.onPrevious()
  }

  const onPointerCancel = () => {
    activePointerId = null
  }

  return { onPointerDown, onPointerUp, onPointerCancel }
}
