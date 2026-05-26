import { describe, expect, it } from 'vitest'
import { isStorePro, trialDaysLeft, isWithinLimit, remainingFor } from '../app/composables/usePlanLimits'
import type { Store } from '../app/types'

const baseStore = (overrides: Partial<Store> = {}): Store => ({
  id: 'store-id',
  user_id: 'user-id',
  slug: 'test-store',
  name: 'Test Store',
  description: null,
  whatsapp_number: null,
  logo_url: null,
  plan: 'free',
  trial_ends_at: null,
  pro_until: null,
  stripe_customer_id: null,
  stripe_subscription_id: null,
  theme_color: null,
  theme_id: null,
  referral_code: null,
  is_published: true,
  created_at: new Date().toISOString(),
  ...overrides
})

const isoFromNow = (offsetMs: number): string => new Date(Date.now() + offsetMs).toISOString()

const ONE_DAY_MS = 24 * 60 * 60 * 1000

describe('isStorePro', () => {
  it('returns false when store is null', () => {
    expect(isStorePro(null)).toBe(false)
  })

  it('returns true when plan is pro', () => {
    expect(isStorePro(baseStore({ plan: 'pro' }))).toBe(true)
  })

  it('returns true when trial is still active', () => {
    expect(isStorePro(baseStore({ trial_ends_at: isoFromNow(ONE_DAY_MS) }))).toBe(true)
  })

  it('returns false when trial expired', () => {
    expect(isStorePro(baseStore({ trial_ends_at: isoFromNow(-ONE_DAY_MS) }))).toBe(false)
  })

  it('returns true when pro_until is still in the future (referral bonus)', () => {
    expect(isStorePro(baseStore({ pro_until: isoFromNow(ONE_DAY_MS) }))).toBe(true)
  })
})

describe('trialDaysLeft', () => {
  it('returns 0 when no trial end date set', () => {
    expect(trialDaysLeft(baseStore())).toBe(0)
  })

  it('returns 0 once user is on paid plan', () => {
    expect(trialDaysLeft(baseStore({ plan: 'pro', trial_ends_at: isoFromNow(7 * ONE_DAY_MS) }))).toBe(0)
  })

  it('rounds up partial days', () => {
    expect(trialDaysLeft(baseStore({ trial_ends_at: isoFromNow(2.3 * ONE_DAY_MS) }))).toBe(3)
  })

  it('returns 0 when trial already expired', () => {
    expect(trialDaysLeft(baseStore({ trial_ends_at: isoFromNow(-2 * ONE_DAY_MS) }))).toBe(0)
  })
})

describe('isWithinLimit', () => {
  it('always returns true for unlimited', () => {
    expect(isWithinLimit('unlimited', 99999)).toBe(true)
  })

  it('returns true when below numeric limit', () => {
    expect(isWithinLimit(15, 14)).toBe(true)
  })

  it('returns false when at limit', () => {
    expect(isWithinLimit(15, 15)).toBe(false)
  })

  it('returns false when above limit', () => {
    expect(isWithinLimit(15, 20)).toBe(false)
  })
})

describe('remainingFor', () => {
  it('returns "unlimited" when limit is unlimited', () => {
    expect(remainingFor('unlimited', 50)).toBe('unlimited')
  })

  it('returns positive difference when under limit', () => {
    expect(remainingFor(15, 10)).toBe(5)
  })

  it('returns 0 when at or over limit', () => {
    expect(remainingFor(15, 15)).toBe(0)
    expect(remainingFor(15, 20)).toBe(0)
  })
})
