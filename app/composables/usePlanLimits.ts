import { computed } from 'vue'
import type { Ref } from 'vue'
import type { Store } from '~/types'

export type LimitValue = number | 'unlimited'

export interface PlanLimits {
  products: LimitValue
  categories: LimitValue
  variantsPerProduct: LimitValue
  imagesPerProduct: LimitValue
  pinnedProducts: LimitValue
  analyticsDays: LimitValue
  canRemoveBranding: boolean
  canUseProThemes: boolean
  canCustomizeThemeColor: boolean
  canCustomizeWhatsAppMessage: boolean
  canPinProducts: boolean
  canExportAnalytics: boolean
  canSeeTopProducts: boolean
}

const FREE_LIMITS: PlanLimits = {
  products: 15,
  categories: 3,
  variantsPerProduct: 5,
  imagesPerProduct: 1,
  pinnedProducts: 0,
  analyticsDays: 30,
  canRemoveBranding: false,
  canUseProThemes: false,
  canCustomizeThemeColor: false,
  canCustomizeWhatsAppMessage: false,
  canPinProducts: false,
  canExportAnalytics: false,
  canSeeTopProducts: false
}

const PRO_LIMITS: PlanLimits = {
  products: 'unlimited',
  categories: 'unlimited',
  variantsPerProduct: 'unlimited',
  imagesPerProduct: 5,
  pinnedProducts: 3,
  analyticsDays: 365,
  canRemoveBranding: true,
  canUseProThemes: true,
  canCustomizeThemeColor: true,
  canCustomizeWhatsAppMessage: true,
  canPinProducts: true,
  canExportAnalytics: true,
  canSeeTopProducts: true
}

export const isStorePro = (store: Store | null | undefined): boolean => {
  if (!store) return false
  if (store.plan === 'pro') return true
  const now = Date.now()
  if (store.trial_ends_at && new Date(store.trial_ends_at).getTime() > now) return true
  if (store.pro_until && new Date(store.pro_until).getTime() > now) return true
  return false
}

export const trialDaysLeft = (store: Store | null | undefined): number => {
  if (!store?.trial_ends_at) return 0
  if (store.plan === 'pro') return 0
  const diffMs = new Date(store.trial_ends_at).getTime() - Date.now()
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

export const isWithinLimit = (limit: LimitValue, current: number): boolean => {
  return limit === 'unlimited' || current < limit
}

export const remainingFor = (limit: LimitValue, current: number): LimitValue => {
  if (limit === 'unlimited') return 'unlimited'
  return Math.max(0, limit - current)
}

export const usePlanLimits = (store: Ref<Store | null>) => {
  const isPro = computed(() => isStorePro(store.value))
  const limits = computed<PlanLimits>(() => (isPro.value ? PRO_LIMITS : FREE_LIMITS))
  const trialDays = computed(() => trialDaysLeft(store.value))
  const isOnTrial = computed(() => isPro.value && store.value?.plan === 'free' && trialDays.value > 0)

  return { isPro, isOnTrial, trialDays, limits }
}
