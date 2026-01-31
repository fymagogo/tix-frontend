<script setup lang="ts">
import { ref, computed, watch } from 'vue'

export interface DateRange {
  startDate: string | null
  endDate: string | null
}

export type PresetKey = 'all' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'custom'

interface Preset {
  label: string
  key: PresetKey
  getRange: () => DateRange
}

const props = withDefaults(defineProps<{
  modelValue: DateRange
  label?: string
}>(), {
  label: 'Date Range'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: DateRange): void
}>()

const selectedPreset = ref<PresetKey>('all')
const customStart = ref('')
const customEnd = ref('')

const presets: Preset[] = [
  {
    label: 'All Time',
    key: 'all',
    getRange: () => ({ startDate: null, endDate: null })
  },
  {
    label: 'Last 7 Days',
    key: 'last7',
    getRange: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString()
      }
    }
  },
  {
    label: 'Last 30 Days',
    key: 'last30',
    getRange: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 30)
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString()
      }
    }
  },
  {
    label: 'This Month',
    key: 'thisMonth',
    getRange: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString()
      }
    }
  },
  {
    label: 'Last Month',
    key: 'lastMonth',
    getRange: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString()
      }
    }
  },
  {
    label: 'Custom',
    key: 'custom',
    getRange: () => ({
      startDate: customStart.value ? new Date(customStart.value).toISOString() : null,
      endDate: customEnd.value ? new Date(customEnd.value + 'T23:59:59').toISOString() : null
    })
  }
]

const showCustomInputs = computed(() => selectedPreset.value === 'custom')

function selectPreset(preset: Preset) {
  selectedPreset.value = preset.key
  if (preset.key !== 'custom') {
    emit('update:modelValue', preset.getRange())
  }
}

function updateCustomRange() {
  if (selectedPreset.value === 'custom') {
    const customPreset = presets.find(p => p.key === 'custom')!
    emit('update:modelValue', customPreset.getRange())
  }
}

watch([customStart, customEnd], updateCustomRange)

// Initialize custom inputs from modelValue if it's a custom range
watch(() => props.modelValue, (val) => {
  if (val.startDate) {
    customStart.value = val.startDate.split('T')[0]
  }
  if (val.endDate) {
    customEnd.value = val.endDate.split('T')[0]
  }
}, { immediate: true })
</script>

<template>
  <div class="space-y-3">
    <label v-if="label" class="block text-sm font-medium text-gray-700">
      {{ label }}
    </label>
    
    <!-- Preset buttons -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="preset in presets"
        :key="preset.key"
        type="button"
        :class="[
          'px-3 py-1.5 text-sm rounded-md border transition-colors',
          selectedPreset === preset.key
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        ]"
        @click="selectPreset(preset)"
      >
        {{ preset.label }}
      </button>
    </div>

    <!-- Custom date inputs -->
    <div v-if="showCustomInputs" class="flex items-center gap-3 mt-3">
      <div class="flex-1">
        <label class="block text-xs text-gray-500 mb-1">From</label>
        <input
          v-model="customStart"
          type="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        />
      </div>
      <div class="flex-1">
        <label class="block text-xs text-gray-500 mb-1">To</label>
        <input
          v-model="customEnd"
          type="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        />
      </div>
    </div>
  </div>
</template>
