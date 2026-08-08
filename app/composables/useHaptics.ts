const TAP_MS = 10
const CONFIRM_MS = 18

const canVibrate = (): boolean => {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
}

export const useHaptics = () => {
  const vibrate = (duration: number) => {
    if (!canVibrate()) return
    navigator.vibrate(duration)
  }

  return {
    tap: () => vibrate(TAP_MS),
    confirm: () => vibrate(CONFIRM_MS)
  }
}
