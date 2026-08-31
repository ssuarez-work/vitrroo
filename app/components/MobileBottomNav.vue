<template>
  <nav class="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#f0f0f2]">
    <div class="grid grid-cols-5 max-w-md mx-auto pt-1 pb-safe">
      <NuxtLink
        v-for="item in primaryItems"
        :key="item.to"
        :to="item.to"
        exact-active-class="nav-item-active"
        class="nav-item"
        @click="haptics.tap()"
      >
        <Icon :name="item.icon" class="w-5 h-5" />
        <span class="text-[11px] font-semibold leading-none">{{ item.label }}</span>
      </NuxtLink>

      <button type="button" class="nav-item" :class="{ 'nav-item-active': isMoreOpen }" @click="openMore">
        <Icon name="lucide:more-horizontal" class="w-5 h-5" />
        <span class="text-[11px] font-semibold leading-none">Más</span>
      </button>
    </div>
  </nav>

  <AdminSheet v-model="isMoreOpen" title="Más opciones">
    <ul class="divide-y divide-[#f0f0f2] -my-1">
      <li v-for="item in secondaryItems" :key="item.to">
        <NuxtLink :to="item.to" class="flex items-center gap-4 py-4 active:opacity-70" @click="isMoreOpen = false">
          <span class="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
            <Icon :name="item.icon" class="w-5 h-5" />
          </span>
          <span class="flex-1 min-w-0">
            <span class="block text-sm font-semibold text-gray-900">{{ item.label }}</span>
            <span class="block text-xs text-gray-500">{{ item.description }}</span>
          </span>
          <Icon name="lucide:chevron-right" class="w-5 h-5 text-gray-300 flex-shrink-0" />
        </NuxtLink>
      </li>
    </ul>
  </AdminSheet>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface NavItem {
  to: string
  icon: string
  label: string
}

interface SecondaryNavItem extends NavItem {
  description: string
}

const haptics = useHaptics()
const isMoreOpen = ref(false)

const primaryItems: NavItem[] = [
  { to: '/dashboard', icon: 'lucide:layout-dashboard', label: 'Inicio' },
  { to: '/dashboard/products', icon: 'lucide:package', label: 'Productos' },
  { to: '/dashboard/categories', icon: 'lucide:layers', label: 'Categorías' },
  { to: '/dashboard/settings', icon: 'lucide:settings', label: 'Ajustes' }
]

const secondaryItems: SecondaryNavItem[] = [
  {
    to: '/dashboard/billing',
    icon: 'lucide:sparkles',
    label: 'Plan',
    description: 'Tu suscripción y facturación'
  },
  {
    to: '/dashboard/account',
    icon: 'lucide:user',
    label: 'Mi cuenta',
    description: 'Correo, contraseña y privacidad'
  }
]

const openMore = () => {
  haptics.tap()
  isMoreOpen.value = true
}
</script>

<style scoped>
.pb-safe {
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
}

.nav-item {
  @apply flex flex-col items-center justify-center gap-1 py-2 min-h-12 text-gray-400 transition-colors;
}

.nav-item-active {
  @apply text-gray-900;
}

.nav-item-active :deep(svg) {
  filter: drop-shadow(0 0 6px rgba(34, 197, 94, 0.25));
}
</style>
