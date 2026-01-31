<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: boolean
  label?: string
  description?: string
  disabled?: boolean
  id?: string
}>(), {
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const checkboxId = props.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`

function toggle() {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}
</script>

<template>
  <div class="relative flex items-start">
    <div class="flex h-6 items-center">
      <input
        :id="checkboxId"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
        @change="toggle"
      />
    </div>
    <div v-if="label || description" class="ml-3 text-sm leading-6">
      <label
        :for="checkboxId"
        :class="[
          'font-medium',
          disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900 cursor-pointer'
        ]"
      >
        {{ label }}
      </label>
      <p v-if="description" :class="disabled ? 'text-gray-400' : 'text-gray-500'">
        {{ description }}
      </p>
    </div>
  </div>
</template>
