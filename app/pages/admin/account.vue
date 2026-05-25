<template>
  <div>
    <header class="mb-6 md:mb-8">
      <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Mi cuenta</h1>
      <p class="text-gray-500 mt-1 text-sm md:text-base">Información personal, seguridad y privacidad.</p>
    </header>

    <div v-if="isLoading" class="space-y-6">
      <div v-for="i in 3" :key="i" class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2] p-5 md:p-6 space-y-3">
        <Skeleton class="h-5 w-40" />
        <Skeleton class="h-4 w-3/4" />
        <Skeleton rounded="xl" class="h-12 w-44" />
      </div>
    </div>

    <template v-else>
      <section class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2] p-5 md:p-6 mb-6">
        <h2 class="text-base font-bold text-gray-900 mb-3">Datos personales</h2>
        <div class="space-y-2 text-sm">
          <div class="flex items-center justify-between gap-3 py-2 border-b border-[#f0f0f2]">
            <span class="text-gray-500">Correo actual</span>
            <span class="font-medium text-gray-900 truncate">{{ email }}</span>
          </div>
          <div class="flex items-center justify-between gap-3 py-2 border-b border-[#f0f0f2]">
            <span class="text-gray-500">Cuenta creada</span>
            <span class="font-medium text-gray-900">{{ createdAt }}</span>
          </div>
          <div class="flex items-center justify-between gap-3 py-2">
            <span class="text-gray-500">Plan</span>
            <span class="font-medium text-gray-900">{{ planLabel }}</span>
          </div>
        </div>
      </section>

      <section class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2] p-5 md:p-6 mb-6">
        <h2 class="text-base font-bold text-gray-900 mb-2">Cambiar correo</h2>
        <p class="text-sm text-gray-500 mb-4">Te enviaremos un enlace al nuevo correo para confirmar el cambio.</p>
        <form class="flex flex-col sm:flex-row gap-3" @submit.prevent="changeEmail">
          <input
            v-model="newEmail"
            type="email"
            inputmode="email"
            autocomplete="email"
            autocapitalize="none"
            class="form-input flex-1"
            placeholder="nuevo@correo.com"
          />
          <button
            type="submit"
            :disabled="isChangingEmail || !canChangeEmail"
            class="px-5 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 active:bg-gray-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 min-h-12"
          >
            <Icon v-if="isChangingEmail" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            Enviar enlace
          </button>
        </form>
      </section>

      <section class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2] p-5 md:p-6 mb-6">
        <h2 class="text-base font-bold text-gray-900 mb-3">Cambiar contraseña</h2>
        <p class="text-sm text-gray-500 mb-4">Te enviaremos un enlace a tu correo para cambiarla.</p>
        <button
          type="button"
          :disabled="isSendingReset"
          class="px-5 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 active:bg-gray-700 transition-colors disabled:opacity-60 flex items-center gap-2 min-h-12"
          @click="sendReset"
        >
          <Icon v-if="isSendingReset" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          <Icon v-else name="lucide:mail" class="w-4 h-4" />
          Enviar enlace
        </button>
      </section>

      <section class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2] p-5 md:p-6 mb-6">
        <div class="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2 class="text-base font-bold text-gray-900">Verificación en dos pasos</h2>
            <p class="text-sm text-gray-500 mt-1">Pide un código de tu app autenticadora al iniciar sesión.</p>
          </div>
          <span
            v-if="hasActiveTotp"
            class="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full flex items-center gap-1"
          >
            <Icon name="lucide:shield-check" class="w-3 h-3" />
            Activa
          </span>
        </div>

        <button
          v-if="!hasActiveTotp && !enrollment"
          type="button"
          :disabled="isEnrolling"
          class="px-5 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 active:bg-gray-700 transition-colors disabled:opacity-60 flex items-center gap-2 min-h-12"
          @click="startEnrollment"
        >
          <Icon v-if="isEnrolling" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          <Icon v-else name="lucide:shield" class="w-4 h-4" />
          Activar 2FA
        </button>

        <div v-if="enrollment" class="space-y-4">
          <div class="bg-gray-50 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 border border-[#f0f0f2]">
            <div class="bg-white p-3 rounded-xl border border-[#f0f0f2]">
              <img :src="enrollment.qrCode" alt="QR para 2FA" class="w-40 h-40" />
            </div>
            <div class="flex-1 text-sm text-gray-700 space-y-2">
              <p>1. Abre tu app autenticadora (Google Authenticator, 1Password, Authy...).</p>
              <p>2. Escanea el QR o ingresa el código manualmente:</p>
              <code class="block bg-white px-3 py-2 rounded-lg border border-[#f0f0f2] font-mono text-xs break-all">{{ enrollment.secret }}</code>
            </div>
          </div>

          <form class="flex flex-col sm:flex-row gap-3" @submit.prevent="confirmEnrollment">
            <input
              v-model="totpCode"
              type="text"
              inputmode="numeric"
              maxlength="6"
              autocomplete="one-time-code"
              class="form-input flex-1 font-mono text-center text-lg tracking-widest"
              placeholder="123456"
            />
            <div class="flex gap-2">
              <button
                type="button"
                class="px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors min-h-12"
                @click="cancelEnrollment"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isVerifying || totpCode.length !== 6"
                class="flex-1 px-4 py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 active:bg-brand-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 min-h-12"
              >
                <Icon v-if="isVerifying" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
                Confirmar
              </button>
            </div>
          </form>
        </div>

        <button
          v-if="hasActiveTotp && !enrollment"
          type="button"
          :disabled="isDisabling"
          class="px-4 py-2.5 rounded-xl bg-red-50 text-red-700 font-semibold hover:bg-red-100 active:bg-red-200 transition-colors disabled:opacity-60 flex items-center gap-2 min-h-11"
          @click="disable2fa"
        >
          <Icon v-if="isDisabling" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          Desactivar 2FA
        </button>
      </section>

      <section class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-red-100 p-5 md:p-6">
        <h2 class="text-base font-bold text-red-700 mb-2">Zona de peligro</h2>
        <p class="text-sm text-gray-600 mb-4">
          Eliminar tu cuenta borra permanentemente tu tienda, productos, imágenes y estadísticas. No se puede deshacer.
        </p>

        <button
          v-if="!isConfirming"
          type="button"
          class="px-5 py-3 rounded-xl bg-red-50 text-red-700 font-semibold hover:bg-red-100 active:bg-red-200 transition-colors min-h-12"
          @click="isConfirming = true"
        >
          Eliminar mi cuenta
        </button>

        <div v-else class="space-y-3">
          <p class="text-sm font-semibold text-gray-900">
            Escribe <span class="font-mono bg-gray-100 px-1.5 py-0.5 rounded">ELIMINAR</span> para confirmar:
          </p>
          <input
            v-model="confirmText"
            type="text"
            autocapitalize="characters"
            class="form-input uppercase font-mono"
            placeholder="ELIMINAR"
          />
          <div class="flex gap-3">
            <button
              type="button"
              class="flex-1 px-5 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors min-h-12"
              @click="cancelDelete"
            >
              Cancelar
            </button>
            <button
              type="button"
              :disabled="!canDelete || isDeleting"
              class="flex-1 px-5 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 active:bg-red-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 min-h-12"
              @click="confirmDelete"
            >
              <Icon v-if="isDeleting" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
              Eliminar ahora
            </button>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Store } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const CONFIRM_WORD = 'ELIMINAR'

interface TotpFactor {
  id: string
  status: string
}

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { getMyStore } = useSupabaseStore()
const { requestEmailChange, listFactors, enrollTotp, verifyTotp, unenrollFactor } = useAccountSecurity()
const toast = useToast()

const isLoading = ref(true)
const store = ref<Store | null>(null)
const isSendingReset = ref(false)
const isConfirming = ref(false)
const confirmText = ref('')
const isDeleting = ref(false)

const newEmail = ref('')
const isChangingEmail = ref(false)

const totpFactors = ref<TotpFactor[]>([])
const enrollment = ref<{ factorId: string; qrCode: string; secret: string } | null>(null)
const totpCode = ref('')
const isEnrolling = ref(false)
const isVerifying = ref(false)
const isDisabling = ref(false)

const { isPro, isOnTrial } = usePlanLimits(store)

const email = computed(() => user.value?.email ?? '—')
const createdAt = computed(() => {
  if (!user.value?.created_at) return '—'
  return new Date(user.value.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
})

const planLabel = computed(() => {
  if (isPro.value && store.value?.plan === 'pro') return 'Vitrroo Pro'
  if (isOnTrial.value) return 'Trial de Pro'
  return 'Vitrroo Free'
})

const canChangeEmail = computed(() => {
  const value = newEmail.value.trim().toLowerCase()
  if (!value || !value.includes('@')) return false
  return value !== user.value?.email?.toLowerCase()
})

const hasActiveTotp = computed(() => totpFactors.value.some((factor) => factor.status === 'verified'))
const canDelete = computed(() => confirmText.value.trim().toUpperCase() === CONFIRM_WORD)

const refreshFactors = async () => {
  const { totp } = await listFactors()
  totpFactors.value = totp as TotpFactor[]
}

onMounted(async () => {
  store.value = await getMyStore()
  await refreshFactors()
  isLoading.value = false
})

const sendReset = async () => {
  if (!user.value?.email) return
  isSendingReset.value = true
  const redirectTo = `${window.location.origin}/reset-password`
  const { error } = await supabase.auth.resetPasswordForEmail(user.value.email, { redirectTo })
  isSendingReset.value = false

  if (error) {
    toast.error('No pudimos enviar el correo. Intenta más tarde.')
    return
  }
  toast.success('Revisa tu correo para cambiar tu contraseña.')
}

const changeEmail = async () => {
  if (!canChangeEmail.value) return
  isChangingEmail.value = true
  const { ok, error } = await requestEmailChange(newEmail.value)
  isChangingEmail.value = false
  if (!ok) {
    toast.error(error ?? 'No pudimos enviar el cambio.')
    return
  }
  toast.success('Te enviamos un enlace al nuevo correo. Confírmalo para aplicar el cambio.')
  newEmail.value = ''
}

const startEnrollment = async () => {
  isEnrolling.value = true
  const { data, error } = await enrollTotp()
  isEnrolling.value = false
  if (!data) {
    toast.error(error ?? 'No pudimos iniciar el enrolamiento.')
    return
  }
  enrollment.value = data
  totpCode.value = ''
}

const confirmEnrollment = async () => {
  if (!enrollment.value) return
  isVerifying.value = true
  const { ok, error } = await verifyTotp({ factorId: enrollment.value.factorId, code: totpCode.value })
  isVerifying.value = false
  if (!ok) {
    toast.error(error ?? 'Código incorrecto.')
    return
  }
  enrollment.value = null
  totpCode.value = ''
  await refreshFactors()
  toast.success('Verificación en dos pasos activada.')
}

const cancelEnrollment = async () => {
  if (enrollment.value) {
    await unenrollFactor(enrollment.value.factorId)
  }
  enrollment.value = null
  totpCode.value = ''
}

const disable2fa = async () => {
  if (!window.confirm('¿Desactivar la verificación en dos pasos?')) return
  isDisabling.value = true
  for (const factor of totpFactors.value) {
    await unenrollFactor(factor.id)
  }
  isDisabling.value = false
  await refreshFactors()
  toast.success('2FA desactivada.')
}

const cancelDelete = () => {
  isConfirming.value = false
  confirmText.value = ''
}

const confirmDelete = async () => {
  if (!canDelete.value) return
  isDeleting.value = true
  try {
    await $fetch('/api/user/delete', { method: 'POST' })
    toast.success('Tu cuenta fue eliminada.')
    await supabase.auth.signOut()
    navigateTo('/')
  } catch {
    toast.error('No pudimos eliminar tu cuenta. Contacta soporte.')
    isDeleting.value = false
  }
}

useHead({ title: 'Mi cuenta | Admin Vitrroo' })
</script>
