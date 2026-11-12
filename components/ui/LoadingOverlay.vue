<template>
  <div v-if="loadingState.open"
    class="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
    <div
      class="bg-white dark:bg-theme-card border border-slate-200 dark:border-theme-border p-6 rounded-2xl shadow-2xl flex flex-col items-center min-w-[240px] max-w-[320px] mx-4 text-center space-y-4">
      <!-- Spinner -->
      <div class="relative w-12 h-12">
        <!-- Outer border -->
        <div class="w-12 h-12 rounded-full border-[3px] border-slate-100 dark:border-theme-border"></div>
        <!-- Spinning indicator -->
        <div
          class="absolute inset-0 rounded-full border-[3px] border-transparent border-t-emerald-500 dark:border-t-emerald-400 border-r-emerald-500 dark:border-r-emerald-400 animate-spin">
        </div>
      </div>

      <!-- Text -->
      <div class="space-y-1">
        <p v-if="loadingState.title" class="text-sm font-bold text-slate-900 dark:text-white">
          {{ loadingState.title }}
        </p>
        <p v-if="loadingState.message" class="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
          {{ loadingState.message ?? 'Loading...' }}
        </p>
      </div>

      <!-- Cancel button (only rendered if onCancel handler exists) -->
      <UiButton v-if="loadingState.onCancel" size="sm" variant="outline" @click="handleCancel"
        class="w-full flex items-center justify-center gap-1.5 h-9" icon="cancel-01">
        Cancel
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'
import { loadingState, ui } from '../../composables/ui'

const handleCancel = () => {
  loadingState.onCancel?.()
  ui.closeLoading()
}

watch(() => loadingState.open, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>
