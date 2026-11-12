<template>
  <div class="flex flex-col gap-1 w-full" :class="{ 'relative': !isFullscreen }">
    <!-- Backdrop when fullscreen -->
    <div v-if="isFullscreen" class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 transition-opacity" @click="toggleFullscreen" />

    <!-- Label -->
    <label v-if="label && !isFullscreen" :for="inputId"
      class="text-sm font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-0.5 self-start">
      <span>{{ label }}</span>
      <span v-if="required" class="text-red-500 font-bold" aria-hidden="true">*</span>
    </label>

    <!-- Editor Container -->
    <div
      class="flex flex-col rounded-lg border bg-theme-input border-theme-input transition-all focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500"
      :class="[
        isFullscreen
          ? 'fixed inset-10 md:inset-20 z-50 shadow-2xl flex flex-col bg-theme-card'
          : 'relative min-h-[160px] flex flex-col',
        error ? 'border-red-500 dark:border-red-500 focus-within:ring-red-500 focus-within:border-red-500 bg-red-50/10 dark:bg-red-950/10' : ''
      ]">
      
      <!-- Toolbar -->
      <div class="flex items-center justify-between border-b border-theme-border px-3 py-1.5 bg-slate-50 dark:bg-theme-card rounded-t-lg select-none">
        <!-- Text Actions -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <button type="button" @click="execCmd('bold')" title="Bold"
            class="p-1 rounded cursor-pointer transition-colors flex items-center justify-center"
            :class="activeStates.bold
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold'
              : 'hover:bg-slate-200 dark:hover:bg-theme-hover text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'">
            <Icon name="text-bold" class="text-sm" />
          </button>
          <button type="button" @click="execCmd('italic')" title="Italic"
            class="p-1 rounded cursor-pointer transition-colors flex items-center justify-center"
            :class="activeStates.italic
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold'
              : 'hover:bg-slate-200 dark:hover:bg-theme-hover text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'">
            <Icon name="text-italic" class="text-sm" />
          </button>
          <button type="button" @click="execCmd('underline')" title="Underline"
            class="p-1 rounded cursor-pointer transition-colors flex items-center justify-center"
            :class="activeStates.underline
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold'
              : 'hover:bg-slate-200 dark:hover:bg-theme-hover text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'">
            <Icon name="text-underline" class="text-sm" />
          </button>
          
          <div class="w-px h-4 bg-theme-border mx-1 self-center" />

          <button type="button" @click="execCmd('insertUnorderedList')" title="Bullet List"
            class="p-1 rounded cursor-pointer transition-colors flex items-center justify-center"
            :class="activeStates.bulletList
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold'
              : 'hover:bg-slate-200 dark:hover:bg-theme-hover text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'">
            <Icon name="left-to-right-list-bullet" class="text-sm" />
          </button>
          <button type="button" @click="execCmd('insertOrderedList')" title="Numbered List"
            class="p-1 rounded cursor-pointer transition-colors flex items-center justify-center"
            :class="activeStates.orderedList
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold'
              : 'hover:bg-slate-200 dark:hover:bg-theme-hover text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'">
            <Icon name="left-to-right-list-number" class="text-sm" />
          </button>
          
          <div class="w-px h-4 bg-theme-border mx-1 self-center" />

          <button type="button" @click="execCmd('removeFormat')" title="Clear Formatting"
            class="p-1 rounded hover:bg-slate-200 dark:hover:bg-theme-hover text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors flex items-center justify-center">
            <Icon name="eraser" class="text-sm" />
          </button>
        </div>

        <!-- Fullscreen Toggle -->
        <div>
          <button type="button" @click="toggleFullscreen" :title="isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'"
            class="p-1 rounded hover:bg-slate-200 dark:hover:bg-theme-hover text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors flex items-center justify-center">
            <Icon :name="isFullscreen ? 'minimize-screen' : 'maximize-screen'" class="text-sm" />
          </button>
        </div>
      </div>

      <!-- Editable Wrapper -->
      <div class="relative flex-1 flex flex-col min-h-[120px] focus-within:outline-none" :class="[isFullscreen ? 'min-h-0' : '']">
        <!-- Floating Placeholder -->
        <div v-if="isEmpty" 
          class="absolute top-2.5 left-3 text-sm text-slate-400 dark:text-slate-500 pointer-events-none select-none">
          {{ placeholder }}
        </div>

        <!-- Editable Body -->
        <div :id="inputId" ref="editorRef" contenteditable="true" @input="onInput" @blur="onBlur"
          class="flex-1 w-full px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none overflow-y-auto rich-text-content outline-none" />
      </div>
      
      <!-- Footer Info -->
      <div v-if="isFullscreen" class="border-t border-theme-border px-3 py-1.5 bg-slate-50 dark:bg-theme-card rounded-b-lg flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 select-none">
        <span>Press <kbd class="px-1.5 py-0.5 bg-slate-200 dark:bg-theme-hover rounded font-semibold text-slate-700 dark:text-slate-300">ESC</kbd> or click the expand button to close</span>
        <span>Word count: {{ wordCount }}</span>
      </div>
    </div>

    <!-- Error message display -->
    <span v-if="typeof error === 'string' && error && !isFullscreen" class="text-xs text-red-500 dark:text-red-400 mt-0.5 font-normal">
      {{ error }}
    </span>

    <!-- Hint / Help Text -->
    <span v-if="hint && !isFullscreen" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
      {{ hint }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, useId, onMounted, onBeforeUnmount, computed } from 'vue'

interface Props {
  label?: string
  hint?: string
  required?: boolean
  placeholder?: string
  error?: string | boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  hint: '',
  required: false,
  placeholder: 'Type here...',
  error: false
})

const modelValue = defineModel<string>({ default: '' })
const emit = defineEmits<{
  (e: 'blur'): void
}>()

const editorRef = ref<HTMLDivElement | null>(null)
const inputId = useId()
const isFullscreen = ref(false)

// Sync model value to editor innerHTML
watch(() => modelValue.value, (newVal) => {
  if (editorRef.value && editorRef.value.innerHTML !== newVal) {
    editorRef.value.innerHTML = newVal || ''
  }
}, { immediate: true })

const activeStates = ref({
  bold: false,
  italic: false,
  underline: false,
  bulletList: false,
  orderedList: false
})

const updateActiveStates = () => {
  if (!editorRef.value) return
  activeStates.value = {
    bold: document.queryCommandState('bold'),
    italic: document.queryCommandState('italic'),
    underline: document.queryCommandState('underline'),
    bulletList: document.queryCommandState('insertUnorderedList'),
    orderedList: document.queryCommandState('insertOrderedList')
  }
}

onMounted(() => {
  if (editorRef.value) {
    editorRef.value.innerHTML = modelValue.value || ''
  }
  window.addEventListener('keydown', handleEscKey)
  document.addEventListener('selectionchange', updateActiveStates)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscKey)
  document.removeEventListener('selectionchange', updateActiveStates)
})

const handleEscKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isFullscreen.value) {
    toggleFullscreen()
  }
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  // Auto-focus when switching to full screen
  setTimeout(() => {
    editorRef.value?.focus()
  }, 100)
}

const execCmd = (command: string, value: string = '') => {
  document.execCommand(command, false, value)
  onInput()
  editorRef.value?.focus()
  updateActiveStates()
}

const onInput = () => {
  if (editorRef.value) {
    modelValue.value = editorRef.value.innerHTML
  }
}

const onBlur = () => {
  emit('blur')
}

// Empty check helper to show placeholder correctly even with <br> or empty tags
const isEmpty = computed(() => {
  if (!modelValue.value) return true
  // Strip tags and whitespace to check if there is actual content
  const cleanText = modelValue.value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
  return cleanText === ''
})

// Word count calculation
const wordCount = computed(() => {
  if (!modelValue.value) return 0
  // Remove HTML tags for counting words
  const text = modelValue.value.replace(/<[^>]*>/g, ' ').trim()
  if (!text) return 0
  return text.split(/\s+/).length
})
</script>


