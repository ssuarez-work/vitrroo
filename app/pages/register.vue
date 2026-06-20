<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f8f8fa] p-4 relative overflow-hidden">
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

    <div class="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-modal border border-white/50 relative z-10">
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm shadow-brand-500/30">
          <Icon name="lucide:store" class="w-6 h-6 text-white" />
        </div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Crea tu cuenta</h1>
        <p class="text-gray-500 mt-2">Estás a un paso de tener tu catálogo digital</p>
      </div>

      <div v-if="infoMessage" class="p-3 bg-brand-50 text-brand-700 text-sm font-medium rounded-xl border border-brand-100 mb-5 text-center">
        {{ infoMessage }}
      </div>

      <form v-else class="space-y-5" @submit.prevent="handleRegister">
        <div v-if="errorMessage" class="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-center gap-2">
          <Icon name="lucide:alert-circle" class="w-4 h-4 flex-shrink-0" />
          {{ errorMessage }}
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Nombre de tu tienda</label>
          <input
            v-model="form.storeName"
            type="text"
            required
            maxlength="60"
            autocomplete="organization"
            autocapitalize="sentences"
            enterkeyhint="next"
            class="auth-input"
            placeholder="Ej. Mi Tienda Increíble"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Correo electrónico</label>
          <input
            v-model="form.email"
            type="email"
            required
            inputmode="email"
            autocomplete="email"
            autocapitalize="none"
            autocorrect="off"
            spellcheck="false"
            enterkeyhint="next"
            class="auth-input"
            placeholder="tu@correo.com"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
          <input
            v-model="form.password"
            type="password"
            required
            :minlength="MIN_PASSWORD_LENGTH"
            autocomplete="new-password"
            enterkeyhint="go"
            class="auth-input"
            :placeholder="`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-brand-500 text-white font-bold py-3.5 rounded-xl mt-4 hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/30 btn-press flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Icon v-if="isLoading" name="lucide:loader-2" class="w-5 h-5 animate-spin" />
          <span v-else>Comenzar ahora</span>
          <Icon v-if="!isLoading" name="lucide:arrow-right" class="w-4 h-4" />
        </button>
      </form>

      <p class="text-center text-sm text-gray-500 mt-8">
        ¿Ya tienes cuenta?
        <NuxtLink to="/login" class="font-semibold text-gray-900 hover:text-brand-600 transition-colors">Inicia sesión</NuxtLink>
      </p>

      <div class="text-[11px] text-gray-500 mt-4 leading-relaxed bg-gray-50 border border-[#f0f0f2] rounded-xl p-3">
        <p class="font-semibold text-gray-700 mb-1">Aviso de privacidad simplificado</p>
        <p>
          Vitrroo (México) recolecta tu correo, nombre y datos de tu tienda para operar el servicio y enviarte
          correos transaccionales. No vendemos tus datos. Puedes ejercer derechos ARCO desde "Mi cuenta" o
          escribiendo a <a href="mailto:hola@vitrroo.com" class="underline">hola@vitrroo.com</a>.
          <NuxtLink to="/privacy" class="underline font-semibold">Ver aviso integral</NuxtLink>.
        </p>
        <p class="mt-2">
          Al registrarte aceptas los
          <NuxtLink to="/terms" class="underline">Términos</NuxtLink>
          y la
          <NuxtLink to="/privacy" class="underline">Política de Privacidad</NuxtLink>.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue'

definePageMeta({ layout: false })

const MIN_PASSWORD_LENGTH = 8
const SLUG_MAX_RETRIES = 5
const UNIQUE_VIOLATION = '23505'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()
const { withRandomSuffix } = useSlug()

const form = ref({ storeName: '', email: '', password: '' })
const isLoading = ref(false)
const errorMessage = ref('')
const infoMessage = ref('')
const referralCode = computed(() => {
  const raw = route.query.ref
  if (typeof raw !== 'string') return null
  return raw.toLowerCase().trim() || null
})

const redirectIfAuthenticated = () => {
  if (user.value) navigateTo('/admin')
}

onMounted(redirectIfAuthenticated)
watchEffect(redirectIfAuthenticated)

const createStoreForUser = async (userId: string, storeName: string): Promise<string | null> => {
  for (let attempt = 0; attempt < SLUG_MAX_RETRIES; attempt++) {
    const slug = withRandomSuffix(storeName)
    const { data, error } = await supabase
      .from('stores')
      .insert({ user_id: userId, name: storeName.trim(), slug })
      .select('id')
      .single()

    if (!error && data) return data.id as string
    if (error && error.code !== UNIQUE_VIOLATION) {
      console.error('Error creando tienda:', error)
      return null
    }
  }
  return null
}

const tryRedeemReferral = async (storeId: string): Promise<void> => {
  if (!referralCode.value) return
  const { error } = await supabase.rpc('redeem_referral', {
    p_code: referralCode.value,
    p_referred_store_id: storeId
  })
  if (error) console.warn('No se pudo aplicar el código de referido:', error.message)
}

const friendlyAuthError = (raw: string): string => {
  if (raw.includes('User already registered')) {
    return 'Este correo ya está registrado. Inicia sesión en su lugar.'
  }
  if (raw.includes('Password should be at least')) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
  }
  return 'Ocurrió un error al registrarse.'
}

const handleRegister = async () => {
  errorMessage.value = ''
  infoMessage.value = ''

  if (form.value.password.length < MIN_PASSWORD_LENGTH) {
    errorMessage.value = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
    return
  }

  isLoading.value = true

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: form.value.email.trim(),
    password: form.value.password
  })

  if (authError) {
    isLoading.value = false
    errorMessage.value = friendlyAuthError(authError.message)
    return
  }

  if (authData.user && !authData.session) {
    isLoading.value = false
    infoMessage.value = '¡Cuenta creada! Revisa tu correo electrónico para confirmarla antes de iniciar sesión.'
    return
  }

  if (authData.user) {
    const storeId = await createStoreForUser(authData.user.id, form.value.storeName)
    if (!storeId) {
      isLoading.value = false
      errorMessage.value = 'Cuenta creada, pero falló al crear la tienda. Contacta soporte.'
      return
    }
    await tryRedeemReferral(storeId)
    isLoading.value = false
  } else {
    isLoading.value = false
  }
}

useNoIndex()
useHead({ title: 'Crear cuenta · Vitrroo' })
</script>

