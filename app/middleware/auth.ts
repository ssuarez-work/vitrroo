export default defineNuxtRouteMiddleware((to, _from) => {
  const user = useSupabaseUser()

  if (!user.value) {
    const next = encodeURIComponent(to.fullPath)
    return navigateTo(`/login?next=${next}`)
  }
})
