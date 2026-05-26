<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f8f8fa] p-4 relative overflow-hidden">
    <div class="absolute -top-40 -right-40 w-96 h-96 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
    <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />

    <div class="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-modal border border-white/50 relative z-10">
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm shadow-brand-500/30">
          <Icon :name="stage === 'mfa' ? 'lucide:shield' : 'lucide:shopping-bag'" class="w-6 h-6 text-white" />
        </div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">
          {{ stage === 'mfa' ? 'Verificación en dos pasos' : 'Bienvenido a Vitrroo' }}
        </h1>
        <p class="text-gray-500 mt-2">
          {{ stage === 'mfa' ? 'Ingresa el código de tu app autenticadora' : 'Inicia sesión para gestionar tu catálogo' }}
        </p>
      </div>

      <form v-if="stage === 'password'" class="space-y-5" @submit.prevent="handleLogin">
        <div v-if="errorMessage" class="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-center gap-2">
          <Icon name="lucide:alert-circle" class="w-4 h-4 flex-shrink-0" />
          {{ errorMessage }}
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Correo electrónico</label>
          <input
            v-model="email"
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
          >
        </div>
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-sm font-semibold text-gray-700">Contraseña</label>
            <NuxtLink to="/forgot-password" class="text-xs font-semibold text-brand-600 hover:text-brand-700">
              ¿Olvidaste tu contraseña?
            </NuxtLink>
          </div>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            enterkeyhint="go"
            class="auth-input"
            placeholder="••••••••"
          >
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-gray-900 text-white font-semibold py-3.5 rounded-xl mt-4 hover:bg-gray-800 transition-colors shadow-md btn-press flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Icon v-if="isLoading" name="lucide:loader-2" class="w-5 h-5 animate-spin" />
          <span v-else>Ingresar</span>
          <Icon v-if="!isLoading" name="lucide:arrow-right" class="w-4 h-4" />
        </button>
      </form>

      <form v-else class="space-y-5" @submit.prevent="handleMfaSubmit">
        <div v-if="errorMessage" class="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-center gap-2">
          <Icon name="lucide:alert-circle" class="w-4 h-4 flex-shrink-0" />
          {{ errorMessage }}
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Código de 6 dígitos</label>
          <input
            v-model="mfaCode"
            type="text"
            required
            inputmode="numeric"
            maxlength="6"
            autocomplete="one-time-code"
            class="auth-input font-mono text-center text-lg tracking-widest"
            placeholder="123456"
          >
        </div>

        <button
          type="submit"
          :disabled="isVerifying || mfaCode.length !== 6"
          class="w-full bg-gray-900 text-white font-semibold py-3.5 rounded-xl mt-2 hover:bg-gray-800 transition-colors shadow-md btn-press flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Icon v-if="isVerifying" name="lucide:loader-2" class="w-5 h-5 animate-spin" />
          <span v-else>Verificar y entrar</span>
        </button>

        <button
          type="button"
          class="w-full text-sm text-gray-500 hover:text-gray-900 transition-colors min-h-10"
          @click="cancelMfa"
        >
          Volver al inicio de sesión
        </button>
      </form>

      <p v-if="stage === 'password'" class="text-center text-sm text-gray-500 mt-8">
        ¿No tienes cuenta?
        <NuxtLink to="/register" class="font-semibold text-brand-600 hover:text-brand-700">Regístrate</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue'

definePageMeta({ layout: false })

const route = useRoute()
const user = useSupabaseUser()
const { login, verifyMfaCode, signOut } = useAuth()

const stage = ref<'password' | 'mfa'>('password')
const email = ref('')
const password = ref('')
const mfaCode = ref('')
const factorId = ref<string | null>(null)
const isLoading = ref(false)
const isVerifying = ref(false)
const errorMessage = ref('')

const safeRedirectDestination = (): string => {
  const next = route.query.next
  if (typeof next === 'string' && next.startsWith('/') && !next.startsWith('//')) {
    return next
  }
  return '/admin'
}

const redirectIfAuthenticated = () => {
  if (user.value && stage.value === 'password') navigateTo(safeRedirectDestination())
}

onMounted(redirectIfAuthenticated)
watchEffect(redirectIfAuthenticated)

const messageForOutcome = (status: string): string => {
  if (status === 'rate-limited') return 'Demasiados intentos. Espera unos minutos.'
  if (status === 'unconfirmed-email') return 'Debes confirmar tu correo electrónico antes de iniciar sesión.'
  if (status === 'invalid-credentials') return 'Correo o contraseña incorrectos.'
  return 'Ocurrió un error al iniciar sesión.'
}

const handleLogin = async () => {
  errorMessage.value = ''
  isLoading.value = true

  const result = await login(email.value.trim(), password.value)
  isLoading.value = false

  if (result.status === 'success') {
    navigateTo(safeRedirectDestination())
    return
  }
  if (result.status === 'mfa-required') {
    factorId.value = result.factorId
    stage.value = 'mfa'
    return
  }
  errorMessage.value = result.status === 'error' ? result.message : messageForOutcome(result.status)
}

const handleMfaSubmit = async () => {
  if (!factorId.value) return
  errorMessage.value = ''
  isVerifying.value = true

  const result = await verifyMfaCode(factorId.value, mfaCode.value)
  isVerifying.value = false

  if (result.status === 'success') {
    navigateTo(safeRedirectDestination())
    return
  }
  errorMessage.value = result.status === 'invalid-code' ? 'Código incorrecto. Inténtalo de nuevo.' : result.message
}

const cancelMfa = async () => {
  await signOut()
  stage.value = 'password'
  mfaCode.value = ''
  factorId.value = null
  errorMessage.value = ''
}

useHead({ title: 'Iniciar Sesión | Vitrroo' })
</script>
