export type LoginOutcome =
  | { status: 'success' }
  | { status: 'mfa-required', factorId: string }
  | { status: 'rate-limited' }
  | { status: 'unconfirmed-email' }
  | { status: 'invalid-credentials' }
  | { status: 'error', message: string }

export type MfaVerifyOutcome =
  | { status: 'success' }
  | { status: 'invalid-code' }
  | { status: 'error', message: string }

interface MfaFactor {
  id: string
  status: string
}

const FRIENDLY_MFA_MISSING_FACTOR = 'No encontramos un método de verificación. Contacta soporte.'

const isInvalidCredentials = (message: string): boolean =>
  message.includes('Invalid login credentials')

const isUnconfirmedEmail = (message: string): boolean =>
  message.includes('Email not confirmed')

export const useAuth = () => {
  const supabase = useSupabaseClient()

  const isLoginAttemptAllowed = async (email: string): Promise<boolean> => {
    try {
      await $fetch('/api/auth/login', { method: 'POST', body: { email } })
      return true
    } catch (error) {
      return (error as { statusCode?: number }).statusCode !== 429
    }
  }

  const resolveMfaState = async (): Promise<LoginOutcome> => {
    const { data: aal, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aalError) return { status: 'error', message: aalError.message }
    if (!aal || aal.currentLevel === aal.nextLevel) return { status: 'success' }

    const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors()
    if (factorsError) return { status: 'error', message: factorsError.message }

    const verifiedTotp = (factorsData?.totp ?? []).find((factor: MfaFactor) => factor.status === 'verified')
    if (!verifiedTotp) return { status: 'error', message: FRIENDLY_MFA_MISSING_FACTOR }

    return { status: 'mfa-required', factorId: verifiedTotp.id }
  }

  const login = async (email: string, password: string): Promise<LoginOutcome> => {
    const allowed = await isLoginAttemptAllowed(email)
    if (!allowed) return { status: 'rate-limited' }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (isUnconfirmedEmail(error.message)) return { status: 'unconfirmed-email' }
      if (isInvalidCredentials(error.message)) return { status: 'invalid-credentials' }
      return { status: 'error', message: error.message }
    }

    return resolveMfaState()
  }

  const verifyMfaCode = async (factorId: string, code: string): Promise<MfaVerifyOutcome> => {
    const challenge = await supabase.auth.mfa.challenge({ factorId })
    if (challenge.error || !challenge.data) {
      return { status: 'error', message: challenge.error?.message ?? 'No se pudo iniciar el reto.' }
    }

    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code
    })

    if (verify.error) return { status: 'invalid-code' }
    return { status: 'success' }
  }

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut()
  }

  return { login, verifyMfaCode, signOut }
}
