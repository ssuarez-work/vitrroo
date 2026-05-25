<template>
  <div>
    <header class="mb-6 md:mb-8">
      <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Plan y facturación</h1>
      <p class="text-gray-500 mt-1 text-sm md:text-base">Empieza gratis y crece con Pro cuando lo necesites.</p>
    </header>

    <div v-if="isLoading" class="space-y-6">
      <div class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2] p-5 md:p-6">
        <div class="flex items-start gap-4">
          <Skeleton rounded="2xl" class="w-12 h-12 flex-shrink-0" />
          <div class="flex-1 space-y-2">
            <Skeleton class="h-3 w-20" />
            <Skeleton class="h-6 w-40" />
            <Skeleton class="h-3 w-56" />
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div v-for="i in 2" :key="i" class="rounded-3xl p-6 md:p-8 border border-[#f0f0f2] bg-white space-y-4">
          <Skeleton class="h-5 w-28" />
          <Skeleton class="h-3 w-48" />
          <Skeleton class="h-10 w-32" />
          <Skeleton rounded="2xl" class="h-12 w-full" />
        </div>
      </div>
      <div class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2] p-5 md:p-6 space-y-3">
        <Skeleton class="h-5 w-48" />
        <Skeleton v-for="i in 4" :key="i" class="h-4 w-3/4" />
      </div>
    </div>

    <template v-else-if="store">
      <section class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2] p-5 md:p-6 mb-6">
        <div class="flex items-start gap-4">
          <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0', currentPlanIconBg]">
            <Icon :name="currentPlanIcon" class="w-6 h-6" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan actual</p>
            <h2 class="text-lg md:text-xl font-bold text-gray-900">{{ currentPlanLabel }}</h2>
            <p class="text-sm text-gray-500 mt-1">{{ currentPlanSubline }}</p>
          </div>
          <button
            v-if="isPro && store.stripe_subscription_id"
            type="button"
            :disabled="isOpeningPortal"
            class="px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1.5 min-h-10"
            @click="openCustomerPortal"
          >
            <Icon v-if="isOpeningPortal" name="lucide:loader-2" class="w-3.5 h-3.5 animate-spin" />
            <Icon v-else name="lucide:settings" class="w-3.5 h-3.5" />
            Gestionar
          </button>
        </div>
      </section>

      <section v-if="!isPro || isTrialOnly" class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
        <article
          v-for="option in checkoutOptions"
          :key="option.interval"
          :class="['rounded-3xl p-6 md:p-8 border', option.highlight ? 'bg-gray-900 text-white border-gray-800' : 'bg-white text-gray-900 border-[#f0f0f2]']"
        >
          <div v-if="option.highlight" class="inline-flex items-center px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 text-[10px] font-bold mb-3 uppercase tracking-wider">
            Mejor valor
          </div>
          <h3 class="text-lg font-bold mb-1">{{ option.title }}</h3>
          <p :class="option.highlight ? 'text-gray-400' : 'text-gray-500'" class="text-sm mb-5">{{ option.subtitle }}</p>
          <div class="mb-6">
            <span class="text-3xl md:text-4xl font-extrabold">${{ option.amount }}</span>
            <span :class="option.highlight ? 'text-gray-400' : 'text-gray-500'" class="text-sm font-medium ml-1">{{ option.suffix }}</span>
          </div>
          <button
            type="button"
            :disabled="isCheckingOut === option.interval"
            :class="[
              'w-full py-3.5 rounded-2xl font-bold transition-colors flex items-center justify-center gap-2 min-h-12 disabled:opacity-70',
              option.highlight ? 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-lg shadow-brand-500/30' : 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700'
            ]"
            @click="startCheckout(option.interval)"
          >
            <Icon v-if="isCheckingOut === option.interval" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            {{ option.cta }}
          </button>
        </article>
      </section>

      <section class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2] p-5 md:p-6 mb-6">
        <h3 class="text-base md:text-lg font-bold text-gray-900 mb-4">¿Qué incluye Pro?</h3>
        <ul class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
          <li
            v-for="benefit in proBenefits"
            :key="benefit"
            class="flex items-start gap-2 text-sm text-gray-700"
          >
            <Icon name="lucide:check-circle-2" class="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
            <span>{{ benefit }}</span>
          </li>
        </ul>
      </section>

      <section class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2] p-5 md:p-6">
        <h3 class="text-base md:text-lg font-bold text-gray-900 mb-2">Aplicar código de referido</h3>
        <p class="text-sm text-gray-500 mb-4">Si alguien te invitó a Vitrroo, ingresa su código y ambos obtendrán 30 días Pro gratis.</p>
        <form class="flex flex-col sm:flex-row gap-3" @submit.prevent="redeemReferralCode">
          <input
            v-model="referralInput"
            type="text"
            maxlength="32"
            autocapitalize="none"
            autocomplete="off"
            spellcheck="false"
            class="form-input flex-1 font-mono"
            placeholder="Ingresa el código"
          />
          <button
            type="submit"
            :disabled="isRedeeming || referralInput.trim().length === 0"
            class="px-5 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 active:bg-gray-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 min-h-12"
          >
            <Icon v-if="isRedeeming" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            Aplicar
          </button>
        </form>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Store } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'auth' })

type CheckoutInterval = 'monthly' | 'annual'

interface CheckoutOption {
  interval: CheckoutInterval
  title: string
  subtitle: string
  amount: string
  suffix: string
  cta: string
  highlight: boolean
}

const proBenefits = [
  'Productos ilimitados',
  'Hasta 5 imágenes por producto',
  'Categorías y variantes con stock ilimitadas',
  'Mensaje de WhatsApp personalizable',
  'Productos destacados (hasta 3)',
  'Color de marca en tu catálogo',
  'Analytics de 12 meses con embudo',
  'Top productos y exportación CSV',
  'Sin "Hecho con Vitrroo" en el catálogo',
  'Soporte prioritario por WhatsApp'
]

const supabase = useSupabaseClient()
const { getMyStore } = useSupabaseStore()
const toast = useToast()

const isLoading = ref(true)
const store = ref<Store | null>(null)
const isCheckingOut = ref<CheckoutInterval | null>(null)
const isOpeningPortal = ref(false)
const referralInput = ref('')
const isRedeeming = ref(false)

const { isPro, isOnTrial, trialDays } = usePlanLimits(store)

const isTrialOnly = computed(() => store.value?.plan === 'free' && isOnTrial.value)

const currentPlanLabel = computed(() => {
  if (isPro.value && store.value?.plan === 'pro') return 'Vitrroo Pro'
  if (isOnTrial.value) return 'Trial de Pro'
  return 'Vitrroo Free'
})

const currentPlanSubline = computed(() => {
  if (!store.value) return ''
  if (isOnTrial.value) {
    const word = trialDays.value === 1 ? 'día' : 'días'
    return `Te quedan ${trialDays.value} ${word} del trial gratis.`
  }
  if (store.value.plan === 'pro') {
    if (store.value.pro_until) {
      const date = new Date(store.value.pro_until).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
      return `Tu plan se renueva el ${date}.`
    }
    return 'Plan activo. ¡Gracias por usar Vitrroo!'
  }
  if (store.value.pro_until && new Date(store.value.pro_until) > new Date()) {
    const date = new Date(store.value.pro_until).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
    return `Beneficios Pro activos hasta el ${date} (vía referidos).`
  }
  return 'Hasta 15 productos, sin acceso a funciones Pro.'
})

const currentPlanIcon = computed(() => (isPro.value ? 'lucide:sparkles' : 'lucide:gift'))
const currentPlanIconBg = computed(() => (isPro.value ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'))

const checkoutOptions: CheckoutOption[] = [
  {
    interval: 'monthly',
    title: 'Pro Mensual',
    subtitle: 'Sin compromiso. Cancela cuando quieras.',
    amount: '149',
    suffix: 'MXN / mes',
    cta: 'Pasar a Pro',
    highlight: false
  },
  {
    interval: 'annual',
    title: 'Pro Anual',
    subtitle: 'Ahorra 28% pagando el año completo.',
    amount: '1,290',
    suffix: 'MXN / año',
    cta: 'Elegir anual',
    highlight: true
  }
]

onMounted(async () => {
  store.value = await getMyStore()
  isLoading.value = false

  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    if (params.get('checkout') === 'success') {
      toast.success('¡Bienvenido a Pro! Estamos actualizando tu plan.')
      const url = new URL(window.location.href)
      url.searchParams.delete('checkout')
      window.history.replaceState({}, '', url.toString())
    }
    if (params.get('checkout') === 'cancelled') {
      toast.info('Cancelaste el proceso. Puedes intentarlo de nuevo cuando quieras.')
      const url = new URL(window.location.href)
      url.searchParams.delete('checkout')
      window.history.replaceState({}, '', url.toString())
    }
  }
})

const startCheckout = async (interval: CheckoutInterval) => {
  if (!store.value) return
  isCheckingOut.value = interval

  try {
    const response = await $fetch<{ url: string }>('/api/billing/checkout', {
      method: 'POST',
      body: { interval }
    })
    if (response?.url) {
      window.location.href = response.url
      return
    }
    throw new Error('Sin URL de checkout')
  } catch (error) {
    console.error(error)
    toast.error('No pudimos iniciar el pago. Intenta de nuevo en un momento.')
  } finally {
    isCheckingOut.value = null
  }
}

const openCustomerPortal = async () => {
  isOpeningPortal.value = true
  try {
    const response = await $fetch<{ url: string }>('/api/billing/portal', { method: 'POST' })
    if (response?.url) {
      window.location.href = response.url
      return
    }
    throw new Error('Sin URL de portal')
  } catch (error) {
    console.error(error)
    toast.error('No pudimos abrir el portal de cliente.')
  } finally {
    isOpeningPortal.value = false
  }
}

const redeemReferralCode = async () => {
  if (!store.value) return
  const code = referralInput.value.trim().toLowerCase()
  if (!code) return

  isRedeeming.value = true
  const { data, error } = await supabase.rpc('redeem_referral', {
    p_code: code,
    p_referred_store_id: store.value.id
  })
  isRedeeming.value = false

  if (error || data !== true) {
    toast.error('Código inválido o ya canjeado.')
    return
  }
  toast.success('¡Listo! Recibiste 30 días Pro gratis.')
  referralInput.value = ''
  store.value = await getMyStore()
}

useHead({ title: 'Plan | Admin Vitrroo' })
</script>

