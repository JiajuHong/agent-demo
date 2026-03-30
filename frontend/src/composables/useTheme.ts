import { ref, watchEffect } from 'vue'

const THEME_KEY = 'chat-theme'
const isDark = ref(false)

try {
  const savedTheme = localStorage.getItem(THEME_KEY)
  if (savedTheme === 'dark') {
    isDark.value = true
  } else if (savedTheme === 'light') {
    isDark.value = false
  }
} catch {
  // 在不可用的环境中忽略存储读取失败
}

export function useTheme() {
  watchEffect(() => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    try {
      localStorage.setItem(THEME_KEY, isDark.value ? 'dark' : 'light')
    } catch {
      // 在不可用的环境中忽略存储写入失败
    }
  })

  function toggleTheme() {
    isDark.value = !isDark.value
  }

  return { isDark, toggleTheme }
}
