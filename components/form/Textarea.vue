<template>
  <div class="flex flex-col gap-1 w-full" :class="{ 'flex-1 min-h-0': grow }">
    <!-- Label -->
    <label v-if="label" :for="inputId"
      class="text-sm font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-0.5 self-start">
      <span>{{ label }}</span>
      <span v-if="required" class="text-red-500 font-bold" aria-hidden="true">*</span>
    </label>

    <!-- Textarea wrapper -->
    <div class="relative w-full" :class="{ 'flex-1 min-h-0 flex flex-col': grow }">
      <textarea :id="inputId" ref="inputRef" v-bind="$attrs" :value="modelValue" :required="required"
        :maxlength="maxLength" :rows="grow ? undefined : rows" @input="handleInput" @keypress="handleKeyPress"
        @blur="handleBlur"
        class="flex w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
        :class="[
          grow ? 'flex-1 min-h-[220px] resize-none' : 'min-h-[108px]',
          resizeClass,
          error
            ? 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/10 dark:bg-red-950/10'
            : 'border-theme-input bg-theme-input focus:ring-emerald-500 focus:border-emerald-500'
        ]" />
    </div>

    <!-- Error message display -->
    <span v-if="typeof error === 'string' && error" class="text-xs text-red-500 dark:text-red-400 mt-0.5 font-normal">
      {{ error }}
    </span>

    <!-- Hint / Help Text & Character Count -->
    <div v-if="hint || showCount" class="flex items-center justify-between gap-2 mt-0.5">
      <span v-if="hint" class="text-xs text-slate-500 dark:text-slate-400">
        {{ hint }}
      </span>
      <span v-else class="flex-1"></span>
      <span v-if="showCount"
        class="text-xs text-slate-400 dark:text-slate-500 font-medium tabular-nums shrink-0 ml-auto">
        {{ (modelValue || '').length }}{{ maxLength ? ` / ${maxLength}` : '' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, useId, onMounted } from 'vue'

// Avoid inheriting attributes on the outer wrapper div
defineOptions({
  inheritAttrs: false
})

interface Props {
  label?: string
  hint?: string
  formatters?: string | string[]
  maxLength?: string | number
  required?: boolean
  rows?: string | number
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
  autoFocus?: boolean
  error?: string | boolean
  grow?: boolean
  showCount?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  hint: '',
  formatters: () => [],
  required: false,
  rows: 3,
  resize: 'vertical',
  autoFocus: false,
  error: false,
  grow: false,
  showCount: false
})

const modelValue = defineModel<string | null>({ default: '' })

const inputRef = ref<HTMLTextAreaElement | null>(null)
const inputId = useId()

onMounted(() => {
  if (props.autoFocus) {
    setTimeout(() => {
      inputRef.value?.focus()
    }, 150)
  }
})

// Normalise formatters into an array of strings
const activeFormatters = computed<string[]>(() => {
  if (!props.formatters) return []
  if (Array.isArray(props.formatters)) return props.formatters
  return [props.formatters]
})

// Check if formatters contain numeric, number or currency
const isNumericOrCurrency = computed(() => {
  return activeFormatters.value.includes('numeric') || activeFormatters.value.includes('number') || activeFormatters.value.includes('currency')
})

// Map resize prop to Tailwind class
const resizeClass = computed(() => {
  switch (props.resize) {
    case 'none':
      return 'resize-none'
    case 'horizontal':
      return 'resize-x'
    case 'both':
      return 'resize'
    case 'vertical':
    default:
      return 'resize-y'
  }
})

// Keypress handler to prevent entering non-numeric characters for numeric/currency formatters
const handleKeyPress = (event: KeyboardEvent) => {
  if (isNumericOrCurrency.value) {
    const char = event.key

    // Allow copy-paste, navigation, shortcuts, backspace/delete, etc.
    if (event.ctrlKey || event.metaKey || char.length > 1) {
      return
    }

    // Only allow digits (0-9)
    if (!/^\d$/.test(char)) {
      event.preventDefault()
    }
  }
}

// Function to apply formatting based on the selected formatters
const applyFormat = (val: string): string => {
  if (!val) return ''

  let result = val
  const fmts = activeFormatters.value

  // For numeric/number or currency, we first strip any non-digit character
  if (fmts.includes('numeric') || fmts.includes('number') || fmts.includes('currency')) {
    result = result.replace(/\D/g, '')
  }

  // Process all active formatters
  for (const formatter of fmts) {
    if (formatter === 'ucwords') {
      result = result.replace(/\b\w/g, (c) => c.toUpperCase())
    } else if (formatter === 'ucfirst') {
      const trimmed = result.trimStart()
      const leading = result.slice(0, result.length - trimmed.length)
      if (/^(https?:\/\/|www\.)/i.test(trimmed)) {
        result = leading + trimmed.replace(/^(https?:\/\/|www\.)/i, (m) => m.toLowerCase())
      } else {
        result = result.charAt(0).toUpperCase() + result.slice(1)
      }
    } else if (formatter === 'currency') {
      // Format with dot thousand separator (Indonesian standard)
      result = result.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    }
  }

  // Handle maxLength restriction
  if (props.maxLength !== undefined && props.maxLength !== '') {
    const limit = Number(props.maxLength)
    if (!isNaN(limit) && result.length > limit) {
      result = result.slice(0, limit)
    }
  }

  return result
}

// Input event handler with cursor position tracking
const handleInput = (event: Event) => {
  const input = event.target as HTMLTextAreaElement
  const originalValue = input.value
  const selectionStart = input.selectionStart

  const formattedValue = applyFormat(originalValue)
  modelValue.value = formattedValue

  // Schedule cursor position restoration
  nextTick(() => {
    input.value = formattedValue
    if (selectionStart !== null) {
      if (isNumericOrCurrency.value) {
        // Track the cursor position by counting digits before the cursor
        const beforeCursor = originalValue.slice(0, selectionStart)
        const digitsBeforeCursor = beforeCursor.replace(/\D/g, '').length

        let newSelectionStart = 0
        let digitsFound = 0
        while (newSelectionStart < formattedValue.length && digitsFound < digitsBeforeCursor) {
          if (/\d/.test(formattedValue.charAt(newSelectionStart))) {
            digitsFound++
          }
          newSelectionStart++
        }

        input.setSelectionRange(newSelectionStart, newSelectionStart)
      } else {
        // For standard casing formatters, string length remains unchanged
        input.setSelectionRange(selectionStart, selectionStart)
      }
    }
  })
}

// Blur handler to apply formats on final leave
const handleBlur = (event: FocusEvent) => {
  const input = event.target as HTMLTextAreaElement
  const formattedValue = applyFormat(input.value)
  modelValue.value = formattedValue
  input.value = formattedValue
}

defineExpose({
  focus: () => {
    inputRef.value?.focus()
  }
})
</script>