<template>
  <div>
    <header class="mb-6 md:mb-8">
      <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Referidos</h1>
      <p class="text-gray-500 mt-1 text-sm md:text-base">
        Comparte tu código. Por cada vendedor que se registre, ambos reciben 30 días Pro gratis.
      </p>
    </header>

    <div v-if="isLoading" class="space-y-6">
      <Skeleton rounded="2xl" class="h-44 w-full" />
      <div class="grid grid-cols-2 gap-3 md:gap-6">
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>
      <div class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2] p-5 md:p-6 space-y-3">
        <Skeleton class="h-5 w-40" />
        <Skeleton v-for="i in 3" :key="i" class="h-4 w-full" />
      </div>
    </div>

    <template v-else-if="store">
      <section class="bg-gradient-to-br from-brand-500 to-emerald-400 text-white rounded-3xl p-5 md:p-7 mb-6 shadow-xl shadow-brand-500/20">
        <p class="text-xs font-bold uppercase tracking-wider opacity-80 mb-2">Tu código</p>
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <p class="text-3xl md:text-4xl font-extrabold font-mono">{{ referralCode }}</p>
          <button
            class="bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur px-3 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 min-h-10 max-w-max"
            @click="copyCode"
          >
            <Icon name="lucide:copy" class="w-4 h-4" />
            Copiar
          </button>
        </div>
        <div class="flex flex-col sm:flex-row gap-2">
          <button
            class="bg-white text-brand-700 font-bold px-4 py-3 rounded-xl active:bg-gray-100 transition-colors flex items-center justify-center gap-2 min-h-12 flex-1"
            @click="copyLink"
          >
            <Icon name="lucide:link" class="w-4 h-4" />
            Copiar enlace
          </button>
          <button
            class="bg-white/15 hover:bg-white/20 active:bg-white/30 backdrop-blur text-white font-bold px-4 py-3 rounded-xl flex items-center justify-center gap-2 min-h-12 flex-1"
            @click="shareLink"
          >
            <Icon name="lucide:share-2" class="w-4 h-4" />
            Compartir
          </button>
        </div>
      </section>

      <section class="grid grid-cols-2 gap-3 md:gap-6 mb-6">
        <StatCard icon="lucide:users" tone="purple" label="Referidos canjeados" :value="referrals.length" />
        <StatCard icon="lucide:calendar" tone="green" label="Días Pro acumulados" :value="totalProDays" />
      </section>

      <section class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2] p-5 md:p-6">
        <h2 class="text-base md:text-lg font-bold text-gray-900 mb-4">Cómo funciona</h2>
        <ol class="space-y-3 text-sm text-gray-700">
          <li class="flex gap-3">
            <span class="w-6 h-6 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center flex-shrink-0">1</span>
            Comparte tu código o enlace con otros vendedores.
          </li>
          <li class="flex gap-3">
            <span class="w-6 h-6 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center flex-shrink-0">2</span>
            Cuando se registren, ingresan tu código en su pantalla de Plan.
          </li>
          <li class="flex gap-3">
            <span class="w-6 h-6 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center flex-shrink-0">3</span>
            Ambos reciben 30 días Pro gratis al instante. Sin límite de referidos.
          </li>
        </ol>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Referral, Store } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const REFERRAL_REWARD_DAYS = 30

const supabase = useSupabaseClient()
const { getMyStore } = useSupabaseStore()
const toast = useToast()

const isLoading = ref(true)
const store = ref<Store | null>(null)
const referrals = ref<Referral[]>([])

const referralCode = computed(() => (store.value?.referral_code ?? '').toUpperCase())
const referralUrl = computed(() => {
  if (typeof window === 'undefined' || !store.value?.referral_code) return ''
  return `${window.location.origin}/register?ref=${store.value.referral_code}`
})
const totalProDays = computed(() => referrals.value.length * REFERRAL_REWARD_DAYS)

onMounted(async () => {
  store.value = await getMyStore()
  if (store.value) await loadReferrals()
  isLoading.value = false
})

const loadReferrals = async () => {
  if (!store.value) return
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_store_id', store.value.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error cargando referidos:', error)
    return
  }
  referrals.value = (data ?? []) as Referral[]
}

const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

const copyCode = async () => {
  if (!referralCode.value) return
  const ok = await copyToClipboard(referralCode.value)
  ok ? toast.success('Código copiado.') : toast.error('No se pudo copiar.')
}

const copyLink = async () => {
  if (!referralUrl.value) return
  const ok = await copyToClipboard(referralUrl.value)
  ok ? toast.success('Enlace copiado.') : toast.error('No se pudo copiar.')
}

const shareLink = async () => {
  if (!referralUrl.value || !store.value) return
  const shareData = {
    title: 'Vende por WhatsApp con Vitrroo',
    text: 'Te regalo 30 días Pro gratis para tu catálogo de Vitrroo. Únete con mi enlace.',
    url: referralUrl.value
  }
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share(shareData)
      return
    } catch {
      // share cancelado
    }
  }
  await copyLink()
}

useHead({ title: 'Referidos | Admin Vitrroo' })
</script>
