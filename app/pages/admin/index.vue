<template>
  <SkeletonDashboard v-if="isLoading" />

  <div v-else-if="store">
    <header class="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Hola, {{ store.name }}</h1>
        <p class="text-gray-500 mt-1 text-sm md:text-base">Resumen de los últimos {{ periodLabel }}.</p>
      </div>
      <div class="flex gap-1.5 bg-white border border-[#f0f0f2] rounded-xl p-1">
        <button
          v-for="option in periodOptions"
          :key="option.days"
          type="button"
          :disabled="!option.allowed"
          :class="periodButtonClasses(option)"
          @click="selectPeriod(option.days)"
        >
          {{ option.label }}
          <Icon v-if="!option.allowed" name="lucide:lock" class="w-3 h-3 inline-block ml-1" />
        </button>
      </div>
    </header>

    <TrialBadge v-if="isOnTrial" class="mb-5" :days="trialDays" />

    <OnboardingChecklist
      v-if="!isOnboardingDismissed"
      class="mb-5"
      :store="store"
      :products="products"
      :has-shared-once="hasSharedOnce"
      @dismiss="dismissOnboarding"
    />

    <section class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2] overflow-hidden mb-5">
      <div class="p-5 md:p-6 border-b border-[#f0f0f2] flex items-center justify-between gap-3">
        <h2 class="text-base md:text-lg font-bold text-gray-900">Tu tienda en vivo</h2>
        <NuxtLink
          :to="`/${store.slug}`"
          target="_blank"
          class="text-sm font-semibold text-brand-600 flex items-center gap-1 bg-brand-50 active:bg-brand-100 px-3 py-2 rounded-lg transition-colors min-h-10"
        >
          Ver
          <Icon name="lucide:external-link" class="w-4 h-4" />
        </NuxtLink>
      </div>

      <div class="p-5 md:p-6 space-y-3">
        <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
          <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 flex-shrink-0">
            <Icon name="lucide:link" class="w-5 h-5 text-gray-400" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-gray-500">Tu catálogo</p>
            <p class="font-medium text-gray-900 truncate text-sm">{{ storeUrl }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <button
            class="px-4 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 active:bg-gray-700 transition-colors btn-press flex items-center justify-center gap-2 min-h-12"
            @click="copyLink"
          >
            <Icon name="lucide:copy" class="w-4 h-4" />
            Copiar
          </button>
          <button
            class="px-4 py-3 bg-wa text-white text-sm font-semibold rounded-xl hover:bg-wa-dark active:bg-wa-dark transition-colors btn-press flex items-center justify-center gap-2 min-h-12"
            @click="shareLink"
          >
            <Icon name="lucide:share-2" class="w-4 h-4" />
            Compartir
          </button>
        </div>
      </div>
    </section>

    <div class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-5 md:mb-6">
      <StatCard icon="bi:whatsapp" tone="green" label="Clics WhatsApp" :value="stats.whatsapp_clicks" />
      <StatCard icon="lucide:eye" tone="blue" label="Visitas" :value="stats.visits" />
      <StatCard
        class="col-span-2 md:col-span-1"
        icon="lucide:package"
        tone="purple"
        label="Productos Activos"
        :value="activeProducts"
        link-to="/admin/products"
        link-label="Gestionar catálogo"
      />
    </div>

    <section class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2] p-5 md:p-6 mb-5">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base md:text-lg font-bold text-gray-900">Tendencia diaria</h2>
        <span class="text-xs font-semibold text-gray-500">Conversión {{ conversionRate }}%</span>
      </div>
      <AnalyticsSparkline :values="visitSeries" />
      <div class="grid grid-cols-2 gap-4 mt-4 text-xs">
        <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-brand-500"></span>Visitas por día</div>
        <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-gray-300"></span>Clics WhatsApp por día</div>
      </div>
      <AnalyticsSparkline class="mt-2" :values="clickSeries" color="rgb(156 163 175)" />
    </section>

    <ProFeatureBlock
      title="Top productos y exportación"
      :unlocked="limits.canSeeTopProducts"
    >
      <div v-if="topProducts.length === 0" class="text-center py-6 text-sm text-gray-500">
        Aún no hay clics de WhatsApp en este período.
      </div>
      <ul v-else class="space-y-3">
        <li
          v-for="(top, index) in topProducts"
          :key="top.product_id"
          class="flex items-center gap-3"
        >
          <div class="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
            {{ index + 1 }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-900 truncate">{{ top.product_name }}</p>
          </div>
          <span class="text-sm font-bold text-brand-600">{{ top.whatsapp_clicks }}</span>
        </li>
      </ul>

      <button
        v-if="limits.canExportAnalytics"
        type="button"
        class="mt-5 w-full px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-900 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        @click="downloadCsv"
      >
        <Icon name="lucide:download" class="w-4 h-4" />
        Exportar CSV
      </button>
    </ProFeatureBlock>
  </div>

  <div v-else class="max-w-md mx-auto text-center py-20">
    <div class="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-5">
      <Icon name="lucide:store" class="w-8 h-8" />
    </div>
    <h2 class="text-xl font-bold text-gray-900">Falta configurar tu tienda</h2>
    <p class="text-gray-500 mt-2 mb-6">
      Crea tu catálogo y empieza a recibir pedidos por WhatsApp en minutos.
    </p>
    <button
      type="button"
      :disabled="isCreatingStore"
      class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 active:bg-brand-700 transition-colors shadow-md min-h-12 disabled:opacity-60"
      @click="createStore"
    >
      <Icon v-if="isCreatingStore" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
      <Icon v-else name="lucide:plus" class="w-4 h-4" />
      Crear mi tienda
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { AnalyticsBucket, Product, Store, StoreStats, TopProduct } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'auth' })

interface PeriodOption {
  days: number
  label: string
  allowed: boolean
}

const { getMyStore, getMyProducts } = useSupabaseStore()
const { getStats, getDailyBuckets, getTopProducts } = useAnalytics()
const toast = useToast()

const ONBOARDING_DISMISSED_KEY = 'vitrroo-onboarding-dismissed'
const SHARED_ONCE_KEY = 'vitrroo-shared-once'

const isLoading = ref(true)
const store = ref<Store | null>(null)
const products = ref<Product[]>([])
const stats = ref<StoreStats>({ visits: 0, whatsapp_clicks: 0 })
const buckets = ref<AnalyticsBucket[]>([])
const topProducts = ref<TopProduct[]>([])
const host = ref('')
const selectedDays = ref(30)
const isOnboardingDismissed = ref(false)
const hasSharedOnce = ref(false)
const isCreatingStore = ref(false)

const createStore = async () => {
  if (isCreatingStore.value) return
  isCreatingStore.value = true
  try {
    await $fetch('/api/user/create-store', { method: 'POST' })
    if (typeof window !== 'undefined') window.location.reload()
  } catch {
    toast.error('No pudimos crear tu tienda. Intenta de nuevo.')
    isCreatingStore.value = false
  }
}

const { limits, isOnTrial, trialDays } = usePlanLimits(store)

const periodOptions = computed<PeriodOption[]>(() => {
  const cap = limits.value.analyticsDays === 'unlimited' ? Infinity : limits.value.analyticsDays
  return [
    { days: 30, label: '30 días', allowed: cap >= 30 },
    { days: 90, label: '90 días', allowed: cap >= 90 },
    { days: 365, label: '12 meses', allowed: cap >= 365 }
  ]
})

const periodLabel = computed(() => {
  const found = periodOptions.value.find((option) => option.days === selectedDays.value)
  return found?.label ?? `${selectedDays.value} días`
})

const activeProducts = computed(() => products.value.filter((p) => p.is_active).length)
const storeUrl = computed(() => (store.value ? `${host.value}/${store.value.slug}` : ''))

const sortedBuckets = computed(() =>
  [...buckets.value].sort((a, b) => a.bucket.localeCompare(b.bucket))
)

const visitSeries = computed(() => sortedBuckets.value.map((bucket) => bucket.visits))
const clickSeries = computed(() => sortedBuckets.value.map((bucket) => bucket.whatsapp_clicks))

const conversionRate = computed(() => {
  if (stats.value.visits === 0) return '0'
  return ((stats.value.whatsapp_clicks / stats.value.visits) * 100).toFixed(1)
})

const periodButtonClasses = (option: PeriodOption): string => {
  const base = 'px-3 py-2 text-xs font-bold rounded-lg transition-colors disabled:cursor-not-allowed'
  if (!option.allowed) return `${base} text-gray-400`
  if (option.days === selectedDays.value) return `${base} bg-gray-900 text-white`
  return `${base} text-gray-600 active:bg-gray-100`
}

const loadAnalytics = async () => {
  if (!store.value) return
  const [statResult, bucketResult, topResult] = await Promise.all([
    getStats(store.value.id, selectedDays.value),
    getDailyBuckets(store.value.id, selectedDays.value),
    limits.value.canSeeTopProducts ? getTopProducts(store.value.id, selectedDays.value, 5) : Promise.resolve<TopProduct[]>([])
  ])
  stats.value = statResult
  buckets.value = bucketResult
  topProducts.value = topResult
}

onMounted(async () => {
  host.value = window.location.origin
  isOnboardingDismissed.value = localStorage.getItem(ONBOARDING_DISMISSED_KEY) === 'true'
  hasSharedOnce.value = localStorage.getItem(SHARED_ONCE_KEY) === 'true'

  store.value = await getMyStore()

  if (store.value) {
    products.value = await getMyProducts(store.value.id)
    await loadAnalytics()
  }

  isLoading.value = false
})

const dismissOnboarding = () => {
  isOnboardingDismissed.value = true
  localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true')
}

const markAsShared = () => {
  hasSharedOnce.value = true
  localStorage.setItem(SHARED_ONCE_KEY, 'true')
}

const selectPeriod = (days: number) => {
  const option = periodOptions.value.find((opt) => opt.days === days)
  if (!option) return
  if (!option.allowed) {
    toast.error('Periodos largos requieren el plan Pro.')
    return
  }
  selectedDays.value = days
}

watch(selectedDays, loadAnalytics)

const copyLink = async () => {
  if (!storeUrl.value) return
  try {
    await navigator.clipboard.writeText(storeUrl.value)
    toast.success('Enlace copiado al portapapeles.')
    markAsShared()
  } catch {
    toast.error('No se pudo copiar el enlace.')
  }
}

const shareLink = async () => {
  if (!storeUrl.value || !store.value) return
  const shareData = {
    title: store.value.name,
    text: `Visita mi catálogo en Vitrroo: ${store.value.name}`,
    url: storeUrl.value
  }

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share(shareData)
      markAsShared()
      return
    } catch {
      // share dialog cancelado
    }
  }
  await copyLink()
}

const downloadCsv = () => {
  if (!limits.value.canExportAnalytics) return
  const rows = [['Fecha', 'Visitas', 'Clics WhatsApp']]
  for (const bucket of sortedBuckets.value) {
    rows.push([bucket.bucket, String(bucket.visits), String(bucket.whatsapp_clicks)])
  }
  const csv = rows.map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `vitrroo-${store.value?.slug ?? 'analytics'}-${selectedDays.value}d.csv`
  link.click()
  URL.revokeObjectURL(url)
}

useHead({ title: 'Dashboard | Admin Vitrroo' })
</script>
