<script setup lang="ts">
interface Props {
  clickable?: boolean
  padding?: boolean
}

withDefaults(defineProps<Props>(), {
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
      'bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700',
      'transition-shadow duration-200',
      clickable && 'cursor-pointer hover:shadow-md dark:hover:shadow-lg',
      padding && 'p-4 sm:p-6',
    ]"
    @click="clickable && emit('click')"
  >
    <div v-if="$slots.header" class="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
      <slot name="header" />
    </div>
    <slot />
    <div v-if="$slots.footer" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <slot name="footer" />
    </div>
  </div>
</template>
