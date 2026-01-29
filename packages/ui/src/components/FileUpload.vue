<script setup lang="ts">
import { ref, computed } from 'vue'

export interface UploadFile {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
  signedId?: string
}

interface Props {
  label?: string
  accept?: string
  maxSize?: number // in bytes
  multiple?: boolean
  disabled?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  accept: 'image/jpeg,image/png,image/gif,image/webp,application/pdf',
  maxSize: 10 * 1024 * 1024, // 10MB
  multiple: true,
  disabled: false,
})

const emit = defineEmits<{
  upload: [file: File]
  remove: [id: string]
}>()

const model = defineModel<UploadFile[]>({ default: () => [] })

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)

const acceptedTypes = computed(() => props.accept.split(',').map(t => t.trim()))

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function validateFile(file: File): string | null {
  if (!acceptedTypes.value.includes(file.type)) {
    return `File type "${file.type}" is not allowed`
  }
  if (file.size > props.maxSize) {
    return `File size exceeds ${formatSize(props.maxSize)} limit`
  }
  return null
}

function handleFiles(files: FileList | null) {
  if (!files || props.disabled) return

  const filesToAdd = props.multiple ? Array.from(files) : [files[0]]

  for (const file of filesToAdd) {
    const error = validateFile(file)
    const uploadFile: UploadFile = {
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: error ? 'error' : 'pending',
      error: error || undefined,
    }

    if (props.multiple) {
      model.value = [...model.value, uploadFile]
    } else {
      model.value = [uploadFile]
    }

    if (!error) {
      emit('upload', file)
    }
  }
}

function onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  handleFiles(input.files)
  input.value = ''
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  handleFiles(event.dataTransfer?.files || null)
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function removeFile(id: string) {
  model.value = model.value.filter(f => f.id !== id)
  emit('remove', id)
}

function openFilePicker() {
  fileInput.value?.click()
}

function getFileIcon(type: string): string {
  if (type.startsWith('image/')) return '🖼️'
  if (type === 'application/pdf') return '📄'
  return '📎'
}
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
    </label>

    <!-- Drop zone -->
    <div
      :class="[
        'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
        isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ]"
      @click="!disabled && openFilePicker()"
      @drop.prevent="onDrop"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        class="hidden"
        @change="onFileSelect"
      />

      <div class="flex flex-col items-center gap-2">
        <svg class="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="text-sm text-gray-600">
          <span class="text-primary-600 font-medium">Click to upload</span> or drag and drop
        </p>
        <p class="text-xs text-gray-500">
          Images (JPEG, PNG, GIF, WebP) or PDF up to {{ formatSize(maxSize) }}
        </p>
      </div>
    </div>

    <!-- Error -->
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>

    <!-- File list -->
    <ul v-if="model.length > 0" class="mt-4 space-y-2">
      <li
        v-for="file in model"
        :key="file.id"
        class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
      >
        <span class="text-xl">{{ getFileIcon(file.file.type) }}</span>

        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ file.file.name }}</p>
          <p class="text-xs text-gray-500">{{ formatSize(file.file.size) }}</p>

          <!-- Progress bar -->
          <div
            v-if="file.status === 'uploading'"
            class="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden"
          >
            <div
              class="h-full bg-primary-600 transition-all duration-300"
              :style="{ width: `${file.progress}%` }"
            />
          </div>

          <!-- Error message -->
          <p v-if="file.status === 'error'" class="mt-1 text-xs text-red-600">
            {{ file.error }}
          </p>
        </div>

        <!-- Status indicator -->
        <div class="flex items-center gap-2">
          <span v-if="file.status === 'completed'" class="text-green-500">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </span>

          <span v-else-if="file.status === 'uploading'" class="text-gray-400">
            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </span>

          <button
            v-if="!disabled"
            type="button"
            class="text-gray-400 hover:text-red-500 transition-colors"
            @click="removeFile(file.id)"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>
