<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="md:hidden fixed inset-0 z-[110]">
        <div class="absolute inset-0 bg-gray-900/60" @click="close"></div>

        <Transition name="slide-down">
          <div
            v-if="modelValue"
            class="relative bg-white shadow-xl rounded-b-[2rem] overflow-hidden"
            style="padding-top: env(safe-area-inset-top)"
          >
            <div class="px-5 pt-3 pb-4 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-md shadow-brand-500/30">
                  <Icon name="lucide:shopping-bag" class="w-4 h-4 text-white" />
                </div>
                <span class="text-xl font-extrabold tracking-tight">Vitrroo<span class="text-brand-500">.</span></span>
              </div>
              <button
                class="min-w-11 min-h-11 flex items-center justify-center text-gray-500 active:text-gray-900 transition-colors"
                aria-label="Cerrar menú"
                @click="close"
              >
                <Icon name="lucide:x" class="w-6 h-6" />
              </button>
            </div>

            <nav class="px-5 pb-5 flex flex-col gap-1">
              <a
                v-for="link in links"
                :key="link.href"
                :href="link.href"
                class="px-4 py-3.5 text-base font-semibold text-gray-700 rounded-xl active:bg-gray-100 transition-colors flex items-center justify-between"
                @click="close"
              >
                {{ link.label }}
                <Icon name="lucide:chevron-right" class="w-5 h-5 text-gray-300" />
              </a>
            </nav>

            <div class="px-5 pb-6 pt-2 border-t border-[#f0f0f2] grid grid-cols-2 gap-2">
              <NuxtLink
                to="/login"
                class="px-4 py-3.5 text-center text-base font-bold rounded-xl border border-gray-200 text-gray-900 active:bg-gray-50 transition-colors min-h-12"
                @click="close"
              >
                Entrar
              </NuxtLink>
              <NuxtLink
                to="/register"
                class="px-4 py-3.5 text-center text-base font-bold rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/30 active:bg-brand-600 transition-colors min-h-12"
                @click="close"
              >
                Crear cuenta
              </NuxtLink>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'

interface LinkItem {
  href: string
  label: string
}

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const links: LinkItem[] = [
  { href: '#caracteristicas', label: 'Características' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#precios', label: 'Precios' }
]

const close = () => emit('update:modelValue', false)

watch(
  () => props.modelValue,
  (isOpen) => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-down-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
}
</style>
