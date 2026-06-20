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
        <NuxtLink to="/admin" class="sidebar-link" exact-active-class="active">
          <Icon name="lucide:layout-dashboard" class="w-5 h-5 icon" />
          Dashboard
        </NuxtLink>
        <NuxtLink to="/admin/products" class="sidebar-link" exact-active-class="active">
          <Icon name="lucide:package" class="w-5 h-5 icon" />
          Productos
        </NuxtLink>
        <NuxtLink to="/admin/categories" class="sidebar-link" exact-active-class="active">
          <Icon name="lucide:layers" class="w-5 h-5 icon" />
          Categorías
        </NuxtLink>
        <NuxtLink to="/admin/settings" class="sidebar-link" exact-active-class="active">
          <Icon name="lucide:settings" class="w-5 h-5 icon" />
          Configuración
        </NuxtLink>
        <NuxtLink to="/admin/billing" class="sidebar-link" exact-active-class="active">
          <Icon name="lucide:sparkles" class="w-5 h-5 icon" />
          Plan
        </NuxtLink>
        <NuxtLink to="/admin/account" class="sidebar-link" exact-active-class="active">
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
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()

useNoIndex()

const handleLogout = async () => {
  if (typeof window === 'undefined') return
  const confirmed = window.confirm('¿Cerrar sesión?')
  if (!confirmed) return
  await supabase.auth.signOut()
  navigateTo('/login')
}
</script>

<style scoped>
.pt-safe {
  padding-top: env(safe-area-inset-top);
}
</style>
