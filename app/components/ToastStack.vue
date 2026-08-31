<template>
  <Teleport to="body">
    <div class="toast-stack">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'pointer-events-auto px-4 py-3 rounded-2xl shadow-card text-sm font-semibold flex items-center gap-2 max-w-md w-full',
            toneClasses[toast.type]
          ]"
        >
          <Icon :name="toneIcon[toast.type]" class="w-5 h-5 flex-shrink-0" />
          <span class="flex-1">{{ toast.message }}</span>
          <button
            v-if="toast.action"
            class="px-3 min-h-9 rounded-lg font-bold underline underline-offset-2 hover:opacity-70 transition-opacity"
            @click="toast.action.run()"
          >
            {{ toast.action.label }}
          </button>
          <button
            class="min-w-9 min-h-9 flex items-center justify-center opacity-70 active:opacity-100 transition-opacity"
            aria-label="Cerrar"
            @click="dismiss(toast.id)"
          >
            <Icon name="lucide:x" class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { toasts, dismiss } = useToast()

const toneClasses = {
  success: 'bg-brand-50 text-brand-700 border border-brand-100',
  error: 'bg-red-50 text-red-700 border border-red-100',
  info: 'bg-white text-gray-800 border border-[#f0f0f2]'
}

const toneIcon = {
  success: 'lucide:check-circle-2',
  error: 'lucide:alert-circle',
  info: 'lucide:info'
}
</script>

<style scoped>
.toast-stack {
  position: fixed;
  z-index: 200;
  left: 0;
  right: 0;
  top: calc(env(safe-area-inset-top) + 0.75rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  pointer-events: none;
  padding-left: 1rem;
  padding-right: 1rem;
}

.toast-enter-active,
.toast-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  transform: translateY(-12px);
  opacity: 0;
}
</style>
