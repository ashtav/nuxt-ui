<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'

const router = useRouter()
const progress = ref(0)
const isLoading = ref(false)

let stepTimer: ReturnType<typeof setInterval> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null
let resetTimer: ReturnType<typeof setTimeout> | null = null

const clearTimers = () => {
  if (stepTimer) {
    clearInterval(stepTimer)
    stepTimer = null
  }
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  if (resetTimer) {
    clearTimeout(resetTimer)
    resetTimer = null
  }
}

router.beforeEach((to, from) => {
  // Hanya picu loading jika benar-benar berpindah halaman (path berbeda).
  // Jika path sama (misal hanya query parameter atau tab modal seperti ?t=a ke ?t=b), abaikan sepenuhnya!
  if (to.path === from.path) {
    return
  }

  clearTimers()
  isLoading.value = true
  progress.value = 25

  stepTimer = setInterval(() => {
    if (progress.value < 85) {
      const diff = 90 - progress.value
      progress.value += Math.max(1, Math.floor(diff * 0.15))
    }
  }, 100)
})

router.afterEach((to, from) => {
  if (to.path === from.path) {
    return
  }

  if (stepTimer) {
    clearInterval(stepTimer)
    stepTimer = null
  }

  progress.value = 100

  hideTimer = setTimeout(() => {
    isLoading.value = false
    resetTimer = setTimeout(() => {
      progress.value = 0
    }, 400)
  }, 300)
})

onBeforeUnmount(() => {
  clearTimers()
})
</script>

<template>
  <div
    class="fixed top-0 left-0 right-0 z-[999999] pointer-events-none transition-all duration-300 ease-out"
    :style="{
      height: '3px',
      opacity: isLoading ? 1 : 0,
      background: '#10b981',
      boxShadow: isLoading ? '0 0 10px rgba(16, 185, 129, 0.7)' : 'none',
      transform: `scaleX(${progress / 100})`,
      transformOrigin: 'left'
    }"
  />
</template>
