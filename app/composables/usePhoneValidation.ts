const PHONE_REGEX = /^\+\d{8,15}$/

export const usePhoneValidation = () => {
  const normalize = (raw: string): string => {
    const trimmed = raw.trim().replace(/[\s()-]/g, '')
    if (!trimmed) return ''
    return trimmed.startsWith('+') ? trimmed : `+${trimmed.replace(/^\++/, '')}`
  }

  const isValid = (value: string): boolean => PHONE_REGEX.test(normalize(value))

  return { normalize, isValid }
}
