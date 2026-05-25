<template>
  <Teleport to="body">
    <Transition name="fade-up">
      <div
        v-if="isVisible"
        class="fixed bottom-4 inset-x-4 z-[180] max-w-md md:max-w-2xl mx-auto pointer-events-auto"
      >
        <div class="bg-white shadow-modal border border-[#f0f0f2] rounded-2xl p-4 md:p-5 flex flex-col gap-3">
          <p class="text-sm text-gray-700 leading-relaxed">
            Usamos almacenamiento local y analítica básica para que la app funcione y poder mejorarla.
            <NuxtLink to="/privacy" class="font-semibold text-brand-600 underline">Más información</NuxtLink>.
          </p>
          <div class="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              class="flex-1 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-11"
              @click="reject"
            >
              Rechazar opcionales
            </button>
            <button
              type="button"
              class="flex-1 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 active:bg-gray-700 transition-colors min-h-11"
              @click="accept"
            >
              Aceptar todo
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const STORAGE_KEY = 'vitrroo-cookies-consent'
const isVisible = ref(false)

const setConsent = (value: 'accepted' | 'rejected') => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, value)
  window.dispatchEvent(new CustomEvent('vitrroo:cookies-consent', { detail: { value } }))
}

onMounted(() => {
  if (typeof window === 'undefined') return
  const consent = window.localStorage.getItem(STORAGE_KEY)
  if (!consent) isVisible.value = true
})

const accept = () => {
  setConsent('accepted')
  isVisible.value = false
}

const reject = () => {
  setConsent('rejected')
  isVisible.value = false
}
</script>

<style scoped>
.fade-up-enter-active,
.fade-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
