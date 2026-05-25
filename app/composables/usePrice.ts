const LOCALE = 'es-MX'
const CENTS_PER_UNIT = 100

export const usePrice = () => {
  const fromCents = (cents: number | null | undefined): string => {
    const value = (cents ?? 0) / CENTS_PER_UNIT
    return value.toLocaleString(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const toCents = (input: string | number): number => {
    const value = typeof input === 'string' ? parseFloat(input.replace(',', '.')) : input
    if (!Number.isFinite(value) || value < 0) return 0
    return Math.round(value * CENTS_PER_UNIT)
  }

  return { fromCents, toCents }
}
