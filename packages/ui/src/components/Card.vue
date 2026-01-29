<script setup lang="ts">
interface Props {
  clickable?: boolean
  padding?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  clickable: false,
  padding: true,
})

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <div
    :class="[
      'bg-white rounded-lg shadow border border-gray-200',
      'transition-shadow duration-200',
      clickable && 'cursor-pointer hover:shadow-md',
      padding && 'p-4 sm:p-6',
    ]"
    @click="clickable && emit('click')"
  >
    <div v-if="$slots.header" class="mb-4 pb-4 border-b border-gray-200">
      <slot name="header" />
    </div>
    <slot />
    <div v-if="$slots.footer" class="mt-4 pt-4 border-t border-gray-200">
      <slot name="footer" />
    </div>
  </div>
</template>
