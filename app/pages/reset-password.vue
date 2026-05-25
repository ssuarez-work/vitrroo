<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f8f8fa] p-4 relative overflow-hidden">
    <div class="absolute -top-40 -right-40 w-96 h-96 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
    <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

    <div class="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-modal border border-white/50 relative z-10">
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm shadow-brand-500/30">
          <Icon name="lucide:lock" class="w-6 h-6 text-white" />
        </div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Nueva contraseña</h1>
        <p class="text-gray-500 mt-2">Crea una contraseña nueva para tu cuenta.</p>
      </div>

      <div v-if="!canReset" class="p-4 bg-red-50 text-red-700 text-sm font-medium rounded-2xl border border-red-100 text-center">
        El enlace de recuperación no es válido o ya expiró. Solicita uno nuevo.
        <NuxtLink to="/forgot-password" class="underline block mt-2">Volver a intentar</NuxtLink>
      </div>

      <form v-else class="space-y-5" @submit.prevent="updatePassword">
        <div v-if="errorMessage" class="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-center gap-2">
          <Icon name="lucide:alert-circle" class="w-4 h-4 flex-shrink-0" />
          {{ errorMessage }}
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Nueva contraseña</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="8"
            autocomplete="new-password"
            enterkeyhint="next"
            class="auth-input"
            placeholder="Mínimo 8 caracteres"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Confirma la contraseña</label>
          <input
            v-model="confirm"
            type="password"
            required
            minlength="8"
            autocomplete="new-password"
            enterkeyhint="go"
            class="auth-input"
            placeholder="Repítela"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-gray-900 text-white font-semibold py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-md btn-press flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Icon v-if="isLoading" name="lucide:loader-2" class="w-5 h-5 animate-spin" />
          <span v-else>Actualizar contraseña</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

definePageMeta({ layout: false })

const MIN_PASSWORD_LENGTH = 8

const supabase = useSupabaseClient()
const toast = useToast()

const password = ref('')
const confirm = ref('')
const isLoading = ref(false)
const canReset = ref(false)
const errorMessage = ref('')

onMounted(() => {
  const { data } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') canReset.value = true
  })

  supabase.auth.getSession().then(({ data: sessionData }) => {
    if (sessionData.session) canReset.value = true
  })

  onUnmounted(() => data.subscription.unsubscribe())
})

const updatePassword = async () => {
  errorMessage.value = ''

  if (password.value.length < MIN_PASSWORD_LENGTH) {
    errorMessage.value = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
    return
  }
  if (password.value !== confirm.value) {
    errorMessage.value = 'Las contraseñas no coinciden.'
    return
  }

  isLoading.value = true
  const { error } = await supabase.auth.updateUser({ password: password.value })
  isLoading.value = false

  if (error) {
    errorMessage.value = 'No pudimos actualizar tu contraseña. Solicita un enlace nuevo.'
    return
  }

  toast.success('Contraseña actualizada. Inicia sesión con tus nuevas credenciales.')
  await supabase.auth.signOut()
  navigateTo('/login')
}

useHead({ title: 'Nueva contraseña | Vitrroo' })
</script>

