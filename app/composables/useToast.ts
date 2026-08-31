import type { ToastAction, ToastMessage } from '~/types'

const DEFAULT_DURATION = 3500
const ACTION_DURATION = 6000

const toasts = ref<ToastMessage[]>([])
let counter = 0

export const useToast = () => {
  const dismiss = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  const push = (type: ToastMessage['type'], message: string, duration = DEFAULT_DURATION) => {
    const id = ++counter
    toasts.value = [...toasts.value, { id, type, message }]
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
    return id
  }

  const withAction = (message: string, action: ToastAction, duration = ACTION_DURATION) => {
    const id = ++counter
    const run = () => {
      action.run()
      dismiss(id)
    }
    toasts.value = [...toasts.value, { id, type: 'info', message, action: { ...action, run } }]
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
    return id
  }

  return {
    toasts: readonly(toasts),
    success: (message: string, duration?: number) => push('success', message, duration),
    error: (message: string, duration?: number) => push('error', message, duration),
    info: (message: string, duration?: number) => push('info', message, duration),
    withAction,
    dismiss
  }
}
