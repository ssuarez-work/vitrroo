<template>
  <div>
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 md:mb-8">
      <div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Productos</h1>
        <p class="text-gray-500 mt-1 text-sm md:text-base">Toca un producto para editarlo. Reordena con las flechas o arrastrando.</p>
      </div>
      <button
        class="bg-brand-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-brand-600 active:bg-brand-700 transition-colors shadow-sm flex items-center justify-center gap-2 btn-press min-h-12 disabled:opacity-60"
        :disabled="!canAddProduct"
        @click="onNewProductClick"
      >
        <Icon name="lucide:plus" class="w-5 h-5" />
        Nuevo Producto
      </button>
    </header>

    <PlanLimitBanner
      v-if="store"
      class="mb-5"
      :store="store"
      :current="products.length"
      :limit="limits.products"
      label="productos"
    />

    <div v-if="!isLoading && products.length > 0" class="flex flex-col md:flex-row gap-3 mb-4">
      <div class="relative flex-1">
        <Icon name="lucide:search" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          v-model="searchQuery"
          type="search"
          inputmode="search"
          autocomplete="off"
          placeholder="Buscar productos..."
          class="form-input pl-10"
        />
      </div>
      <div class="flex gap-2">
        <select v-model="filterCategoryId" class="form-input sm:w-44">
          <option value="all">Todas las categorías</option>
          <option value="none">Sin categoría</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
        <select v-model="filterStatus" class="form-input sm:w-36">
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
        <button
          type="button"
          :disabled="filteredProducts.length === 0"
          class="px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2 min-h-12"
          aria-label="Exportar CSV"
          @click="exportCsv"
        >
          <Icon name="lucide:download" class="w-4 h-4" />
          <span class="hidden md:inline">CSV</span>
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2] overflow-hidden">
      <div class="divide-y divide-[#f0f0f2]">
        <SkeletonProductRow v-for="i in 5" :key="i" />
      </div>
    </div>

    <div v-else-if="filteredProducts.length === 0 && hasFilters" class="bg-white rounded-3xl shadow-sm border border-[#f0f0f2] p-8 md:p-12 text-center">
      <Icon name="lucide:search-x" class="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500 font-medium">No encontramos productos con esos filtros.</p>
      <button
        type="button"
        class="mt-4 text-sm font-semibold text-brand-600 active:text-brand-700 min-h-10 px-2"
        @click="clearFilters"
      >
        Limpiar filtros
      </button>
    </div>

    <div v-else-if="products.length > 0" class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2] overflow-hidden">
      <div class="divide-y divide-[#f0f0f2]">
        <article
          v-for="product in filteredProducts"
          :key="product.id"
          :draggable="true"
          class="p-3 md:p-5 flex items-center gap-3 transition-all"
          :class="rowClasses(product.id)"
          @dragstart="onDragStart($event, product.id)"
          @dragover="onDragOver($event, product.id)"
          @dragleave="onDragLeave"
          @dragend="onDragEnd"
          @drop.prevent
        >
          <div class="hidden md:flex text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing">
            <Icon name="lucide:grip-vertical" class="w-5 h-5" />
          </div>

          <button class="flex-1 min-w-0 flex items-center gap-3 text-left" @click="openModal(product)">
            <div class="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden relative border border-[#f0f0f2]">
              <img v-if="coverImageOf(product)" :src="coverImageOf(product) ?? ''" :alt="product.name" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center">
                <Icon name="lucide:image" class="w-6 h-6 text-gray-400 opacity-50" />
              </div>
              <div
                class="absolute top-1 right-1 w-3 h-3 rounded-full border-2 border-white"
                :class="product.is_active ? 'bg-green-500' : 'bg-gray-300'"
              ></div>
              <div
                v-if="product.is_pinned"
                class="absolute bottom-1 left-1 bg-brand-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                title="Destacado"
              >
                <Icon name="lucide:pin" class="w-3 h-3" />
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="font-bold text-gray-900 truncate text-[15px] md:text-base">{{ product.name }}</h3>
                <span
                  v-if="categoryNameOf(product.category_id)"
                  class="text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md"
                >
                  {{ categoryNameOf(product.category_id) }}
                </span>
              </div>
              <p class="font-semibold text-brand-600 mt-0.5">${{ fromCents(product.price) }}</p>
              <p v-if="variantSummary(product)" class="text-xs text-gray-500 mt-1 truncate">{{ variantSummary(product) }}</p>
            </div>
          </button>

          <button
            class="hidden md:flex min-w-10 min-h-10 items-center justify-center rounded-lg transition-colors"
            :class="product.is_pinned ? 'text-brand-600 bg-brand-50' : 'text-gray-300 hover:text-brand-600 hover:bg-brand-50'"
            :aria-label="product.is_pinned ? 'Quitar destacado' : 'Marcar como destacado'"
            @click="togglePin(product)"
          >
            <Icon name="lucide:pin" class="w-4 h-4" />
          </button>

          <div class="flex flex-col items-center gap-0.5 md:hidden">
            <button
              class="min-w-10 min-h-10 flex items-center justify-center text-gray-400 active:text-gray-900 disabled:opacity-30"
              :disabled="!canMoveUp(product.id)"
              aria-label="Subir"
              @click="moveUp(product.id)"
            >
              <Icon name="lucide:chevron-up" class="w-5 h-5" />
            </button>
            <button
              class="min-w-10 min-h-10 flex items-center justify-center text-gray-400 active:text-gray-900 disabled:opacity-30"
              :disabled="!canMoveDown(product.id)"
              aria-label="Bajar"
              @click="moveDown(product.id)"
            >
              <Icon name="lucide:chevron-down" class="w-5 h-5" />
            </button>
          </div>
        </article>
      </div>
    </div>

    <div v-else class="bg-white rounded-3xl shadow-sm border border-[#f0f0f2] p-8 md:p-12 text-center">
      <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon name="lucide:package-open" class="w-8 h-8 text-gray-400" />
      </div>
      <h3 class="text-xl font-bold text-gray-900">Aún no hay productos</h3>
      <p class="text-gray-500 mt-2 mb-6">Añade tu primer producto para empezar a vender.</p>
      <button
        class="bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 active:bg-gray-700 transition-colors shadow-sm inline-flex items-center gap-2 btn-press min-h-12"
        @click="openModal()"
      >
        <Icon name="lucide:plus" class="w-5 h-5" /> Agregar mi primer producto
      </button>
    </div>

    <AdminSheet v-model="isModalOpen" :title="editingProduct ? 'Editar Producto' : 'Nuevo Producto'">
      <form id="product-form" class="space-y-5" @submit.prevent="saveProduct">
        <div>
          <div class="flex items-center justify-between mb-3">
            <label class="block text-sm font-semibold text-gray-900">Imágenes</label>
            <span v-if="!isPro" class="text-xs text-gray-500">{{ form.images.length }} / {{ limits.imagesPerProduct }}</span>
          </div>
          <ImageGalleryUploader
            v-model="form.images"
            :max-images="imagesLimit"
            :upgrade-hint="isPro ? undefined : 'Sube hasta 5 imágenes con el plan Pro.'"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-1.5">Nombre del producto</label>
          <input
            v-model="form.name"
            type="text"
            required
            maxlength="80"
            autocomplete="off"
            autocapitalize="sentences"
            enterkeyhint="next"
            class="form-input"
            placeholder="Ej. Playera Oversize"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-1.5">Precio (MXN)</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 font-medium">$</span>
              <input
                v-model="form.price"
                type="text"
                inputmode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                required
                autocomplete="off"
                enterkeyhint="next"
                class="form-input pl-8"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-1.5">Categoría</label>
            <select v-model="form.category_id" class="form-input">
              <option :value="null">Sin categoría</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-semibold text-gray-900">Variantes con stock</label>
            <button
              v-if="canAddMoreVariants"
              type="button"
              class="text-sm font-semibold text-brand-600 active:text-brand-700 flex items-center gap-1 min-h-10 px-2"
              @click="addVariant"
            >
              <Icon name="lucide:plus" class="w-4 h-4" />
              Agregar
            </button>
            <span v-else-if="!isPro" class="text-xs text-gray-500 flex items-center gap-1">
              <Icon name="lucide:lock" class="w-3.5 h-3.5" />
              Límite del plan Free
            </span>
          </div>

          <div v-if="form.variants.length === 0" class="space-y-2">
            <input
              v-model="form.optionsStr"
              type="text"
              autocomplete="off"
              autocapitalize="none"
              class="form-input"
              placeholder="S, M, L, XL"
            />
            <p class="text-xs text-gray-500">
              Opciones simples separadas por comas. Si necesitas controlar inventario, usa variantes.
            </p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="(variant, index) in form.variants"
              :key="index"
              class="flex items-center gap-2 bg-gray-50 rounded-xl p-2"
            >
              <input
                v-model="variant.label"
                type="text"
                placeholder="Talla M"
                autocapitalize="sentences"
                class="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm"
              />
              <input
                v-model.number="variant.stock"
                type="number"
                inputmode="numeric"
                min="0"
                placeholder="Stock"
                class="w-20 px-3 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm"
              />
              <button
                type="button"
                class="min-w-11 min-h-11 flex items-center justify-center text-gray-400 active:text-red-600 active:bg-red-50 rounded-lg transition-colors"
                aria-label="Quitar variante"
                @click="removeVariant(index)"
              >
                <Icon name="lucide:trash-2" class="w-4 h-4" />
              </button>
            </div>
            <p class="text-xs text-gray-500">Deja el stock vacío para no llevar control de inventario.</p>
          </div>
        </div>

        <ProFeatureBlock title="Mensaje de WhatsApp personalizado" :unlocked="limits.canCustomizeWhatsAppMessage">
          <textarea
            v-model="form.custom_wa_message"
            rows="3"
            maxlength="400"
            :disabled="!limits.canCustomizeWhatsAppMessage"
            class="form-input resize-none"
            placeholder="¡Hola! Quiero la {producto} en {opcion}, ¿confirmas envío a CDMX?"
          ></textarea>
          <p class="text-xs text-gray-500 mt-1.5">
            Usa <code class="bg-gray-100 px-1 rounded">{producto}</code>, <code class="bg-gray-100 px-1 rounded">{opcion}</code> y <code class="bg-gray-100 px-1 rounded">{precio}</code>.
          </p>
        </ProFeatureBlock>

        <ProFeatureBlock
          title="Producto destacado"
          :unlocked="limits.canPinProducts && (form.is_pinned || canPinMore || (editingProduct?.is_pinned ?? false))"
        >
          <label class="flex items-start gap-3 cursor-pointer select-none">
            <button
              type="button"
              :disabled="!limits.canPinProducts"
              :class="['relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0', form.is_pinned ? 'bg-brand-500' : 'bg-gray-200']"
              @click="form.is_pinned = !form.is_pinned"
            >
              <span :class="['inline-block h-5 w-5 transform rounded-full bg-white transition-transform', form.is_pinned ? 'translate-x-6' : 'translate-x-1']" />
            </button>
            <span>
              <span class="block text-sm font-semibold text-gray-900">Mostrar arriba en el catálogo</span>
              <span class="block text-xs text-gray-500 mt-0.5">Hasta 3 productos destacados.</span>
            </span>
          </label>
        </ProFeatureBlock>

        <div class="flex items-center gap-3 pt-1">
          <button
            type="button"
            :class="['relative inline-flex h-7 w-12 items-center rounded-full transition-colors', form.is_active ? 'bg-brand-500' : 'bg-gray-200']"
            :aria-pressed="form.is_active"
            aria-label="Activar producto"
            @click="form.is_active = !form.is_active"
          >
            <span :class="['inline-block h-5 w-5 transform rounded-full bg-white transition-transform', form.is_active ? 'translate-x-6' : 'translate-x-1']" />
          </button>
          <span class="text-sm font-semibold text-gray-900">Producto Activo (Visible)</span>
        </div>
      </form>

      <template #footer>
        <div class="flex gap-3">
          <button
            v-if="editingProduct"
            type="button"
            class="px-4 py-3 text-red-600 bg-red-50 active:bg-red-100 rounded-xl font-semibold transition-colors min-h-12"
            @click="confirmDelete(editingProduct)"
          >
            Eliminar
          </button>
          <button
            type="submit"
            form="product-form"
            :disabled="isSaving"
            class="flex-1 bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 active:bg-gray-700 transition-colors shadow-sm btn-press flex items-center justify-center gap-2 disabled:opacity-70 min-h-12"
          >
            <Icon v-if="isSaving" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            Guardar Producto
          </button>
        </div>
      </template>
    </AdminSheet>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Category, Product, ProductVariant, Store } from '~/types'
import type { VariantInput } from '~/composables/useProductVariants'
import type { ImageInput } from '~/composables/useProductImages'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const supabase = useSupabaseClient()
const { getMyStore, getMyProducts, reorderProducts } = useSupabaseStore()
const { listByStore: listCategories } = useCategories()
const { replaceAll: replaceVariants } = useProductVariants()
const { replaceAll: replaceImages } = useProductImages()
const { removeByUrls } = useImageUpload()
const { fromCents, toCents } = usePrice()
const toast = useToast()

interface VariantDraft {
  label: string
  stock: number | null
}

interface GalleryImage {
  url: string
}

interface ProductForm {
  name: string
  price: string
  category_id: string | null
  optionsStr: string
  variants: VariantDraft[]
  images: GalleryImage[]
  is_active: boolean
  is_pinned: boolean
  custom_wa_message: string
}

const store = ref<Store | null>(null)
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const isLoading = ref(true)

const isModalOpen = ref(false)
const isSaving = ref(false)
const editingProduct = ref<Product | null>(null)
const form = ref<ProductForm>(createEmptyForm())

const searchQuery = ref('')
const filterCategoryId = ref<'all' | 'none' | string>('all')
const filterStatus = ref<'all' | 'active' | 'inactive'>('all')

const hasFilters = computed(() => {
  return searchQuery.value.trim().length > 0
    || filterCategoryId.value !== 'all'
    || filterStatus.value !== 'all'
})

const filteredProducts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return products.value.filter((product) => {
    if (filterStatus.value === 'active' && !product.is_active) return false
    if (filterStatus.value === 'inactive' && product.is_active) return false
    if (filterCategoryId.value === 'none' && product.category_id !== null) return false
    if (filterCategoryId.value !== 'all' && filterCategoryId.value !== 'none' && product.category_id !== filterCategoryId.value) return false
    if (query) {
      const haystack = `${product.name} ${product.options.join(' ')}`.toLowerCase()
      if (!haystack.includes(query)) return false
    }
    return true
  })
})

const clearFilters = () => {
  searchQuery.value = ''
  filterCategoryId.value = 'all'
  filterStatus.value = 'all'
}

const { isPro, limits } = usePlanLimits(store)

const pinnedCount = computed(() => products.value.filter((p) => p.is_pinned).length)
const canPinMore = computed(() => {
  if (limits.value.pinnedProducts === 'unlimited') return true
  return pinnedCount.value < limits.value.pinnedProducts
})
const canAddProduct = computed(() => {
  if (limits.value.products === 'unlimited') return true
  return products.value.length < limits.value.products
})
const canAddMoreVariants = computed(() => {
  if (limits.value.variantsPerProduct === 'unlimited') return true
  return form.value.variants.length < limits.value.variantsPerProduct
})
const imagesLimit = computed(() => (limits.value.imagesPerProduct === 'unlimited' ? 10 : limits.value.imagesPerProduct))

const persistOrder = async (orderedIds: string[]) => {
  if (!store.value) return
  const ok = await reorderProducts(store.value.id, orderedIds)
  if (!ok) toast.error('No se pudo guardar el nuevo orden.')
}

const {
  draggingId,
  overId,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDragEnd,
  moveUp,
  moveDown,
  canMoveUp,
  canMoveDown
} = useDragSort({ items: products, onReorder: persistOrder })

onMounted(async () => {
  store.value = await getMyStore()
  if (store.value) {
    const [productList, categoryList] = await Promise.all([
      getMyProducts(store.value.id),
      listCategories(store.value.id)
    ])
    products.value = productList
    categories.value = categoryList
  }
  isLoading.value = false
})

function createEmptyForm(): ProductForm {
  return {
    name: '',
    price: '',
    category_id: null,
    optionsStr: '',
    variants: [],
    images: [],
    is_active: true,
    is_pinned: false,
    custom_wa_message: ''
  }
}

const onNewProductClick = () => {
  if (!canAddProduct.value) {
    toast.error('Alcanzaste el límite de productos del plan Free.')
    navigateTo('/dashboard/billing')
    return
  }
  openModal()
}

const categoryNameOf = (id: string | null): string | null => {
  if (!id) return null
  return categories.value.find((c) => c.id === id)?.name ?? null
}

const variantSummary = (product: Product): string | null => {
  const variants = product.product_variants ?? []
  if (variants.length > 0) {
    return variants
      .map((v) => (v.stock_quantity !== null ? `${v.label} (${v.stock_quantity})` : v.label))
      .join(' · ')
  }
  if (product.options.length > 0) return product.options.join(' · ')
  return null
}

const rowClasses = (id: string): string => {
  if (draggingId.value === id) return 'opacity-50'
  if (overId.value === id) return 'bg-brand-50'
  return 'hover:bg-gray-50'
}

const addVariant = () => {
  if (!canAddMoreVariants.value) {
    toast.error('Llegaste al límite de variantes del plan Free.')
    return
  }
  form.value.variants.push({ label: '', stock: null })
}

const removeVariant = (index: number) => {
  form.value.variants.splice(index, 1)
}

const openModal = (product: Product | null = null) => {
  editingProduct.value = product
  form.value = product ? toFormState(product) : createEmptyForm()
  isModalOpen.value = true
}

const toFormState = (product: Product): ProductForm => {
  const sortedImages = sortedProductImages(product)
  const initialImages: GalleryImage[] = sortedImages.length > 0
    ? sortedImages.map((image) => ({ url: image.url }))
    : product.image_url
      ? [{ url: product.image_url }]
      : []

  return {
    name: product.name,
    price: (product.price / 100).toString(),
    category_id: product.category_id,
    optionsStr: product.options.join(', '),
    variants: (product.product_variants ?? []).map((v) => ({
      label: v.label,
      stock: v.stock_quantity
    })),
    images: initialImages,
    is_active: product.is_active,
    is_pinned: product.is_pinned,
    custom_wa_message: product.custom_wa_message ?? ''
  }
}

const closeModal = () => {
  isModalOpen.value = false
  editingProduct.value = null
}

const parseOptions = (raw: string): string[] => {
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

const sanitizeVariants = (drafts: VariantDraft[]): VariantInput[] => {
  return drafts
    .filter((v) => v.label.trim().length > 0)
    .map((v) => ({
      label: v.label.trim(),
      stock_quantity:
        v.stock === null || Number.isNaN(v.stock) ? null : Math.max(0, Math.floor(v.stock))
    }))
}

const sanitizeImages = (drafts: GalleryImage[]): ImageInput[] => {
  return drafts.filter((image) => image.url.trim().length > 0).map((image) => ({ url: image.url }))
}

const reloadProducts = async () => {
  if (!store.value) return
  products.value = await getMyProducts(store.value.id)
}

const buildProductPayload = (variants: VariantInput[], images: ImageInput[]) => ({
  store_id: store.value!.id,
  name: form.value.name.trim(),
  price: toCents(form.value.price),
  image_url: images[0]?.url ?? null,
  category_id: form.value.category_id,
  options: variants.length === 0 ? parseOptions(form.value.optionsStr) : [],
  is_active: form.value.is_active,
  is_pinned: limits.value.canPinProducts ? form.value.is_pinned : false,
  custom_wa_message: limits.value.canCustomizeWhatsAppMessage
    ? form.value.custom_wa_message.trim() || null
    : null
})

const validatePinChange = (): string | null => {
  if (!form.value.is_pinned) return null
  if (!limits.value.canPinProducts) return null
  if (editingProduct.value?.is_pinned) return null
  if (canPinMore.value) return null
  const max = limits.value.pinnedProducts === 'unlimited' ? '3' : String(limits.value.pinnedProducts)
  return `Solo puedes destacar ${max} productos a la vez.`
}

const saveProduct = async () => {
  if (!store.value) return

  const pinError = validatePinChange()
  if (pinError) {
    toast.error(pinError)
    return
  }

  if (!editingProduct.value && !canAddProduct.value) {
    toast.error('Alcanzaste el límite de productos del plan Free.')
    return
  }

  isSaving.value = true
  const variants = sanitizeVariants(form.value.variants)
  const images = sanitizeImages(form.value.images)
  const payload = buildProductPayload(variants, images)

  const result = editingProduct.value
    ? await supabase.from('products').update(payload).eq('id', editingProduct.value.id).select('id').single()
    : await supabase.from('products').insert(payload).select('id').single()

  if (result.error || !result.data) {
    isSaving.value = false
    toast.error('No pudimos guardar el producto.')
    return
  }

  const productId = result.data.id as string
  const [variantsOk, imagesOk] = await Promise.all([
    replaceVariants(productId, variants),
    replaceImages(productId, images)
  ])

  isSaving.value = false

  if (!variantsOk || !imagesOk) {
    toast.error('Producto guardado, pero algunas opciones no se actualizaron.')
  } else {
    toast.success(editingProduct.value ? 'Producto actualizado.' : 'Producto creado.')
  }

  await reloadProducts()
  closeModal()
}

const togglePin = async (product: Product) => {
  if (!limits.value.canPinProducts) {
    toast.error('Los productos destacados son una función del plan Pro.')
    return
  }
  if (!product.is_pinned && !canPinMore.value) {
    toast.error('Llegaste al límite de productos destacados.')
    return
  }

  const next = !product.is_pinned
  const { error } = await supabase.from('products').update({ is_pinned: next }).eq('id', product.id)
  if (error) {
    toast.error('No se pudo actualizar el destacado.')
    return
  }
  products.value = products.value.map((p) => (p.id === product.id ? { ...p, is_pinned: next } : p))
}

const csvCell = (value: unknown): string => {
  const str = value === null || value === undefined ? '' : String(value)
  return `"${str.replace(/"/g, '""')}"`
}

const formatVariantsForCsv = (variants: ProductVariant[]): string => {
  return variants
    .map((v) => (v.stock_quantity === null ? v.label : `${v.label}:${v.stock_quantity}`))
    .join(' | ')
}

const exportCsv = () => {
  if (filteredProducts.value.length === 0) return
  const rows: string[][] = [[
    'ID', 'Nombre', 'Precio (MXN)', 'Categoría', 'Activo', 'Destacado',
    'Variantes', 'Opciones', 'Imágenes', 'Creado'
  ]]

  for (const product of filteredProducts.value) {
    const variants = (product.product_variants ?? []) as ProductVariant[]
    const images = (product.product_images ?? []).map((image) => image.url).join(' | ')
    rows.push([
      product.id,
      product.name,
      (product.price / 100).toFixed(2),
      categoryNameOf(product.category_id) ?? '',
      product.is_active ? 'sí' : 'no',
      product.is_pinned ? 'sí' : 'no',
      formatVariantsForCsv(variants),
      product.options.join(' | '),
      images,
      new Date(product.created_at).toISOString()
    ])
  }

  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `vitrroo-${store.value?.slug ?? 'productos'}-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
  toast.success(`Exportados ${filteredProducts.value.length} productos.`)
}

const confirmDelete = async (product: Product) => {
  if (!window.confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return

  const { error } = await supabase.from('products').delete().eq('id', product.id)
  if (error) {
    toast.error('No pudimos eliminar el producto.')
    return
  }

  void removeByUrls((product.product_images ?? []).map((image) => image.url))

  products.value = products.value.filter((p) => p.id !== product.id)
  if (isModalOpen.value) closeModal()
  toast.success('Producto eliminado.')
}

useHead({ title: 'Productos · Vitrroo' })
</script>

