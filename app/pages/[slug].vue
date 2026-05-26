<template>
  <SkeletonStorefront v-if="pending" />

  <div v-else-if="!data" class="flex flex-col items-center justify-center py-32 px-6 text-center">
    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <Icon name="lucide:store" class="w-8 h-8 text-gray-400" />
    </div>
    <h1 class="text-xl font-bold text-gray-900">Tienda no encontrada</h1>
    <p class="text-gray-500 mt-2 max-w-xs">El enlace que abriste no corresponde a ninguna tienda activa en Vitrroo.</p>
    <NuxtLink to="/" class="mt-6 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors">
      Ir al inicio
    </NuxtLink>
  </div>

  <div v-else-if="!data.store.is_published" class="flex flex-col items-center justify-center py-32 px-6 text-center">
    <div class="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
      <Icon name="lucide:pause" class="w-8 h-8 text-yellow-500" />
    </div>
    <h1 class="text-xl font-bold text-gray-900">Tienda en pausa</h1>
    <p class="text-gray-500 mt-2 max-w-xs">{{ data.store.name }} no está recibiendo pedidos por el momento. Vuelve pronto.</p>
    <NuxtLink to="/" class="mt-6 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors">
      Ir al inicio
    </NuxtLink>
  </div>

  <div v-else :class="['pb-10', densityClass, bodyFontClass]" :style="bodyStyle">
    <StorefrontHeader :store="data.store" :variant="theme.headerVariant" />

    <nav v-if="categoryFilters.length > 1" class="px-5 md:px-8 lg:px-10 mb-5 md:mb-7">
      <div class="flex gap-2 md:gap-2.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
        <button
          v-for="filter in categoryFilters"
          :key="filter.id"
          type="button"
          :class="categoryButtonClasses(filter.id)"
          @click="activeCategoryId = filter.id"
        >
          {{ filter.name }}
        </button>
      </div>
    </nav>

    <main :class="['px-5 md:px-8 lg:px-10 space-y-8 md:space-y-12', isDarkTheme ? 'text-white/95' : '']">
      <section v-if="showFeatured" class="-mx-1">
        <div class="flex items-center gap-2 mb-3 md:mb-4 px-1">
          <Icon name="lucide:sparkles" class="w-4 h-4 md:w-5 md:h-5 text-brand-500" />
          <h2 class="text-xs md:text-sm font-bold uppercase tracking-wider text-[var(--store-text)]">Destacados</h2>
        </div>
        <div :class="['px-1', gridClasses]">
          <ProductCard
            v-for="product in featuredProducts"
            :key="`featured-${product.id}`"
            :product="product"
            :variant="theme.cardVariant"
            @click="openProduct(product)"
          />
        </div>
      </section>

      <section v-for="group in visibleGroups" :key="group.id">
        <h2
          v-if="visibleGroups.length > 1"
          :class="['mb-3 md:mb-5', sectionTitleClass]"
          :style="sectionTitleStyle"
        >
          {{ group.name }}
        </h2>
        <div :class="gridClasses">
          <ProductCard
            v-for="product in group.products"
            :key="product.id"
            :product="product"
            :variant="theme.cardVariant"
            @click="openProduct(product)"
          />
        </div>
      </section>

      <div v-if="!hasAnyProduct" class="text-center py-16 md:py-24">
        <Icon name="lucide:package-open" class="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-[var(--store-text-muted)] font-medium">Aún no hay productos disponibles.</p>
      </div>
    </main>

    <footer v-if="!isPro" class="mt-12 md:mt-16 px-5 md:px-8 text-center safe-bottom">
      <a
        href="/"
        class="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--store-text-muted)] hover:opacity-100 opacity-70 transition-opacity"
      >
        <Icon name="lucide:shopping-bag" class="w-3.5 h-3.5" />
        Hecho con Vitrroo
      </a>
    </footer>

    <BottomSheet
      v-model="isSheetOpen"
      :product="selectedProduct"
      :store="data.store"
      @whatsapp-click="onWhatsAppClick"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { Product, ProductVariant } from '~/types'

interface ProductGroup {
  id: string
  name: string
  products: Product[]
}

const ALL_CATEGORIES = 'all'
const UNCATEGORIZED = 'uncategorized'

definePageMeta({ layout: 'storefront' })

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))

const { loadBySlug } = useStorefront()
const { track } = useAnalytics()
const { resolveTheme, applyToRoot, resetRoot, fontsUrl } = useStoreTheme()
const currentUser = useSupabaseUser()

const { data, pending } = await useAsyncData(
  () => `storefront-${slug.value}`,
  () => loadBySlug(slug.value),
  { watch: [slug] }
)

if (import.meta.server && !data.value) {
  const event = useRequestEvent()
  if (event) setResponseStatus(event, 404)
}

const isSheetOpen = ref(false)
const selectedProduct = ref<Product | null>(null)
const activeCategoryId = ref<string>(ALL_CATEGORIES)

const theme = computed(() => resolveTheme(data.value?.store ?? null))
const isPro = computed(() => isStorePro(data.value?.store ?? null))
const isDarkTheme = computed(() => theme.value.isDark)

const gridClasses = computed(() => {
  switch (theme.value.layout) {
    case 'grid-3':
      return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 md:gap-4'
    case 'single':
      return 'grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6'
    case 'list':
      return 'flex flex-col gap-2.5 md:gap-3'
    case 'grid-2':
    default:
      return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-5'
  }
})

const densityClass = computed(() => {
  switch (theme.value.density) {
    case 'compact':
      return 'text-[15px]'
    case 'spacious':
      return 'text-base leading-relaxed'
    default:
      return 'text-[15px]'
  }
})

const bodyFontClass = computed(() => 'font-storefront')

const bodyStyle = computed(() => ({
  fontFamily: 'var(--store-body-font)'
}))

const sectionTitleClass = computed(() => {
  if (theme.value.headingFont === 'cormorant' || theme.value.headingFont === 'playfair' || theme.value.headingFont === 'dm-serif') {
    return 'text-xl md:text-2xl lg:text-3xl font-semibold text-[var(--store-text)]'
  }
  return 'text-sm md:text-base font-bold uppercase tracking-wide text-[var(--store-text)]'
})

const sectionTitleStyle = computed(() => ({
  fontFamily: 'var(--store-heading-font)',
  letterSpacing: 'var(--store-letter-spacing)',
  textTransform: 'var(--store-heading-transform)'
}))

const featuredProducts = computed<Product[]>(() => {
  if (!data.value) return []
  return data.value.products.filter((p) => p.is_pinned)
})

const showFeatured = computed(() => {
  return activeCategoryId.value === ALL_CATEGORIES && featuredProducts.value.length > 0
})

const allGroups = computed<ProductGroup[]>(() => {
  if (!data.value) return []
  const groupsByCategory = new Map<string, ProductGroup>()
  for (const category of data.value.categories) {
    groupsByCategory.set(category.id, { id: category.id, name: category.name, products: [] })
  }
  const uncategorized: ProductGroup = { id: UNCATEGORIZED, name: 'Otros', products: [] }
  for (const product of data.value.products) {
    if (product.category_id && groupsByCategory.has(product.category_id)) {
      groupsByCategory.get(product.category_id)!.products.push(product)
    } else {
      uncategorized.products.push(product)
    }
  }
  const ordered: ProductGroup[] = []
  for (const category of data.value.categories) {
    const group = groupsByCategory.get(category.id)
    if (group && group.products.length > 0) ordered.push(group)
  }
  if (uncategorized.products.length > 0) ordered.push(uncategorized)
  return ordered
})

const categoryFilters = computed<Array<{ id: string; name: string }>>(() => {
  if (allGroups.value.length <= 1) return []
  return [{ id: ALL_CATEGORIES, name: 'Todos' }, ...allGroups.value.map((g) => ({ id: g.id, name: g.name }))]
})

const visibleGroups = computed<ProductGroup[]>(() => {
  if (activeCategoryId.value === ALL_CATEGORIES) return allGroups.value
  return allGroups.value.filter((g) => g.id === activeCategoryId.value)
})

const hasAnyProduct = computed(() => allGroups.value.some((g) => g.products.length > 0))

const categoryButtonClasses = (id: string): string => {
  const base = 'px-4 py-2 rounded-[var(--store-button-radius)] text-sm font-semibold whitespace-nowrap transition-colors border'
  if (activeCategoryId.value === id) {
    return `${base} bg-[var(--store-text)] text-[var(--store-surface)] border-[var(--store-text)]`
  }
  return `${base} bg-[var(--store-surface)] text-[var(--store-text-muted)] border-black/10`
}

const openProduct = (product: Product) => {
  selectedProduct.value = product
  isSheetOpen.value = true
}

const isViewingOwnStore = computed(() => {
  if (!data.value || !currentUser.value) return false
  return data.value.store.user_id === currentUser.value.id
})

const onWhatsAppClick = (product: Product, variant: ProductVariant | null) => {
  if (!data.value) return
  if (!isViewingOwnStore.value) void track(data.value.store.id, 'whatsapp_click', product.id)
  if (variant) void decrementVariantStock(variant)
}

const decrementVariantStock = async (variant: ProductVariant) => {
  if (variant.stock_quantity === null || variant.stock_quantity <= 0) return
  const { decrementStock } = useProductVariants()
  await decrementStock(variant.id)
}

onMounted(() => {
  if (data.value) {
    applyToRoot(data.value.store)
    if (!isViewingOwnStore.value) void track(data.value.store.id, 'visit')
  }
})

watch(
  () => [data.value?.store.theme_id, data.value?.store.theme_color],
  () => {
    if (data.value) applyToRoot(data.value.store)
  }
)

onBeforeUnmount(resetRoot)

const absoluteImageUrl = (raw: string | null | undefined): string | undefined => {
  if (!raw) return undefined
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  return `${baseUrl.replace(/\/$/, '')}${raw.startsWith('/') ? raw : `/${raw}`}`
}

const seoTitle = computed(() => data.value ? `${data.value.store.name} | Vitrroo` : 'Tienda no encontrada | Vitrroo')
const seoDescription = computed(() => data.value?.store.description ?? 'Catálogo digital para pedidos por WhatsApp.')
const seoImage = computed(() => absoluteImageUrl(data.value?.store.logo_url))

const fontHref = computed(() => fontsUrl(theme.value))

useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: fontHref }
  ]
})

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogImage: seoImage,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
  twitterImage: seoImage
})

const runtimeConfig = useRuntimeConfig()
const baseUrl = runtimeConfig.public.appUrl

const jsonLd = computed(() => {
  if (!data.value) return null
  const store = data.value.store
  const products = data.value.products

  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: store.name,
    description: store.description ?? undefined,
    url: `${baseUrl}/${store.slug}`,
    image: store.logo_url ?? undefined,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `Productos de ${store.name}`,
      itemListElement: products.slice(0, 50).map((product, index) => ({
        '@type': 'Offer',
        position: index + 1,
        priceCurrency: 'MXN',
        price: (product.price / 100).toFixed(2),
        itemOffered: {
          '@type': 'Product',
          name: product.name,
          image: product.product_images?.[0]?.url ?? product.image_url ?? undefined
        }
      }))
    }
  }
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: () => (jsonLd.value ? JSON.stringify(jsonLd.value) : '')
    }
  ]
})
</script>
