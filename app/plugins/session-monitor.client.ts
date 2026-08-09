export default defineNuxtPlugin(() => {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const toast = useToast()

  const handleSignedOut = () => {
    const current = router.currentRoute.value
    if (!current.path.startsWith('/dashboard')) return
    toast.info('Tu sesión expiró. Inicia sesión de nuevo.')
    navigateTo(`/login?next=${encodeURIComponent(current.fullPath)}`)
  }

  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') handleSignedOut()
  })
})
