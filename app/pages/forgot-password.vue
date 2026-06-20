<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f8f8fa] p-4 relative overflow-hidden">
    <div class="absolute -top-40 -right-40 w-96 h-96 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
    <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

    <div class="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-modal border border-white/50 relative z-10">
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm shadow-brand-500/30">
          <Icon name="lucide:key-round" class="w-6 h-6 text-white" />
        </div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Recupera tu acceso</h1>
        <p class="text-gray-500 mt-2">Te enviaremos un enlace para crear una nueva contraseña.</p>
      </div>

      <div v-if="hasSent" class="p-4 bg-brand-50 text-brand-700 text-sm font-medium rounded-2xl border border-brand-100 text-center">
        Si el correo existe, recibirás un enlace en breve. Revisa tu bandeja de entrada o spam.
      </div>

      <form v-else class="space-y-5" @submit.prevent="sendReset">
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
            enterkeyhint="send"
            class="auth-input"
            placeholder="tu@correo.com"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-gray-900 text-white font-semibold py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-md btn-press flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Icon v-if="isLoading" name="lucide:loader-2" class="w-5 h-5 animate-spin" />
          <span v-else>Enviar enlace</span>
        </button>
      </form>

      <p class="text-center text-sm text-gray-500 mt-8">
        ¿Recordaste tu contraseña?
        <NuxtLink to="/login" class="font-semibold text-brand-600 hover:text-brand-700">Inicia sesión</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({ layout: false })

const supabase = useSupabaseClient()

const email = ref('')
const isLoading = ref(false)
const hasSent = ref(false)
const errorMessage = ref('')

const sendReset = async () => {
  isLoading.value = true
  errorMessage.value = ''

  const redirectTo = `${window.location.origin}/reset-password`

  const { error } = await supabase.auth.resetPasswordForEmail(email.value.trim(), { redirectTo })

  isLoading.value = false

  if (error) {
    errorMessage.value = 'No pudimos enviar el correo. Intenta de nuevo más tarde.'
    return
  }
  hasSent.value = true
}

useNoIndex()
useHead({ title: 'Recuperar contraseña · Vitrroo' })
</script>

