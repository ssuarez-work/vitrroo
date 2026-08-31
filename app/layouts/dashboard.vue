<template>
  <div class="min-h-[100dvh] flex bg-[#f8f8fa]">
    <aside class="w-64 bg-white border-r border-[#f0f0f2] hidden md:flex flex-col fixed h-full z-40">
      <div class="p-6 flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-sm">
          <Icon name="lucide:shopping-bag" class="w-4 h-4 text-white" />
        </div>
        <h1 class="text-xl font-bold tracking-tight text-gray-900">Vitrroo<span class="text-brand-500">.</span></h1>
      </div>
      <nav class="flex-1 px-4 space-y-1">
        <NuxtLink to="/dashboard" class="sidebar-link" exact-active-class="active">
          <Icon name="lucide:layout-dashboard" class="w-5 h-5 icon" />
          Dashboard
        </NuxtLink>
        <NuxtLink to="/dashboard/products" class="sidebar-link" exact-active-class="active">
          <Icon name="lucide:package" class="w-5 h-5 icon" />
          Productos
        </NuxtLink>
        <NuxtLink to="/dashboard/categories" class="sidebar-link" exact-active-class="active">
          <Icon name="lucide:layers" class="w-5 h-5 icon" />
          Categorías
        </NuxtLink>
        <NuxtLink to="/dashboard/settings" class="sidebar-link" exact-active-class="active">
          <Icon name="lucide:settings" class="w-5 h-5 icon" />
          Configuración
        </NuxtLink>
        <NuxtLink to="/dashboard/billing" class="sidebar-link" exact-active-class="active">
          <Icon name="lucide:sparkles" class="w-5 h-5 icon" />
          Plan
        </NuxtLink>
        <NuxtLink to="/dashboard/account" class="sidebar-link" exact-active-class="active">
          <Icon name="lucide:user" class="w-5 h-5 icon" />
          Mi cuenta
        </NuxtLink>
      </nav>
      <div class="p-4 border-t border-[#f0f0f2]">
        <button
          class="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          @click="handleLogout"
        >
          <Icon name="lucide:log-out" class="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>

    <header class="md:hidden fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-[#f0f0f2] z-30">
      <div class="pt-safe">
        <div class="h-14 flex items-center justify-between px-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-sm">
              <Icon name="lucide:shopping-bag" class="w-4 h-4 text-white" />
            </div>
            <h1 class="text-lg font-bold tracking-tight text-gray-900">Vitrroo<span class="text-brand-500">.</span></h1>
          </div>
          <button
            class="min-w-11 min-h-11 -mr-2 flex items-center justify-center text-gray-500 hover:text-red-600 transition-colors"
            aria-label="Cerrar sesión"
            @click="handleLogout"
          >
            <Icon name="lucide:log-out" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1 md:ml-64 pt-[calc(env(safe-area-inset-top)+3.5rem)] md:pt-0 pb-[calc(env(safe-area-inset-bottom)+5rem)] md:pb-0">
      <div class="px-4 py-5 md:p-8 max-w-5xl mx-auto w-full">
        <slot />
      </div>
    </main>

    <MobileBottomNav />

    <ConfirmDialog
      v-model="isLogoutOpen"
      title="Cerrar sesión"
      message="Tendrás que iniciar sesión de nuevo para volver a tu panel."
      confirm-label="Cerrar sesión"
      tone="neutral"
      :is-busy="isLoggingOut"
      @confirm="confirmLogout"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const supabase = useSupabaseClient()

useNoIndex()

const isLogoutOpen = ref(false)
const isLoggingOut = ref(false)

const handleLogout = () => {
  isLogoutOpen.value = true
}

const confirmLogout = async () => {
  isLoggingOut.value = true
  await supabase.auth.signOut()
  isLogoutOpen.value = false
  isLoggingOut.value = false
  navigateTo('/login')
}
</script>

<style scoped>
.pt-safe {
  padding-top: env(safe-area-inset-top);
}
</style>
