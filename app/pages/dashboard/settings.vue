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

        <div>
          <label class="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1.5">
            <Icon name="bi:whatsapp" class="w-4 h-4 text-wa" />
            Número de WhatsApp
          </label>
          <PhoneNumberInput v-model="form.whatsapp_number" />
          <p v-if="phoneError" class="text-xs mt-1.5 text-red-600 font-semibold">{{ phoneError }}</p>
          <p v-else class="text-xs text-gray-500 mt-1.5">Aquí llegarán los pedidos de tus clientes. Elige tu país y escribe el número sin el código.</p>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-1.5">Redes sociales</label>
          <p class="text-xs text-gray-500 mb-3">Aparecerán como íconos en tu catálogo para que tus clientes te sigan en otras plataformas. Pega el enlace o tu usuario.</p>
          <SocialLinksEditor v-model="form.social_links" />
        </div>

        <hr class="border-[#f0f0f2]" />

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

        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-1.5">Tema del catálogo</label>
          <p class="text-xs text-gray-500 mb-3">{{ themeHelperText }}</p>
          <ThemePicker
            v-model="form.theme_id"
            :can-use-pro-themes="limits.canUseProThemes"
            class="mb-5"
            @locked-select="onLockedThemeSelect"
          />

          <ProFeatureBlock title="Color personalizado" :unlocked="limits.canCustomizeThemeColor">
            <div class="flex items-center gap-3">
              <input
                v-model="form.theme_color"
                type="color"
                :disabled="!limits.canCustomizeThemeColor"
                class="w-14 h-12 rounded-xl border border-gray-200 bg-white cursor-pointer disabled:cursor-not-allowed"
              />
              <input
                v-model="form.theme_color"
                type="text"
                autocapitalize="none"
                spellcheck="false"
                maxlength="7"
                :disabled="!limits.canCustomizeThemeColor"
                class="form-input flex-1 font-mono uppercase"
                placeholder="#22C55E"
              />
              <button
                v-if="form.theme_color && limits.canCustomizeThemeColor"
                type="button"
                class="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                @click="form.theme_color = null"
              >
                Quitar
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-2">Si lo defines, sustituye el color principal del tema elegido.</p>
          </ProFeatureBlock>
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { SocialLink, Store } from '~/types'
import { FREE_THEMES, STORE_THEMES, resolveAllowedThemeId, type StoreTheme } from '~/themes'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const supabase = useSupabaseClient()
const { store, load: loadStore, patch: patchStore } = useStoreState()
const { normalize, isValid } = useSlug()
const toast = useToast()
const haptics = useHaptics()

interface SettingsForm {
  name: string
  slug: string
  description: string
  whatsapp_number: string
  logo_url: string | null
  theme_color: string | null
  theme_id: string | null
  is_published: boolean
  social_links: SocialLink[]
}

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
  is_published: true,
  social_links: []
})

const { limits } = usePlanLimits(store)
const { isValidHex } = useThemeColor()

const themeHelperText = computed(() => {
  if (limits.value.canUseProThemes) return 'Tienes los 10 temas disponibles.'
  return `Con el plan Free puedes usar ${FREE_THEMES.length} de los ${STORE_THEMES.length} temas.`
})

const onLockedThemeSelect = (theme: StoreTheme) => {
  toast.info(`"${theme.name}" está disponible en el plan Pro.`)
  navigateTo('/dashboard/billing')
}

const phoneError = computed(() => {
  const value = form.value.whatsapp_number.trim()
  if (!value) return ''
  return isValidE164(value) ? '' : 'Número incompleto. Revisa que tengas entre 8 y 15 dígitos con el código de país.'
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

const buildForm = (data: Store): SettingsForm => ({
  name: data.name ?? '',
  slug: data.slug ?? '',
  description: data.description ?? '',
  whatsapp_number: data.whatsapp_number ?? '',
  logo_url: data.logo_url,
  theme_color: data.theme_color,
  theme_id: data.theme_id,
  is_published: data.is_published,
  social_links: Array.isArray(data.social_links) ? data.social_links : []
})

const savedSnapshot = ref('')

const hasUnsavedChanges = computed(() => {
  if (isLoading.value || savedSnapshot.value === '') return false
  return JSON.stringify(form.value) !== savedSnapshot.value
})

const markAsSaved = () => {
  savedSnapshot.value = JSON.stringify(form.value)
}

onMounted(async () => {
  const data = await loadStore()
  if (data) {
    form.value = buildForm(data)
    initialSlug.value = data.slug ?? ''
    excludeStoreId.value = data.id
  }
  isLoading.value = false
  markAsSaved()
})

onBeforeRouteLeave(() => {
  if (!hasUnsavedChanges.value) return true
  return window.confirm('Tienes cambios sin guardar. ¿Salir de todos modos?')
})

const warnOnUnload = (event: BeforeUnloadEvent) => {
  if (!hasUnsavedChanges.value) return
  event.preventDefault()
  event.returnValue = ''
}

onMounted(() => window.addEventListener('beforeunload', warnOnUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', warnOnUnload))

const saveSettings = async () => {
  if (!store.value) return

  const cleanSlug = normalize(form.value.slug)
  if (!isValid(cleanSlug)) {
    toast.error('El enlace solo puede contener letras, números y guiones.')
    return
  }

  const themeColor = limits.value.canCustomizeThemeColor
    ? (form.value.theme_color && isValidHex(form.value.theme_color) ? form.value.theme_color : null)
    : null

  const themeId = resolveAllowedThemeId(form.value.theme_id, limits.value.canUseProThemes)

  const cleanSocialLinks = form.value.social_links
    .filter((link) => link.value.trim().length > 0)
    .map((link) => ({ type: link.type, value: link.value.trim() }))

  isSaving.value = true

  const { error } = await supabase
    .from('stores')
    .update({
      name: form.value.name.trim(),
      slug: cleanSlug,
      description: form.value.description.trim() || null,
      whatsapp_number: form.value.whatsapp_number.trim() || null,
      logo_url: form.value.logo_url,
      theme_color: themeColor,
      theme_id: themeId,
      is_published: form.value.is_published,
      social_links: cleanSocialLinks
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
  patchStore({
    name: form.value.name.trim(),
    slug: cleanSlug,
    description: form.value.description.trim() || null,
    whatsapp_number: form.value.whatsapp_number.trim() || null,
    logo_url: form.value.logo_url,
    theme_color: themeColor,
    theme_id: themeId,
    is_published: form.value.is_published,
    social_links: cleanSocialLinks
  })
  markAsSaved()
  haptics.confirm()
  toast.success('Configuración guardada.')
}

useHead({ title: 'Configuración · Vitrroo' })
</script>

