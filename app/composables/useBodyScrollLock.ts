import { onBeforeUnmount, watch } from 'vue'

let activeLocks = 0
let overflowBeforeLock = ''

const acquire = () => {
  activeLocks++
  if (activeLocks > 1) return
  overflowBeforeLock = document.body.style.overflow
  document.body.style.overflow = 'hidden'
}

const release = () => {
  if (activeLocks === 0) return
  activeLocks--
  if (activeLocks > 0) return
  document.body.style.overflow = overflowBeforeLock
  overflowBeforeLock = ''
}

export const useBodyScrollLock = (isLocked: () => boolean) => {
  let holdsLock = false

  const sync = (locked: boolean) => {
    if (typeof document === 'undefined') return
    if (locked === holdsLock) return
    holdsLock = locked
    if (locked) acquire()
    else release()
  }

  watch(isLocked, sync, { immediate: true })

  onBeforeUnmount(() => sync(false))
}
