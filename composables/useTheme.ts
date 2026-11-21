import { ref } from 'vue'

const isDark = ref(false)
const radius = ref('0.55rem')

export function useTheme() {
  const getConfigDefaults = () => {
    try {
      const config = useRuntimeConfig?.()
      return config?.public?.nuxtUi || { radius: '0.55rem', defaultTheme: 'system' }
    } catch {
      return { radius: '0.55rem', defaultTheme: 'system' }
    }
  }

  const setTheme = (dark: boolean, saveBackend = false) => {
    if (!import.meta.client) return
    isDark.value = dark
    const html = document.documentElement
    if (dark) {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }

    if (saveBackend) {
      try {
        const nuxtApp = useNuxtApp?.()
        nuxtApp?.hooks?.callHook('theme:change', dark)
      } catch (err) {}
    }
  }

  const toggleTheme = (saveBackend: boolean | unknown = false) => {
    if (!import.meta.client) return
    const shouldSave = typeof saveBackend === 'boolean' ? saveBackend : false
    setTheme(!isDark.value, shouldSave)
  }

  const setRadius = (val: string) => {
    if (!import.meta.client) return
    radius.value = val
    document.documentElement.style.setProperty('--radius', val)
    localStorage.setItem('theme-radius', val)
  }

  const initTheme = () => {
    if (!import.meta.client) return
    const defaults = getConfigDefaults()
    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    const html = document.documentElement
    const shouldBeDark =
      savedTheme === 'dark' ||
      (!savedTheme && (defaults.defaultTheme === 'dark' || (defaults.defaultTheme === 'system' && systemPrefersDark)))

    if (shouldBeDark) {
      isDark.value = true
      html.classList.add('dark')
    } else {
      isDark.value = false
      html.classList.remove('dark')
    }

    const activeRadius = localStorage.getItem('theme-radius') || defaults.radius || '0.55rem'
    radius.value = activeRadius
    html.style.setProperty('--radius', activeRadius)
  }

  return {
    isDark,
    radius,
    toggleTheme,
    setTheme,
    setRadius,
    initTheme
  }
}
