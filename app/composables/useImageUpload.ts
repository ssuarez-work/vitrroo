const BUCKET = 'vitrroo-assets'
const MAX_FILE_BYTES = 4 * 1024 * 1024
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const PUBLIC_URL_PREFIX = `/storage/v1/object/public/${BUCKET}/`

interface UploadResult {
  url: string | null
  error: string | null
}

export const useImageUpload = () => {
  const supabase = useSupabaseClient()

  const validate = (file: File): string | null => {
    if (!ALLOWED_MIME.includes(file.type)) return 'Solo se permiten imágenes (JPG, PNG, WEBP o GIF).'
    if (file.size > MAX_FILE_BYTES) return 'La imagen no puede pesar más de 4 MB.'
    return null
  }

  const buildPath = (userId: string, folder: string, fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() ?? 'jpg'
    const stamp = Date.now()
    const random = Math.random().toString(36).slice(2, 10)
    return `${userId}/${folder}/${stamp}-${random}.${extension}`
  }

  const upload = async (file: File, folder: 'logos' | 'products'): Promise<UploadResult> => {
    const validationError = validate(file)
    if (validationError) return { url: null, error: validationError }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { url: null, error: 'Necesitas iniciar sesión para subir imágenes.' }

    const path = buildPath(user.id, folder, file.name)

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type })

    if (uploadError) return { url: null, error: 'No pudimos subir la imagen. Intenta de nuevo.' }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return { url: data.publicUrl, error: null }
  }

  const toStoragePath = (url: string): string | null => {
    const index = url.indexOf(PUBLIC_URL_PREFIX)
    if (index === -1) return null
    return decodeURIComponent(url.slice(index + PUBLIC_URL_PREFIX.length))
  }

  const removeByUrls = async (urls: string[]): Promise<void> => {
    const paths = urls.map(toStoragePath).filter((path): path is string => Boolean(path))
    if (paths.length === 0) return

    const { error } = await supabase.storage.from(BUCKET).remove(paths)
    if (error) console.error('Error eliminando imágenes de storage:', error)
  }

  return { upload, removeByUrls }
}
