import { ref, watch, onMounted } from 'vue'

const DARK_MODE_KEY = 'tix-dark-mode'

const isDark = ref(false)

function initDarkMode() {
  // Check localStorage first
  const stored = localStorage.getItem(DARK_MODE_KEY)
  if (stored !== null) {
    isDark.value = stored === 'true'
  } else {
    // Fall back to system preference
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyDarkMode()
}

function applyDarkMode() {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

function toggleDarkMode() {
  isDark.value = !isDark.value
  localStorage.setItem(DARK_MODE_KEY, isDark.value.toString())
  applyDarkMode()
}

function setDarkMode(value: boolean) {
  isDark.value = value
  localStorage.setItem(DARK_MODE_KEY, value.toString())
  applyDarkMode()
}

export function useDarkMode() {
  onMounted(() => {
    initDarkMode()
  })

  // Watch for changes
  watch(isDark, () => {
    applyDarkMode()
  })

  return {
    isDark,
    toggleDarkMode,
    setDarkMode,
  }
}
