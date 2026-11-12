<template>
  <div class="flex flex-col gap-1 w-full">
    <!-- Label -->
    <label v-if="label" :for="inputId"
      class="text-sm font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-0.5 self-start">
      <span>{{ label }}</span>
      <span v-if="required" class="text-red-500 font-bold" aria-hidden="true">*</span>
    </label>

    <!-- Input wrapper -->
    <div class="relative w-full flex items-center">
      <!-- Hidden file input -->
      <input type="file" ref="fileInputRef" class="hidden" :accept="accept" :multiple="multiple"
        @change="handleFileChange" />

      <!-- Readonly TextInput showing filename -->
      <input :id="inputId" type="text" readonly :value="selectedFileName" :placeholder="placeholder"
        class="truncate flex h-9 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-white bg-slate-50/30 dark:bg-theme-input/30 placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        :class="[
          displayError
            ? 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/10 dark:bg-red-950/10'
            : 'border-theme-input bg-theme-input focus:ring-emerald-500 focus:border-emerald-500',
          hasValue ? 'pr-32' : 'pr-[100px]'
        ]" @click="triggerFileSelect" />

      <!-- Suffix Actions -->
      <div class="absolute right-1 flex items-center gap-1.5">
        <!-- Minimalist Delete button -->
        <button v-if="hasValue" type="button" @click="clearFile"
          class="flex items-center justify-center w-7 h-7 rounded-md text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors border border-transparent focus:outline-none cursor-pointer"
          title="Remove file">
          <Icon name="delete-02" size="sm" />
        </button>

        <!-- Minimalist Select File Button -->
        <button type="button" :disabled="loading" @click="triggerFileSelect"
          class="flex items-center justify-center gap-1 px-2.5 h-7 rounded-md text-slate-650 hover:text-emerald-600 dark:text-slate-350 dark:hover:text-emerald-450 hover:bg-slate-100 dark:hover:bg-theme-hover text-xs focus:outline-none transition-colors border border-theme-border cursor-pointer">
          <Icon name="file-attachment" size="xs" class="shrink-0 text-slate-400 dark:text-slate-500" />
          <span>Select file</span>
        </button>
      </div>
    </div>

    <!-- Error message display -->
    <span v-if="typeof displayError === 'string' && displayError"
      class="text-xs text-red-500 dark:text-red-400 mt-0.5 font-normal">
      {{ displayError }}
    </span>

    <!-- Hint / Help Text -->
    <span v-if="hint" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
      {{ hint }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useId, watch } from 'vue'

defineOptions({
  inheritAttrs: false
})

interface Props {
  label?: string
  hint?: string
  required?: boolean
  error?: string | boolean
  loading?: boolean
  placeholder?: string
  maxSize?: number // in MB
  minSize?: number // in MB
  accept?: string
  multiple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  hint: '',
  required: false,
  error: false,
  loading: false,
  placeholder: 'Select a file...',
  accept: '*/*',
  multiple: false
})

const emit = defineEmits<{
  (e: 'select', file: File | File[]): void
  (e: 'clear'): void
}>()

const modelValue = defineModel<string | string[] | null>({ default: '' })
const inputId = useId()
const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFileName = ref('')
const localError = ref<string | null>(null)

// Combine error prop and local validation error
const displayError = computed(() => {
  return localError.value || props.error
})

const hasValue = computed(() => {
  if (!modelValue.value) return false
  if (Array.isArray(modelValue.value)) return modelValue.value.length > 0
  return true
})

const triggerFileSelect = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  localError.value = null
  const files = Array.from(input.files)

  // Validate minSize for each file
  if (props.minSize !== undefined) {
    const minSizeBytes = props.minSize * 1024 * 1024
    for (const file of files) {
      if (file.size < minSizeBytes) {
        localError.value = `File size of ${file.name} must be at least ${props.minSize} MB.`
        input.value = ''
        return
      }
    }
  }

  // Validate maxSize for each file
  if (props.maxSize !== undefined) {
    const maxSizeBytes = props.maxSize * 1024 * 1024
    for (const file of files) {
      if (file.size > maxSizeBytes) {
        localError.value = `File size of ${file.name} must be less than ${props.maxSize} MB.`
        input.value = ''
        return
      }
    }
  }

  // Set file name (joined by comma if multiple)
  selectedFileName.value = files.map(f => f.name).join(', ')

  // Convert all files to base64
  const readFilesAsDataURL = (filesList: File[]): Promise<string[]> => {
    return Promise.all(
      filesList.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      })
    )
  }

  if (props.multiple) {
    emit('select', files)
    readFilesAsDataURL(files)
      .then(results => {
        modelValue.value = results
      })
      .catch(() => {
        localError.value = 'Failed to read one or more files.'
      })
  } else {
    const file = files[0]
    if (!file) return
    emit('select', file)
    const reader = new FileReader()
    reader.onloadend = () => {
      modelValue.value = reader.result as string
    }
    reader.readAsDataURL(file)
  }
}

const clearFile = () => {
  modelValue.value = props.multiple ? [] : ''
  selectedFileName.value = ''
  localError.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
  emit('clear')
}

watch(() => modelValue.value, (newVal) => {
  if (newVal) {
    if (Array.isArray(newVal)) {
      if (!selectedFileName.value) {
        selectedFileName.value = newVal.map(val => {
          if (typeof val === 'string') {
            if (val.startsWith('data:')) {
              return 'Selected File'
            }
            return val
          }
          return ''
        }).filter(Boolean).join(', ')
      }
    } else if (typeof newVal === 'string') {
      if (newVal.startsWith('data:')) {
        if (!selectedFileName.value) {
          selectedFileName.value = 'Selected File'
        }
      } else {
        selectedFileName.value = newVal
      }
    }
  } else {
    selectedFileName.value = ''
  }
}, { immediate: true })
</script>
