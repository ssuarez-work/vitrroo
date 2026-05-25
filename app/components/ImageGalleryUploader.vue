<template>
  <div class="space-y-3">
    <div class="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
      <div
        v-for="(image, index) in modelValue"
        :key="image.url + index"
        class="relative aspect-square rounded-xl overflow-hidden border border-[#f0f0f2] bg-gray-100 group"
      >
        <img :src="image.url" :alt="`Imagen ${index + 1}`" class="w-full h-full object-cover" />
        <button
          type="button"
          class="absolute top-1 right-1 w-7 h-7 flex items-center justify-center bg-white/90 hover:bg-white text-gray-700 hover:text-red-600 rounded-full shadow-sm transition-colors"
          aria-label="Quitar imagen"
          @click="removeImage(index)"
        >
          <Icon name="lucide:x" class="w-4 h-4" />
        </button>
        <span
          v-if="index === 0"
          class="absolute bottom-1 left-1 px-1.5 py-0.5 bg-gray-900/80 text-white text-[10px] font-semibold rounded"
        >
          Portada
        </span>
      </div>

      <button
        v-if="canAddMore"
        type="button"
        class="aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors flex flex-col items-center justify-center text-gray-400 hover:text-gray-600"
        :disabled="isUploading"
        @click="openPicker"
      >
        <Icon v-if="isUploading" name="lucide:loader-2" class="w-6 h-6 animate-spin" />
        <template v-else>
          <Icon name="lucide:plus" class="w-6 h-6 mb-1" />
          <span class="text-[11px] font-semibold">Agregar</span>
        </template>
      </button>

      <div
        v-else-if="maxImages > modelValue.length"
        class="aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center"
      >
        <span class="text-[11px] text-gray-400 font-semibold text-center px-2">Sube las anteriores primero</span>
      </div>
    </div>

    <p v-if="errorMessage" class="text-xs text-red-600 font-medium">{{ errorMessage }}</p>
    <p v-else-if="upgradeHint" class="text-xs text-gray-500">
      <Icon name="lucide:lock" class="inline-block w-3.5 h-3.5 mr-1 -mt-0.5" />
      <slot name="upgrade-hint">{{ upgradeHint }}</slot>
    </p>
    <p v-else class="text-xs text-gray-500">{{ counterText }}</p>

    <ImageCropper
      v-if="croppingFile"
      :file="croppingFile"
      variant="square"
      @confirm="onCropConfirm"
      @cancel="onCropCancel"
    />

    <input
      ref="inputRef"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      class="hidden"
      @change="onFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface GalleryImage {
  url: string
}

interface Props {
  modelValue: GalleryImage[]
  maxImages: number
  upgradeHint?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: GalleryImage[]]
}>()

const { upload } = useImageUpload()

const inputRef = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)
const croppingFile = ref<File | null>(null)
const errorMessage = ref<string | null>(null)

const canAddMore = computed(() => props.modelValue.length < props.maxImages && !isUploading.value)
const counterText = computed(() => `${props.modelValue.length} de ${props.maxImages} imágenes. La primera será la portada.`)

const openPicker = () => {
  errorMessage.value = null
  inputRef.value?.click()
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  target.value = ''
  if (file) croppingFile.value = file
}

const onCropCancel = () => {
  croppingFile.value = null
}

const onCropConfirm = async (file: File) => {
  croppingFile.value = null
  await uploadFile(file)
}

const uploadFile = async (file: File) => {
  isUploading.value = true
  errorMessage.value = null

  const { url, error } = await upload(file, 'products')

  isUploading.value = false

  if (error) {
    errorMessage.value = error
    return
  }
  if (!url) return
  emit('update:modelValue', [...props.modelValue, { url }])
}

const removeImage = (index: number) => {
  const next = [...props.modelValue]
  next.splice(index, 1)
  emit('update:modelValue', next)
}
</script>
