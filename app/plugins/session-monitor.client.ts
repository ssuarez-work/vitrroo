export default defineNuxtPlugin(() => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const handleSignedOut = () => {
    const route = useRoute()
    if (!route.path.startsWith('/admin')) return
    const toast = useToast()
    toast.info('Tu sesión expiró. Inicia sesión de nuevo.')
    navigateTo(`/login?next=${encodeURIComponent(route.fullPath)}`)
  }

  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT' && user.value === null) {
      handleSignedOut()
    }
  })
})
