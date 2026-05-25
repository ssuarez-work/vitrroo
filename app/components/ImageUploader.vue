<template>
  <div>
    <div
      class="flex items-center gap-4 rounded-2xl transition-colors"
      :class="dropZoneClasses"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <div
        :class="[
          'bg-gray-100 overflow-hidden flex items-center justify-center border-2 border-[#f0f0f2] flex-shrink-0',
          variant === 'circle' ? 'w-20 h-20 rounded-full' : 'w-24 h-24 rounded-2xl'
        ]"
      >
        <img v-if="modelValue" :src="modelValue" :alt="alt" class="w-full h-full object-cover" />
        <Icon v-else name="lucide:image" class="w-8 h-8 text-gray-400 opacity-50" />
      </div>

      <div class="flex-1 min-w-0 space-y-2">
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors btn-press flex items-center gap-2 disabled:opacity-60"
            :disabled="isUploading"
            @click="openPicker"
          >
            <Icon v-if="isUploading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            <Icon v-else name="lucide:upload" class="w-4 h-4" />
            {{ buttonLabel }}
          </button>
          <button
            v-if="modelValue && !isUploading"
            type="button"
            class="px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            @click="clear"
          >
            Quitar
          </button>
        </div>
        <p v-if="errorMessage" class="text-xs text-red-600 font-medium">{{ errorMessage }}</p>
        <p v-else class="text-xs text-gray-500">{{ dropHelperText }}</p>
      </div>
    </div>

    <input
      ref="inputRef"
      type="file"
      :accept="acceptedTypes"
      class="hidden"
      @change="onFileChange"
    />

    <ImageCropper
      v-if="croppingFile && enableCrop"
      :file="croppingFile"
      :variant="variant"
      @confirm="onCropConfirm"
      @cancel="onCropCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  modelValue: string | null
  folder: 'logos' | 'products'
  variant?: 'circle' | 'square'
  alt?: string
  helperText?: string
  enableCrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'square',
  alt: 'Imagen',
  helperText: 'Arrastra una imagen o haz clic. JPG, PNG, WEBP o GIF (máx. 4 MB).',
  enableCrop: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const { upload } = useImageUpload()

const acceptedTypes = 'image/jpeg,image/png,image/webp,image/gif'

const inputRef = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)
const isDragOver = ref(false)
const errorMessage = ref<string | null>(null)
const croppingFile = ref<File | null>(null)

const buttonLabel = computed(() => {
  if (isUploading.value) return 'Subiendo...'
  return props.modelValue ? 'Cambiar' : 'Subir imagen'
})

const dropZoneClasses = computed(() => {
  if (isDragOver.value) return 'ring-2 ring-brand-500 ring-offset-2 ring-offset-white p-2'
  return ''
})

const dropHelperText = computed(() => (isDragOver.value ? 'Suelta para subir tu imagen' : props.helperText))

const openPicker = () => {
  errorMessage.value = null
  inputRef.value?.click()
}

const clear = () => {
  errorMessage.value = null
  emit('update:modelValue', null)
}

const startProcessing = (file: File) => {
  if (props.enableCrop) {
    croppingFile.value = file
    return
  }
  void uploadFile(file)
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  target.value = ''
  if (file) startProcessing(file)
}

const onDragEnter = (event: DragEvent) => {
  if (event.dataTransfer?.types.includes('Files')) isDragOver.value = true
}

const onDragOver = (event: DragEvent) => {
  if (event.dataTransfer?.types.includes('Files')) isDragOver.value = true
}

const onDragLeave = () => {
  isDragOver.value = false
}

const onDrop = (event: DragEvent) => {
  isDragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) startProcessing(file)
}

const onCropCancel = () => {
  croppingFile.value = null
}

const onCropConfirm = (file: File) => {
  croppingFile.value = null
  void uploadFile(file)
}

const uploadFile = async (file: File) => {
  isUploading.value = true
  errorMessage.value = null

  const { url, error } = await upload(file, props.folder)

  isUploading.value = false

  if (error) {
    errorMessage.value = error
    return
  }
  if (url) emit('update:modelValue', url)
}
</script>
