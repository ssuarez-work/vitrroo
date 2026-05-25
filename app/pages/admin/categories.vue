<template>
  <div>
    <header class="mb-6 md:mb-8">
      <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Categorías</h1>
      <p class="text-gray-500 mt-1 text-sm md:text-base">Agrupa tus productos para que los clientes encuentren todo más rápido.</p>
    </header>

    <div v-if="isLoading" class="space-y-5 max-w-xl">
      <Skeleton rounded="2xl" class="h-20 w-full" />
      <div class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2] overflow-hidden">
        <div class="divide-y divide-[#f0f0f2]">
          <div v-for="i in 3" :key="i" class="p-3 md:p-4 flex items-center gap-3">
            <Skeleton rounded="lg" class="w-9 h-9 flex-shrink-0" />
            <Skeleton class="h-5 flex-1" />
            <Skeleton rounded="lg" class="w-9 h-9 flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="space-y-5 max-w-xl">
      <PlanLimitBanner
        v-if="store"
        :store="store"
        :current="categories.length"
        :limit="limits.categories"
        label="categorías"
      />

      <form
        class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2] p-4 md:p-5 flex flex-col sm:flex-row gap-3"
        @submit.prevent="handleCreate"
      >
        <input
          v-model="newName"
          type="text"
          maxlength="40"
          autocapitalize="sentences"
          enterkeyhint="done"
          placeholder="Nueva categoría (ej. Camisetas)"
          class="form-input flex-1"
          :disabled="!canAddCategory"
        />
        <button
          type="submit"
          :disabled="isCreating || !newName.trim() || !canAddCategory"
          class="px-5 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 active:bg-gray-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 min-h-12"
        >
          <Icon v-if="isCreating" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          <Icon v-else name="lucide:plus" class="w-4 h-4" />
          Agregar
        </button>
      </form>

      <div v-if="categories.length > 0" class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2] overflow-hidden">
        <div class="divide-y divide-[#f0f0f2]">
          <div
            v-for="category in categories"
            :key="category.id"
            :draggable="true"
            class="p-3 md:p-4 flex items-center gap-2 transition-colors"
            :class="rowClasses(category.id)"
            @dragstart="onDragStart($event, category.id)"
            @dragover="onDragOver($event, category.id)"
            @dragleave="onDragLeave"
            @dragend="onDragEnd"
            @drop.prevent
          >
            <div class="hidden md:flex text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing">
              <Icon name="lucide:grip-vertical" class="w-5 h-5" />
            </div>

            <input
              :value="category.name"
              type="text"
              autocapitalize="sentences"
              enterkeyhint="done"
              class="flex-1 min-w-0 px-3 py-3 rounded-lg border border-transparent hover:border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-base sm:text-sm font-medium bg-transparent"
              @change="(event) => handleRename(category, ($event.target as HTMLInputElement).value)"
            />

            <div class="flex flex-col items-center gap-0.5 md:hidden">
              <button
                class="min-w-10 min-h-10 flex items-center justify-center text-gray-400 active:text-gray-900 disabled:opacity-30"
                :disabled="!canMoveUp(category.id)"
                aria-label="Subir"
                @click="moveUp(category.id)"
              >
                <Icon name="lucide:chevron-up" class="w-5 h-5" />
              </button>
              <button
                class="min-w-10 min-h-10 flex items-center justify-center text-gray-400 active:text-gray-900 disabled:opacity-30"
                :disabled="!canMoveDown(category.id)"
                aria-label="Bajar"
                @click="moveDown(category.id)"
              >
                <Icon name="lucide:chevron-down" class="w-5 h-5" />
              </button>
            </div>

            <button
              class="min-w-11 min-h-11 flex items-center justify-center text-gray-400 active:text-red-600 active:bg-red-50 rounded-lg transition-colors"
              aria-label="Eliminar"
              @click="handleDelete(category)"
            >
              <Icon name="lucide:trash-2" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div v-else class="bg-white rounded-3xl shadow-sm border border-[#f0f0f2] p-8 md:p-10 text-center">
        <Icon name="lucide:layers" class="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500">Aún no creas categorías.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Category, Store } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const { getMyStore } = useSupabaseStore()
const { listByStore, create, rename, remove, reorder } = useCategories()
const toast = useToast()

const store = ref<Store | null>(null)
const categories = ref<Category[]>([])
const isLoading = ref(true)
const newName = ref('')
const isCreating = ref(false)

const { limits } = usePlanLimits(store)
const canAddCategory = computed(() => {
  if (limits.value.categories === 'unlimited') return true
  return categories.value.length < limits.value.categories
})

const persistOrder = async (orderedIds: string[]) => {
  if (!store.value) return
  const ok = await reorder(store.value.id, orderedIds)
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
} = useDragSort({ items: categories, onReorder: persistOrder })

onMounted(async () => {
  store.value = await getMyStore()
  if (store.value) categories.value = await listByStore(store.value.id)
  isLoading.value = false
})

const rowClasses = (id: string): string => {
  if (draggingId.value === id) return 'opacity-50'
  if (overId.value === id) return 'bg-brand-50'
  return 'hover:bg-gray-50'
}

const handleCreate = async () => {
  if (!store.value) return
  const trimmed = newName.value.trim()
  if (!trimmed) return

  if (!canAddCategory.value) {
    toast.error('Llegaste al límite de categorías del plan Free.')
    return
  }

  isCreating.value = true
  const created = await create(store.value.id, trimmed)
  isCreating.value = false

  if (!created) {
    toast.error('No se pudo crear la categoría. ¿Ya existe ese nombre?')
    return
  }

  categories.value = [...categories.value, created]
  newName.value = ''
  toast.success('Categoría creada.')
}

const handleRename = async (category: Category, value: string) => {
  const trimmed = value.trim()
  if (!trimmed || trimmed === category.name) return

  const ok = await rename(category.id, trimmed)
  if (!ok) {
    toast.error('No se pudo renombrar la categoría.')
    return
  }
  categories.value = categories.value.map((c) => (c.id === category.id ? { ...c, name: trimmed } : c))
  toast.success('Categoría renombrada.')
}

const handleDelete = async (category: Category) => {
  if (!window.confirm(`¿Eliminar la categoría "${category.name}"? Los productos quedarán sin categoría.`)) return

  const ok = await remove(category.id)
  if (!ok) {
    toast.error('No se pudo eliminar la categoría.')
    return
  }
  categories.value = categories.value.filter((c) => c.id !== category.id)
  toast.success('Categoría eliminada.')
}

useHead({ title: 'Categorías | Admin Vitrroo' })
</script>

