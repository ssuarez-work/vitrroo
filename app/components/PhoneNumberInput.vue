<template>
  <div class="flex gap-2">
    <select
      v-model="selectedIso"
      class="px-2 py-3 rounded-xl border border-gray-200 bg-white text-base sm:text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none w-36 md:w-44 flex-shrink-0"
      aria-label="Código de país"
    >
      <option v-if="!hasKnownCountry" value="">Otro (+)</option>
      <option v-for="country in countries" :key="country.iso" :value="country.iso">
        {{ country.flag }} {{ country.name }} ({{ country.dialCode }})
      </option>
    </select>

    <input
      :value="nationalNumber"
      type="tel"
      inputmode="numeric"
      autocomplete="tel-national"
      enterkeyhint="done"
      :placeholder="placeholder"
      class="form-input flex-1 min-w-0"
      aria-label="Número de WhatsApp"
      @input="onNationalInput"
    >
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '5512345678'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const countries = PHONE_COUNTRIES

const selectedIso = ref(DEFAULT_COUNTRY_ISO)
const nationalNumber = ref('')

const hasKnownCountry = computed(() => selectedIso.value !== '')

const currentValue = () => composePhoneNumber(selectedIso.value, nationalNumber.value)

watch(
  () => props.modelValue,
  (value) => {
    if (currentValue() === (value ?? '')) return
    const parts = splitPhoneNumber(value)
    selectedIso.value = parts.iso
    nationalNumber.value = parts.nationalNumber
  },
  { immediate: true }
)

watch([selectedIso, nationalNumber], () => {
  emit('update:modelValue', currentValue())
})

const onNationalInput = (event: Event) => {
  nationalNumber.value = onlyDigits((event.target as HTMLInputElement).value)
}
</script>
