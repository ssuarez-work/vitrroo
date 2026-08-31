import { describe, expect, it } from 'vitest'
import {
  PHONE_COUNTRIES,
  DEFAULT_COUNTRY_ISO,
  isValidE164,
  findCountryByIso,
  findCountryByNumber,
  splitPhoneNumber,
  composePhoneNumber
} from '../app/utils/phone'

describe('PHONE_COUNTRIES catalog', () => {
  it('has no duplicate iso codes', () => {
    const isos = PHONE_COUNTRIES.map((country) => country.iso)
    expect(new Set(isos).size).toBe(isos.length)
  })

  it('has no duplicate dial codes so lookups stay deterministic', () => {
    const dialCodes = PHONE_COUNTRIES.map((country) => country.dialCode)
    expect(new Set(dialCodes).size).toBe(dialCodes.length)
  })

  it('includes the default country', () => {
    expect(findCountryByIso(DEFAULT_COUNTRY_ISO)).not.toBeNull()
  })

  it('formats every dial code as + followed by digits', () => {
    for (const country of PHONE_COUNTRIES) {
      expect(country.dialCode).toMatch(/^\+\d{1,4}$/)
    }
  })
})

describe('isValidE164', () => {
  it('accepts a well formed international number', () => {
    expect(isValidE164('+5215512345678')).toBe(true)
  })

  it('rejects a number without the plus sign', () => {
    expect(isValidE164('5215512345678')).toBe(false)
  })

  it('rejects numbers that are too short or too long', () => {
    expect(isValidE164('+521234')).toBe(false)
    expect(isValidE164('+5212345678901234')).toBe(false)
  })

  it('rejects a leading zero after the plus', () => {
    expect(isValidE164('+0215512345678')).toBe(false)
  })
})

describe('findCountryByNumber', () => {
  it('matches the longest dial code first', () => {
    expect(findCountryByNumber('+17875551234')?.iso).toBe('PR')
    expect(findCountryByNumber('+18095551234')?.iso).toBe('DO')
    expect(findCountryByNumber('+12125551234')?.iso).toBe('US')
  })

  it('matches a plain mexican number', () => {
    expect(findCountryByNumber('+5215512345678')?.iso).toBe('MX')
  })

  it('returns null for an unlisted country', () => {
    expect(findCountryByNumber('+441234567890')).toBeNull()
  })
})

describe('splitPhoneNumber', () => {
  it('splits a known number into country and national part', () => {
    expect(splitPhoneNumber('+525512345678')).toEqual({ iso: 'MX', nationalNumber: '5512345678' })
  })

  it('falls back to the default country when empty', () => {
    expect(splitPhoneNumber('')).toEqual({ iso: DEFAULT_COUNTRY_ISO, nationalNumber: '' })
    expect(splitPhoneNumber(null)).toEqual({ iso: DEFAULT_COUNTRY_ISO, nationalNumber: '' })
  })

  it('keeps the whole number when the country is unlisted', () => {
    expect(splitPhoneNumber('+441234567890')).toEqual({ iso: '', nationalNumber: '441234567890' })
  })
})

describe('composePhoneNumber', () => {
  it('joins the dial code and the national number', () => {
    expect(composePhoneNumber('MX', '5512345678')).toBe('+525512345678')
  })

  it('strips separators typed by the user', () => {
    expect(composePhoneNumber('MX', '55 1234-5678')).toBe('+525512345678')
  })

  it('returns an empty string when there is no national number', () => {
    expect(composePhoneNumber('MX', '')).toBe('')
    expect(composePhoneNumber('MX', '   ')).toBe('')
  })

  it('prefixes a bare plus when the country is unknown', () => {
    expect(composePhoneNumber('', '441234567890')).toBe('+441234567890')
  })
})

describe('split and compose round trip', () => {
  it('preserves every listed country', () => {
    for (const country of PHONE_COUNTRIES) {
      const original = `${country.dialCode}5512345678`
      const parts = splitPhoneNumber(original)
      expect(composePhoneNumber(parts.iso, parts.nationalNumber)).toBe(original)
    }
  })

  it('preserves a number whose country is not listed', () => {
    const original = '+441234567890'
    const parts = splitPhoneNumber(original)
    expect(composePhoneNumber(parts.iso, parts.nationalNumber)).toBe(original)
  })
})
