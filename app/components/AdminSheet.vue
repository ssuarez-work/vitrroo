<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[120] flex justify-center md:items-center items-end"
        role="dialog"
        aria-modal="true"
      >
        <div class="absolute inset-0 bg-gray-900/50 md:backdrop-blur-sm" @click="close"></div>

        <Transition name="sheet">
          <div
            v-if="modelValue"
            class="relative bg-white shadow-modal flex flex-col w-full md:max-w-lg md:rounded-3xl rounded-t-[1.75rem] overflow-hidden md:max-h-[90vh] max-h-[92dvh] md:my-0"
          >
            <button
              class="md:hidden w-full flex justify-center pt-3 pb-2 cursor-pointer touch-manipulation"
              aria-label="Cerrar"
              @click="close"
            >
              <span class="w-12 h-1.5 bg-gray-200 rounded-full"></span>
            </button>

            <div class="px-5 md:px-6 pt-1 md:pt-6 pb-4 md:pb-5 border-b border-[#f0f0f2] flex items-center justify-between gap-3 bg-white">
              <h2 class="text-lg md:text-xl font-bold text-gray-900 truncate">{{ title }}</h2>
              <button
                class="min-w-11 min-h-11 -mr-2 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Cerrar"
                @click="close"
              >
                <Icon name="lucide:x" class="w-5 h-5" />
              </button>
            </div>

            <div class="flex-1 overflow-y-auto px-5 md:px-6 py-5 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
              <slot />
            </div>

            <div v-if="$slots.footer" class="border-t border-[#f0f0f2] px-5 md:px-6 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] bg-white">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  title: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

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
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.sheet-enter-active {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.sheet-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (max-width: 767px) {
  .sheet-enter-from,
  .sheet-leave-to {
    transform: translateY(100%);
  }
}

@media (min-width: 768px) {
  .sheet-enter-from,
  .sheet-leave-to {
    transform: translateY(20px);
    opacity: 0;
  }
}
</style>
