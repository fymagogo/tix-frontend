<script setup lang="ts">
interface Option {
  value: string
  label: string
}

interface Props {
  label?: string
  options: Option[]
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select an option',
  disabled: false,
  required: false,
})

const model = defineModel<string>()
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <select
      v-model="model"
      :disabled="disabled"
      :required="required"
      :class="[
        'block w-full rounded-md shadow-sm sm:text-sm',
        'focus:ring-primary-500 focus:border-primary-500',
        'disabled:bg-gray-100 disabled:cursor-not-allowed',
        'transition-colors duration-200',
        error
          ? 'border-red-300 text-red-900'
          : 'border-gray-300',
      ]"
    >
      <option value="" disabled>{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>
