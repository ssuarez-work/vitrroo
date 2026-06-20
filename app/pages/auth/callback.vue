<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f8f8fa] p-4">
    <div class="text-center">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-brand-500 mx-auto mb-4" />
      <p class="text-gray-500 font-medium">Confirmando tu cuenta...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

definePageMeta({ layout: false })

const supabase = useSupabaseClient()
const route = useRoute()

const resolveDestination = (): string => {
  const next = route.query.next
  if (typeof next === 'string' && next.startsWith('/')) return next
  return '/admin'
}

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    navigateTo(resolveDestination(), { replace: true })
    return
  }
  navigateTo('/login?confirmed=1', { replace: true })
})

useNoIndex()
useHead({ title: 'Confirmando · Vitrroo' })
</script>
