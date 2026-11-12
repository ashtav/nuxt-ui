import { ref } from 'vue'

const isDark = ref(false)
const radius = ref('0.55rem')

export function useTheme() {
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
    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    const html = document.documentElement
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      isDark.value = true
      html.classList.add('dark')
    } else {
      isDark.value = false
      html.classList.remove('dark')
    }

    const savedRadius = localStorage.getItem('theme-radius')
    if (savedRadius) {
      radius.value = savedRadius
      html.style.setProperty('--radius', savedRadius)
    }
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
