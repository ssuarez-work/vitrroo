export interface PhoneCountry {
  iso: string
  name: string
  dialCode: string
  flag: string
}

export const DEFAULT_COUNTRY_ISO = 'MX'

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso: 'MX', name: 'México', dialCode: '+52', flag: '🇲🇽' },
  { iso: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { iso: 'BO', name: 'Bolivia', dialCode: '+591', flag: '🇧🇴' },
  { iso: 'BR', name: 'Brasil', dialCode: '+55', flag: '🇧🇷' },
  { iso: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱' },
  { iso: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴' },
  { iso: 'CR', name: 'Costa Rica', dialCode: '+506', flag: '🇨🇷' },
  { iso: 'EC', name: 'Ecuador', dialCode: '+593', flag: '🇪🇨' },
  { iso: 'SV', name: 'El Salvador', dialCode: '+503', flag: '🇸🇻' },
  { iso: 'ES', name: 'España', dialCode: '+34', flag: '🇪🇸' },
  { iso: 'US', name: 'Estados Unidos', dialCode: '+1', flag: '🇺🇸' },
  { iso: 'GT', name: 'Guatemala', dialCode: '+502', flag: '🇬🇹' },
  { iso: 'HN', name: 'Honduras', dialCode: '+504', flag: '🇭🇳' },
  { iso: 'NI', name: 'Nicaragua', dialCode: '+505', flag: '🇳🇮' },
  { iso: 'PA', name: 'Panamá', dialCode: '+507', flag: '🇵🇦' },
  { iso: 'PY', name: 'Paraguay', dialCode: '+595', flag: '🇵🇾' },
  { iso: 'PE', name: 'Perú', dialCode: '+51', flag: '🇵🇪' },
  { iso: 'PR', name: 'Puerto Rico', dialCode: '+1787', flag: '🇵🇷' },
  { iso: 'DO', name: 'República Dominicana', dialCode: '+1809', flag: '🇩🇴' },
  { iso: 'UY', name: 'Uruguay', dialCode: '+598', flag: '🇺🇾' },
  { iso: 'VE', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪' }
]

const E164_PATTERN = /^\+[1-9]\d{7,14}$/

const BY_LONGEST_DIAL_CODE = [...PHONE_COUNTRIES].sort(
  (a, b) => b.dialCode.length - a.dialCode.length
)

export const onlyDigits = (value: string): string => value.replace(/\D/g, '')

export const isValidE164 = (value: string): boolean => E164_PATTERN.test(value.trim())

export const findCountryByIso = (iso: string): PhoneCountry | null => {
  return PHONE_COUNTRIES.find((country) => country.iso === iso) ?? null
}

export const findCountryByNumber = (value: string): PhoneCountry | null => {
  const digits = onlyDigits(value)
  if (!digits) return null
  return BY_LONGEST_DIAL_CODE.find((country) => digits.startsWith(onlyDigits(country.dialCode))) ?? null
}

export interface PhoneParts {
  iso: string
  nationalNumber: string
}

export const splitPhoneNumber = (value: string | null | undefined): PhoneParts => {
  const digits = onlyDigits(value ?? '')
  if (!digits) return { iso: DEFAULT_COUNTRY_ISO, nationalNumber: '' }

  const country = findCountryByNumber(digits)
  if (!country) return { iso: '', nationalNumber: digits }

  return { iso: country.iso, nationalNumber: digits.slice(onlyDigits(country.dialCode).length) }
}

export const composePhoneNumber = (iso: string, nationalNumber: string): string => {
  const digits = onlyDigits(nationalNumber)
  if (!digits) return ''

  const country = findCountryByIso(iso)
  if (!country) return `+${digits}`

  return `${country.dialCode}${digits}`
}
