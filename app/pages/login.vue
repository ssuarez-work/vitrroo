<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f8f8fa] p-4 relative overflow-hidden">
    <div class="absolute -top-40 -right-40 w-96 h-96 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
    <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

    <div class="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-modal border border-white/50 relative z-10">
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm shadow-brand-500/30">
          <Icon name="lucide:shopping-bag" class="w-6 h-6 text-white" />
        </div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Bienvenido a Vitrroo</h1>
        <p class="text-gray-500 mt-2">Inicia sesión para gestionar tu catálogo</p>
      </div>

      <form class="space-y-5" @submit.prevent="handleLogin">
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
          />
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
          />
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

      <p class="text-center text-sm text-gray-500 mt-8">
        ¿No tienes cuenta?
        <NuxtLink to="/register" class="font-semibold text-brand-600 hover:text-brand-700">Regístrate</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue'

definePageMeta({ layout: false })

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const redirectIfAuthenticated = () => {
  if (user.value) navigateTo('/admin')
}

onMounted(redirectIfAuthenticated)
watchEffect(redirectIfAuthenticated)

const friendlyError = (raw: string): string => {
  if (raw.includes('Email not confirmed')) {
    return 'Debes confirmar tu correo electrónico antes de iniciar sesión.'
  }
  if (raw.includes('Invalid login credentials')) {
    return 'Correo o contraseña incorrectos.'
  }
  return 'Ocurrió un error al iniciar sesión.'
}

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value.trim(),
    password: password.value
  })

  isLoading.value = false

  if (error) errorMessage.value = friendlyError(error.message)
}

useHead({ title: 'Iniciar Sesión | Vitrroo' })
</script>

