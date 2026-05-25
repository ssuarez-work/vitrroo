<template>
  <div>
    <header class="mb-6 md:mb-8">
      <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Configuración</h1>
      <p class="text-gray-500 mt-1 text-sm md:text-base">Personaliza la apariencia y datos de tu catálogo.</p>
    </header>

    <div v-if="isLoading" class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2] overflow-hidden max-w-2xl p-5 md:p-8 space-y-6">
      <div class="flex items-center gap-4">
        <Skeleton rounded="full" class="w-20 h-20 flex-shrink-0" />
        <div class="flex-1 space-y-2">
          <Skeleton class="h-5 w-32" />
          <Skeleton class="h-3 w-48" />
        </div>
      </div>
      <Skeleton class="h-px w-full" />
      <div v-for="i in 4" :key="i" class="space-y-2">
        <Skeleton class="h-4 w-24" />
        <Skeleton rounded="xl" class="h-12 w-full" />
      </div>
      <Skeleton rounded="xl" class="h-12 w-40 ml-auto" />
    </div>

    <div v-else class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2] overflow-hidden max-w-2xl">
      <form
        class="p-5 md:p-8 space-y-5 md:space-y-6"
        :class="{ 'opacity-50 pointer-events-none': isSaving }"
        @submit.prevent="saveSettings"
      >
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-3">Logo de la tienda</label>
          <ImageUploader v-model="form.logo_url" folder="logos" variant="circle" :alt="form.name || 'Logo'" />
        </div>

        <hr class="border-[#f0f0f2]" />

        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-1.5">Nombre de la tienda</label>
          <input
            v-model="form.name"
            type="text"
            required
            maxlength="60"
            autocomplete="organization"
            autocapitalize="sentences"
            enterkeyhint="next"
            class="form-input"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-1.5">Enlace personalizado</label>
          <div class="flex">
            <span class="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">
              /
            </span>
            <input
              v-model="form.slug"
              type="text"
              required
              autocomplete="off"
              autocapitalize="none"
              autocorrect="off"
              spellcheck="false"
              enterkeyhint="next"
              class="flex-1 min-w-0 block w-full px-4 py-3 rounded-r-xl border bg-white focus:ring-2 outline-none transition-colors text-base sm:text-sm"
              :class="slugInputClasses"
            />
          </div>
          <p class="text-xs mt-1.5 flex items-center gap-1" :class="slugMessageClass">
            <Icon v-if="slugIcon" :name="slugIcon" class="w-3.5 h-3.5" :class="{ 'animate-spin': slugStatus === 'checking' }" />
            {{ slugMessage }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-1.5">Descripción breve</label>
          <textarea
            v-model="form.description"
            rows="3"
            maxlength="160"
            autocapitalize="sentences"
            class="form-input resize-none"
            placeholder="¿De qué trata tu negocio?"
          ></textarea>
        </div>

        <div class="rounded-2xl border border-[#f0f0f2] bg-white p-4">
          <div class="flex items-start gap-3">
            <button
              type="button"
              :class="['relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0', form.is_published ? 'bg-brand-500' : 'bg-gray-200']"
              :aria-pressed="form.is_published"
              aria-label="Publicar tienda"
              @click="form.is_published = !form.is_published"
            >
              <span :class="['inline-block h-5 w-5 transform rounded-full bg-white transition-transform', form.is_published ? 'translate-x-6' : 'translate-x-1']" />
            </button>
            <div>
              <p class="text-sm font-semibold text-gray-900">Tienda publicada</p>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ form.is_published
                  ? 'Tu catálogo está visible para clientes.'
                  : 'Tu catálogo está en pausa. Los visitantes verán un mensaje de "no disponible".' }}
              </p>
            </div>
          </div>
        </div>

        <ProFeatureBlock title="Tema del catálogo" :unlocked="limits.canCustomizeTheme">
          <ThemePicker
            v-model="form.theme_id"
            :disabled="!limits.canCustomizeTheme"
            class="mb-4"
          />

          <div class="border-t border-[#f0f0f2] pt-4">
            <p class="text-xs font-semibold text-gray-900 mb-2">Color personalizado (opcional)</p>
            <div class="flex items-center gap-3">
              <input
                v-model="form.theme_color"
                type="color"
                :disabled="!limits.canCustomizeTheme"
                class="w-14 h-12 rounded-xl border border-gray-200 bg-white cursor-pointer disabled:cursor-not-allowed"
              />
              <input
                v-model="form.theme_color"
                type="text"
                autocapitalize="none"
                spellcheck="false"
                maxlength="7"
                :disabled="!limits.canCustomizeTheme"
                class="form-input flex-1 font-mono uppercase"
                placeholder="#22C55E"
              />
              <button
                v-if="form.theme_color && limits.canCustomizeTheme"
                type="button"
                class="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                @click="form.theme_color = null"
              >
                Quitar
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-2">Si lo defines, sustituye el color principal del tema elegido.</p>
          </div>
        </ProFeatureBlock>

        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-1.5">Número de WhatsApp</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="bi:whatsapp" class="text-gray-400 w-5 h-5" />
            </div>
            <input
              v-model="form.whatsapp_number"
              type="tel"
              inputmode="tel"
              autocomplete="tel"
              enterkeyhint="done"
              class="form-input pl-11"
              :class="phoneError ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : ''"
              placeholder="+5215555555555"
              @blur="form.whatsapp_number = normalizePhone(form.whatsapp_number)"
            />
          </div>
          <p v-if="phoneError" class="text-xs mt-1.5 text-red-600 font-semibold">{{ phoneError }}</p>
          <p v-else class="text-xs text-gray-500 mt-1.5">Incluye el código de país (ej. +52). Solo dígitos y un signo + al inicio.</p>
        </div>

        <div class="pt-4 border-t border-[#f0f0f2] sticky bottom-0 -mx-5 md:-mx-8 px-5 md:px-8 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:pb-4 bg-white">
          <button
            type="submit"
            :disabled="!canSave"
            class="w-full md:w-auto md:ml-auto md:flex bg-gray-900 text-white px-6 py-3.5 md:py-3 rounded-xl font-semibold hover:bg-gray-800 active:bg-gray-700 transition-colors shadow-sm btn-press flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-12"
          >
            <Icon v-if="isSaving" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Store } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const supabase = useSupabaseClient()
const { getMyStore } = useSupabaseStore()
const { normalize, isValid } = useSlug()
const toast = useToast()

interface SettingsForm {
  name: string
  slug: string
  description: string
  whatsapp_number: string
  logo_url: string | null
  theme_color: string | null
  theme_id: string | null
  is_published: boolean
}

const store = ref<Store | null>(null)
const isLoading = ref(true)
const isSaving = ref(false)

const form = ref<SettingsForm>({
  name: '',
  slug: '',
  description: '',
  whatsapp_number: '',
  logo_url: null,
  theme_color: null,
  theme_id: null,
  is_published: true
})

const { limits } = usePlanLimits(store)
const { isValidHex } = useThemeColor()
const { normalize: normalizePhone, isValid: isValidPhone } = usePhoneValidation()

const phoneError = computed(() => {
  const raw = form.value.whatsapp_number.trim()
  if (!raw) return ''
  return isValidPhone(raw) ? '' : 'Formato inválido. Usa el código de país y solo dígitos (ej. +5215512345678).'
})

const slugRef = computed({
  get: () => form.value.slug,
  set: (value: string) => { form.value.slug = value }
})
const initialSlug = ref('')
const excludeStoreId = ref<string | null>(null)

const { status: slugStatus } = useSlugAvailability({
  slug: slugRef,
  excludeStoreId,
  initialSlug
})

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'reserved'

const slugMessages: Record<SlugStatus, string> = {
  idle: 'Se guardará en minúsculas, sin acentos ni espacios.',
  checking: 'Verificando disponibilidad...',
  available: 'Disponible.',
  taken: 'Ese enlace ya está en uso.',
  invalid: 'Solo letras, números y guiones.',
  reserved: 'Ese enlace está reservado por Vitrroo.'
}

const slugIcons: Record<SlugStatus, string | null> = {
  idle: null,
  checking: 'lucide:loader-2',
  available: 'lucide:check',
  taken: 'lucide:x',
  invalid: 'lucide:alert-circle',
  reserved: 'lucide:shield'
}

const slugMessage = computed(() => slugMessages[slugStatus.value])
const slugIcon = computed(() => slugIcons[slugStatus.value])

const slugMessageClass = computed(() => {
  switch (slugStatus.value) {
    case 'available': return 'text-brand-600 font-semibold'
    case 'taken':
    case 'invalid':
    case 'reserved': return 'text-red-600 font-semibold'
    case 'checking': return 'text-gray-500'
    default: return 'text-gray-500'
  }
})

const slugInputClasses = computed(() => {
  switch (slugStatus.value) {
    case 'available': return 'border-brand-500 focus:ring-brand-500/20 focus:border-brand-500'
    case 'taken':
    case 'invalid':
    case 'reserved': return 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
    default: return 'border-gray-200 focus:ring-brand-500/20 focus:border-brand-500'
  }
})

const canSave = computed(() => {
  if (isSaving.value) return false
  if (phoneError.value) return false
  return slugStatus.value === 'available' && form.value.name.trim().length > 0
})

onMounted(async () => {
  const data = await getMyStore()
  store.value = data
  if (data) {
    form.value = {
      name: data.name ?? '',
      slug: data.slug ?? '',
      description: data.description ?? '',
      whatsapp_number: data.whatsapp_number ?? '',
      logo_url: data.logo_url,
      theme_color: data.theme_color,
      theme_id: data.theme_id,
      is_published: data.is_published
    }
    initialSlug.value = data.slug ?? ''
    excludeStoreId.value = data.id
  }
  isLoading.value = false
})

const saveSettings = async () => {
  if (!store.value) return

  const cleanSlug = normalize(form.value.slug)
  if (!isValid(cleanSlug)) {
    toast.error('El enlace solo puede contener letras, números y guiones.')
    return
  }

  const themeColor = limits.value.canCustomizeTheme
    ? (form.value.theme_color && isValidHex(form.value.theme_color) ? form.value.theme_color : null)
    : null

  const themeId = limits.value.canCustomizeTheme ? (form.value.theme_id || null) : null

  isSaving.value = true

  const { error } = await supabase
    .from('stores')
    .update({
      name: form.value.name.trim(),
      slug: cleanSlug,
      description: form.value.description.trim() || null,
      whatsapp_number: normalizePhone(form.value.whatsapp_number) || null,
      logo_url: form.value.logo_url,
      theme_color: themeColor,
      theme_id: themeId,
      is_published: form.value.is_published
    })
    .eq('id', store.value.id)

  isSaving.value = false

  if (error) {
    const message = error.code === '23505'
      ? 'Ese enlace ya está en uso. Elige otro.'
      : 'No pudimos guardar los cambios.'
    toast.error(message)
    return
  }

  form.value.slug = cleanSlug
  initialSlug.value = cleanSlug
  toast.success('Configuración guardada.')
}

useHead({ title: 'Configuración | Admin Vitrroo' })
</script>

