import { ref } from 'vue'

const isMinimized = ref(false)

export function useSidebar() {
  const toggleMinimize = () => {
    if (!import.meta.client) return
    isMinimized.value = !isMinimized.value
    localStorage.setItem('sidebar-minimized', isMinimized.value ? 'true' : 'false')
  }

  const initSidebar = () => {
    if (!import.meta.client) return
    const saved = localStorage.getItem('sidebar-minimized')
    isMinimized.value = saved === 'true'
  }

  return {
    isMinimized,
    toggleMinimize,
    initSidebar
  }
}
