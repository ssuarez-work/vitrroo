<template>
  <div class="min-h-[100dvh] bg-[#f8f8fa] text-gray-900">
    <header class="bg-white border-b border-[#f0f0f2]">
      <div class="max-w-3xl mx-auto px-5 md:px-6 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-sm">
            <Icon name="lucide:shopping-bag" class="w-4 h-4 text-white" />
          </div>
          <span class="text-lg font-extrabold tracking-tight">Vitrroo<span class="text-brand-500">.</span></span>
        </NuxtLink>
        <NuxtLink
          to="/"
          class="text-sm font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1"
        >
          <Icon name="lucide:arrow-left" class="w-4 h-4" />
          Volver
        </NuxtLink>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-5 md:px-6 py-10 md:py-14">
      <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">{{ title }}</h1>
      <p v-if="lastUpdated" class="text-sm text-gray-500 mb-8">Última actualización: {{ lastUpdated }}</p>
      <article class="prose prose-gray max-w-none text-gray-700 leading-relaxed">
        <slot />
      </article>
    </main>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  lastUpdated?: string
}>()
</script>

<style scoped>
.prose :deep(h2) {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f0f10;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}
.prose :deep(p) {
  margin-bottom: 1rem;
}
.prose :deep(ul) {
  list-style: disc;
  padding-left: 1.25rem;
  margin-bottom: 1rem;
}
.prose :deep(li) {
  margin-bottom: 0.5rem;
}
.prose :deep(a) {
  color: rgb(var(--brand-600));
  font-weight: 600;
}
</style>
