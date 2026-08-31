import type { Store } from '~/types'

let inFlight: Promise<Store | null> | null = null

export const useStoreState = () => {
  const { getMyStore } = useSupabaseStore()

  const store = useState<Store | null>('vitrroo-store', () => null)
  const isLoaded = useState<boolean>('vitrroo-store-loaded', () => false)

  const set = (next: Store | null) => {
    store.value = next
    isLoaded.value = true
  }

  const load = async (): Promise<Store | null> => {
    if (isLoaded.value) return store.value
    if (inFlight) return inFlight

    inFlight = getMyStore()
      .then((result) => {
        set(result)
        return result
      })
      .finally(() => {
        inFlight = null
      })

    return inFlight
  }

  const refresh = async (): Promise<Store | null> => {
    isLoaded.value = false
    return load()
  }

  const patch = (changes: Partial<Store>) => {
    if (!store.value) return
    store.value = { ...store.value, ...changes }
  }

  return { store, isLoaded, load, refresh, patch, set }
}
