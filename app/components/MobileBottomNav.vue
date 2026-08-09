<template>
  <nav class="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#f0f0f2]">
    <div class="grid grid-cols-4 max-w-md mx-auto pt-1 pb-safe">
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        exact-active-class="nav-item-active"
        class="nav-item"
      >
        <Icon :name="item.icon" class="w-5 h-5" />
        <span class="text-[11px] font-semibold leading-none">{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
interface NavItem {
  to: string
  icon: string
  label: string
}

const items: NavItem[] = [
  { to: '/dashboard', icon: 'lucide:layout-dashboard', label: 'Inicio' },
  { to: '/dashboard/products', icon: 'lucide:package', label: 'Productos' },
  { to: '/dashboard/categories', icon: 'lucide:layers', label: 'Categorías' },
  { to: '/dashboard/settings', icon: 'lucide:settings', label: 'Ajustes' }
]
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
