interface EnrollMfaResult {
  factorId: string
  qrCode: string
  secret: string
}

interface VerifyMfaInput {
  factorId: string
  code: string
}

interface OperationResult {
  ok: boolean
  error: string | null
}

export const useAccountSecurity = () => {
  const supabase = useSupabaseClient()

  const requestEmailChange = async (email: string): Promise<OperationResult> => {
    const { error } = await supabase.auth.updateUser({ email: email.trim().toLowerCase() })
    if (error) return { ok: false, error: friendlyAuthError(error.message) }
    return { ok: true, error: null }
  }

  const listFactors = async () => {
    const { data, error } = await supabase.auth.mfa.listFactors()
    if (error) return { totp: [], error: error.message }
    return { totp: data?.totp ?? [], error: null }
  }

  const enrollTotp = async (): Promise<{ data: EnrollMfaResult | null; error: string | null }> => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
    if (error || !data) return { data: null, error: error?.message ?? 'No se pudo iniciar el enrolamiento.' }
    return {
      data: { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret },
      error: null
    }
  }

  const verifyTotp = async (input: VerifyMfaInput): Promise<OperationResult> => {
    const challenge = await supabase.auth.mfa.challenge({ factorId: input.factorId })
    if (challenge.error || !challenge.data) {
      return { ok: false, error: challenge.error?.message ?? 'No se pudo iniciar el reto.' }
    }
    const verify = await supabase.auth.mfa.verify({
      factorId: input.factorId,
      challengeId: challenge.data.id,
      code: input.code
    })
    if (verify.error) return { ok: false, error: 'Código incorrecto. Verifica e intenta de nuevo.' }
    return { ok: true, error: null }
  }

  const unenrollFactor = async (factorId: string): Promise<OperationResult> => {
    const { error } = await supabase.auth.mfa.unenroll({ factorId })
    if (error) return { ok: false, error: error.message }
    return { ok: true, error: null }
  }

  return { requestEmailChange, listFactors, enrollTotp, verifyTotp, unenrollFactor }
}

const friendlyAuthError = (message: string): string => {
  if (message.includes('User already registered') || message.includes('already registered')) {
    return 'Ese correo ya está en uso.'
  }
  if (message.includes('invalid')) return 'Correo no válido.'
  return 'No se pudo actualizar el correo. Intenta más tarde.'
}
