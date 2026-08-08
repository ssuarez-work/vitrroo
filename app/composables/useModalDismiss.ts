import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import type { Ref } from 'vue'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',')

interface DismissLayer {
  isOpen: () => boolean
}

const layers: DismissLayer[] = []

const registerLayer = (layer: DismissLayer) => {
  layers.push(layer)
}

const unregisterLayer = (layer: DismissLayer) => {
  const index = layers.indexOf(layer)
  if (index !== -1) layers.splice(index, 1)
}

const isTopmostOpenLayer = (layer: DismissLayer): boolean => {
  for (let index = layers.length - 1; index >= 0; index--) {
    const candidate = layers[index]!
    if (candidate.isOpen()) return candidate === layer
  }
  return false
}

const visibleFocusable = (root: HTMLElement): HTMLElement[] => {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.offsetParent !== null
  )
}

export const useModalDismiss = (
  isOpen: () => boolean,
  onClose: () => void,
  container: Ref<HTMLElement | null>
) => {
  const layer: DismissLayer = { isOpen }
  let previouslyFocused: HTMLElement | null = null

  const trapFocus = (eventKey: KeyboardEvent) => {
    const root = container.value
    if (!root) return

    const focusable = visibleFocusable(root)
    if (focusable.length === 0) {
      eventKey.preventDefault()
      root.focus()
      return
    }

    const first = focusable[0]!
    const last = focusable[focusable.length - 1]!
    const active = document.activeElement

    if (eventKey.shiftKey && active === first) {
      eventKey.preventDefault()
      last.focus()
    } else if (!eventKey.shiftKey && active === last) {
      eventKey.preventDefault()
      first.focus()
    }
  }

  const onKeydown = (event: KeyboardEvent) => {
    if (!isTopmostOpenLayer(layer)) return
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }
    if (event.key === 'Tab') {
      trapFocus(event)
    }
  }

  const focusInitial = () => {
    const root = container.value
    if (!root) return
    const focusable = visibleFocusable(root)
    ;(focusable[0] ?? root).focus()
  }

  watch(isOpen, async (open) => {
    if (open) {
      previouslyFocused = document.activeElement as HTMLElement | null
      await nextTick()
      focusInitial()
    } else {
      previouslyFocused?.focus()
      previouslyFocused = null
    }
  })

  onMounted(async () => {
    registerLayer(layer)
    document.addEventListener('keydown', onKeydown)
    if (isOpen()) {
      previouslyFocused = document.activeElement as HTMLElement | null
      await nextTick()
      focusInitial()
    }
  })

  onBeforeUnmount(() => {
    unregisterLayer(layer)
    document.removeEventListener('keydown', onKeydown)
    previouslyFocused?.focus()
  })
}
