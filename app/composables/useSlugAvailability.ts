import { ref, watch } from 'vue'
import type { Ref } from 'vue'

const DEBOUNCE_MS = 350

export type AvailabilityStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'reserved'

interface UseSlugAvailabilityOptions {
  slug: Ref<string>
  excludeStoreId: Ref<string | null>
  initialSlug?: Ref<string>
}

export const useSlugAvailability = (options: UseSlugAvailabilityOptions) => {
  const { isSlugAvailable } = useSupabaseStore()
  const { normalize, isValid, isReserved } = useSlug()

  const status = ref<AvailabilityStatus>('idle')
  let pendingTimer: ReturnType<typeof setTimeout> | null = null
  let activeToken = 0

  const cancelPending = () => {
    if (pendingTimer !== null) {
      clearTimeout(pendingTimer)
      pendingTimer = null
    }
  }

  const evaluate = async (slug: string) => {
    const normalized = normalize(slug)

    if (options.initialSlug && normalized === options.initialSlug.value && normalized.length > 0) {
      status.value = 'available'
      return
    }

    if (!normalized) {
      status.value = 'idle'
      return
    }

    if (isReserved(normalized)) {
      status.value = 'reserved'
      return
    }

    if (!isValid(normalized)) {
      status.value = 'invalid'
      return
    }

    const token = ++activeToken
    status.value = 'checking'
    const ok = await isSlugAvailable(normalized, options.excludeStoreId.value)
    if (token !== activeToken) return
    status.value = ok ? 'available' : 'taken'
  }

  watch(
    options.slug,
    (next) => {
      cancelPending()
      pendingTimer = setTimeout(() => evaluate(next), DEBOUNCE_MS)
    },
    { immediate: true }
  )

  return { status }
}
