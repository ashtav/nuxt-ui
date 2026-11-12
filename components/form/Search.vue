<template>
  <div class="flex flex-col gap-1 w-full">
    <!-- Label -->
    <label v-if="label" :for="inputId"
      class="text-sm font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-0.5 self-start px-0">
      <span>{{ label }}</span>
      <span v-if="required" class="text-red-500 font-bold" aria-hidden="true">*</span>
    </label>

    <!-- Input wrapper -->
    <div class="relative w-full flex items-center">
      <!-- Prefix Icon or Loading Spinner -->
      <span v-if="prefixIcon || loading"
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
        <!-- Circular Loading Indicator -->
        <svg v-if="loading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          class="h-4 w-4 animate-spin text-emerald-500 dark:text-emerald-400">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
        </svg>
        <!-- Standard Prefix Icon -->
        <Icon v-else :name="prefixIcon" class="text-sm" />
      </span>

      <!-- Input Tag -->
      <input :id="inputId" ref="inputRef" v-bind="$attrs" type="text" v-model="modelValue" :required="required"
        :disabled="disabled" @keydown.enter="handleEnter"
        class="flex h-9 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
        :class="[
          error
            ? 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/10 dark:bg-red-950/10'
            : (borderClass || 'border-theme-input') + ' bg-theme-input focus:ring-emerald-500 focus:border-emerald-500',
          (prefixIcon || loading) ? 'pl-9' : 'pl-3',
          modelValue ? 'pr-9' : 'pr-3'
        ]" />

      <!-- Clear/Cancel button -->
      <button v-if="modelValue" @click="handleClear"
        class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors cursor-pointer"
        type="button" title="Clear search">
        <Icon name="cancel-01" class="text-sm" />
      </button>
    </div>

    <!-- Error message display -->
    <span v-if="typeof error === 'string' && error" class="text-xs text-red-500 dark:text-red-400 mt-0.5 font-normal">
      {{ error }}
    </span>

    <!-- Hint / Help Text -->
    <span v-if="hint" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
      {{ hint }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, useId, onMounted, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false
})

const attrs = useAttrs()

interface Props {
  label?: string
  hint?: string
  debounce?: number
  prefixIcon?: string
  required?: boolean
  error?: string | boolean
  disabled?: boolean
  searchOnEnter?: boolean
  loading?: boolean
  borderClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  hint: '',
  debounce: 300,
  prefixIcon: 'search-01',
  required: false,
  error: false,
  disabled: false,
  searchOnEnter: false,
  loading: false,
  borderClass: ''
})

const emit = defineEmits<{
  (e: 'search', val: string): void
}>()

const modelValue = defineModel<string>({ default: '' })
const inputRef = ref<HTMLInputElement | null>(null)
const inputId = useId()

onMounted(() => {
  const hasAutofocus = attrs.autofocus === '' || attrs.autofocus === true || attrs.autoFocus === '' || attrs.autoFocus === true
  if (hasAutofocus) {
    setTimeout(() => {
      inputRef.value?.focus()
    }, 150)
  }
})

let timeoutId: any = null

watch(modelValue, (newVal) => {
  if (props.searchOnEnter) return
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    emit('search', newVal)
  }, props.debounce)
})

const handleEnter = (e: KeyboardEvent) => {
  if (props.searchOnEnter) {
    if (timeoutId) clearTimeout(timeoutId)
    emit('search', modelValue.value)
  }
}

const handleClear = () => {
  modelValue.value = ''
  if (timeoutId) clearTimeout(timeoutId)
  emit('search', '')
}
</script>
