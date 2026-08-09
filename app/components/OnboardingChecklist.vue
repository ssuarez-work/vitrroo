<template>
  <div v-if="visible" class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2] overflow-hidden">
    <div class="p-5 md:p-6 border-b border-[#f0f0f2] flex items-center justify-between gap-3">
      <div>
        <h2 class="text-base md:text-lg font-bold text-gray-900">Empieza a vender en 4 pasos</h2>
        <p class="text-xs text-gray-500 mt-0.5">{{ completedCount }} de {{ steps.length }} completados</p>
      </div>
      <button
        v-if="canDismiss"
        type="button"
        class="text-xs font-semibold text-gray-400 active:text-gray-700 transition-colors min-h-10 px-2"
        @click="$emit('dismiss')"
      >
        Ocultar
      </button>
    </div>

    <div class="px-5 md:px-6 pt-4">
      <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-5">
        <div class="h-full bg-brand-500 transition-all" :style="{ width: `${progress}%` }"></div>
      </div>
    </div>

    <ul class="divide-y divide-[#f0f0f2]">
      <li v-for="step in steps" :key="step.id" class="flex items-center gap-4 px-5 md:px-6 py-4">
        <div :class="[
          'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
          step.done ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-400'
        ]">
          <Icon :name="step.done ? 'lucide:check' : step.icon" class="w-4 h-4" />
        </div>
        <div class="flex-1 min-w-0">
          <p :class="['text-sm font-semibold', step.done ? 'text-gray-400 line-through' : 'text-gray-900']">
            {{ step.title }}
          </p>
          <p v-if="!step.done" class="text-xs text-gray-500 leading-snug">{{ step.description }}</p>
        </div>
        <NuxtLink
          v-if="!step.done && step.action"
          :to="step.action.to"
          class="text-xs font-bold text-brand-600 active:text-brand-700 flex items-center gap-1 min-h-10 px-2 flex-shrink-0"
        >
          {{ step.action.label }}
          <Icon name="lucide:arrow-right" class="w-3.5 h-3.5" />
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Product, Store } from '~/types'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: string
  done: boolean
  action?: { to: string; label: string }
}

interface Props {
  store: Store | null
  products: Product[]
  hasSharedOnce?: boolean
  canDismiss?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hasSharedOnce: false,
  canDismiss: true
})

defineEmits<{ dismiss: [] }>()

const steps = computed<OnboardingStep[]>(() => {
  const hasLogo = Boolean(props.store?.logo_url)
  const hasWhatsApp = Boolean(props.store?.whatsapp_number)
  const hasProduct = props.products.length > 0
  const hasShared = props.hasSharedOnce

  return [
    {
      id: 'logo',
      title: 'Sube el logo de tu tienda',
      description: 'Una imagen cuadrada hace que tu catálogo se vea profesional.',
      icon: 'lucide:image',
      done: hasLogo,
      action: { to: '/dashboard/settings', label: 'Subir' }
    },
    {
      id: 'whatsapp',
      title: 'Conecta tu WhatsApp',
      description: 'Es donde recibirás los pedidos. Sin esto el catálogo no puede vender.',
      icon: 'bi:whatsapp',
      done: hasWhatsApp,
      action: { to: '/dashboard/settings', label: 'Configurar' }
    },
    {
      id: 'product',
      title: 'Crea tu primer producto',
      description: 'Sube una foto, ponle precio y publícalo.',
      icon: 'lucide:package',
      done: hasProduct,
      action: { to: '/dashboard/products', label: 'Crear' }
    },
    {
      id: 'share',
      title: 'Comparte tu enlace',
      description: 'Ponlo en tu bio de Instagram o estado de WhatsApp.',
      icon: 'lucide:share-2',
      done: hasShared
    }
  ]
})

const completedCount = computed(() => steps.value.filter((step) => step.done).length)
const progress = computed(() => Math.round((completedCount.value / steps.value.length) * 100))
const visible = computed(() => completedCount.value < steps.value.length)
</script>
