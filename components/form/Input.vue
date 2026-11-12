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
      <input :id="inputId" ref="inputRef" v-bind="$attrs" :type="inputType" :inputmode="inputMode" :value="modelValue"
        :autocomplete="autocomplete ? 'on' : 'off'" :required="required" :maxlength="effectiveMaxLength"
        :title="inputTitle"
        @input="handleInput" @keydown="handleKeyDown" @keypress="handleKeyPress" @blur="handleBlur"
        :disabled="props.disabled || loading || ($attrs.disabled !== undefined && $attrs.disabled !== false)"
        :readonly="readonly || ($attrs.readonly !== undefined && $attrs.readonly !== false)"
        class="flex h-9 w-full rounded-lg border py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 truncate"
        :style="dynamicPaddingRight ? { paddingRight: dynamicPaddingRight } : undefined"
        :class="[
          readonly ? 'cursor-default select-none focus:ring-0 focus:border-theme-input' : '',
          error
            ? 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/10 dark:bg-red-950/10'
            : 'border-theme-input bg-theme-input focus:ring-emerald-500 focus:border-emerald-500',
          leftPaddingClass,
          rightPaddingClass,
          loading ? 'text-transparent select-none placeholder-transparent pointer-events-none' : ''
        ]" />

      <!-- Prefix (Icon or slot) -->
      <div v-if="!loading && (prefixIcon || $slots.prefix)"
        class="absolute left-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-400">
        <slot name="prefix">
          <Icon v-if="prefixIcon" :name="prefixIcon" class="text-sm" :class="prefixIconClass" />
        </slot>
      </div>

      <!-- Loading Overlay -->
      <div v-if="loading"
        class="absolute left-3 flex items-center gap-2 pointer-events-none text-sm text-slate-500 dark:text-slate-400 select-none">
        <svg class="animate-spin h-4 w-4 shrink-0 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span>{{ loadingText }}</span>
      </div>

      <!-- Suffixes -->
      <div v-if="effectiveSuffixes && effectiveSuffixes.length"
        ref="suffixesRef"
        class="absolute right-1.5 flex items-center gap-1 z-10">
        <button v-for="(suffix, idx) in effectiveSuffixes" :key="idx" type="button"
          :disabled="loading || props.disabled || suffix.disabled"
          @click="suffix.click?.()"
          :title="suffix.title || suffix.label || (suffix.icon === 'file-paste' ? 'Paste' : undefined)"
          class="flex items-center justify-center px-2 py-1 rounded-md text-xs font-medium focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          :class="[
            suffix.label
              ? 'bg-slate-100 dark:bg-theme-card hover:bg-slate-200 dark:hover:bg-theme-hover border border-slate-200 dark:border-theme-border text-slate-700 dark:text-slate-200 shadow-2xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-theme-hover'
          ]">
          <Icon v-if="suffix.icon" :name="suffix.icon" size="sm" class="text-slate-500 dark:text-slate-400" />
          <span v-if="suffix.label" :class="{ 'ml-1': Boolean(suffix.icon) }">{{ suffix.label }}</span>
        </button>
      </div>
    </div>

    <!-- Error message display -->
    <span v-if="typeof error === 'string' && error" class="text-xs text-red-500 dark:text-red-400 mt-0.5 font-normal">
      {{ error }}
    </span>

    <!-- Hint / Help Text -->
    <span v-if="hint || $slots.hint" :class="hintClass || 'text-slate-500 dark:text-slate-400'" class="text-xs mt-0.5">
      <slot name="hint">{{ hint }}</slot>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, useId, onMounted, onBeforeUnmount, useAttrs, useSlots, watch } from 'vue'

// Avoid inheriting attributes on the outer wrapper div
defineOptions({
  inheritAttrs: false
})

const attrs = useAttrs()
const slots = useSlots()

const suffixesRef = ref<HTMLElement | null>(null)
const suffixesWidth = ref(0)

const updateSuffixesWidth = () => {
  if (suffixesRef.value) {
    suffixesWidth.value = suffixesRef.value.offsetWidth
  } else {
    suffixesWidth.value = 0
  }
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  const hasAutofocus = attrs.autofocus === '' || attrs.autofocus === true || attrs.autoFocus === '' || attrs.autoFocus === true
  if (hasAutofocus) {
    setTimeout(() => {
      inputRef.value?.focus()
    }, 150)
  }

  nextTick(() => {
    updateSuffixesWidth()
    if (typeof ResizeObserver !== 'undefined' && suffixesRef.value) {
      resizeObserver = new ResizeObserver(() => {
        updateSuffixesWidth()
      })
      resizeObserver.observe(suffixesRef.value)
    }
  })
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

export interface Suffix {
  label?: string
  icon?: string
  title?: string
  disabled?: boolean
  click?: () => void
}

export type FormatterType = 'ucwords' | 'ucfirst' | 'letters' | 'numeric' | 'decimal' | 'currency' | 'phone' | 'lower' | 'upper' | 'uppercase' | 'code'

interface Props {
  type?: string
  label?: string
  title?: string
  hint?: string
  hintClass?: string
  prefixIcon?: string
  prefixIconClass?: string
  /**
   * List of text formatters to apply strictly to user input:
   * - 'ucwords': Capitalizes the first letter of each word.
   * - 'ucfirst': Capitalizes the first letter of the first word.
   * - 'letters': Permits only alphabetical characters and spaces.
   * - 'numeric': Permits only digits (0-9).
   * - 'currency': Formats numbers using dot thousand separators.
   * - 'phone': Permits only digits, plus signs, dashes, and spaces, defaulting max length to 15 (ITU-T E.164 standard).
   * - 'lower': Converts input characters to lowercase.
   * - 'upper' / 'uppercase': Converts input characters to uppercase.
   * - 'code': Permits only uppercase letters, numbers, and dashes (converts lower to upper).
   */
  formatters?: FormatterType | FormatterType[]
  maxLength?: string | number
  required?: boolean
  readonly?: boolean
  disabled?: boolean
  error?: string | boolean
  suffixes?: Suffix[]
  loading?: boolean
  loadingText?: string
  autocomplete?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: undefined,
  label: '',
  title: undefined,
  hint: '',
  hintClass: '',
  prefixIcon: '',
  prefixIconClass: '',
  formatters: () => [],
  required: false,
  readonly: false,
  disabled: false,
  error: false,
  suffixes: () => [],
  loading: false,
  loadingText: 'Prosessing...',
  autocomplete: false
})

const modelValue = defineModel<string | number | null>({ default: '' })

const inputRef = ref<HTMLInputElement | null>(null)
const inputId = useId()

// Normalise formatters into an array of strict formatter types
const activeFormatters = computed<FormatterType[]>(() => {
  if (!props.formatters) return []
  if (Array.isArray(props.formatters)) return props.formatters
  return [props.formatters]
})

// Check if input is configured as a URL type
const isUrl = computed(() => {
  return props.type === 'url' || attrs.type === 'url'
})

// Clipboard paste handler for URL inputs
const handlePasteFromClipboard = async () => {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
      const text = await navigator.clipboard.readText()
      if (text) {
        const val = text.trim()
        const formatted = applyFormat(val)
        modelValue.value = formatted
        if (inputRef.value) {
          inputRef.value.value = formatted
          inputRef.value.dispatchEvent(new Event('input', { bubbles: true }))
          inputRef.value.dispatchEvent(new Event('change', { bubbles: true }))
          inputRef.value.focus()
        }
      }
    }
  } catch (err) {
    console.error('Failed to read clipboard:', err)
  }
}

// Compute merged suffixes, automatically appending 'file-paste' icon button for type="url"
const effectiveSuffixes = computed<Suffix[]>(() => {
  const list = [...(props.suffixes || [])]
  if (isUrl.value) {
    const hasPaste = list.some(s => s.label?.toLowerCase() === 'paste' || s.icon === 'file-paste')
    if (!hasPaste) {
      list.push({
        icon: 'file-paste',
        title: 'Paste',
        click: handlePasteFromClipboard
      })
    }
  }
  return list
})

watch(
  () => effectiveSuffixes.value,
  async () => {
    await nextTick()
    updateSuffixesWidth()
    if (resizeObserver && suffixesRef.value) {
      resizeObserver.disconnect()
      resizeObserver.observe(suffixesRef.value)
    }
  },
  { deep: true }
)

const dynamicPaddingRight = computed(() => {
  if (suffixesWidth.value > 0) {
    return `${suffixesWidth.value + 12}px`
  }
  return undefined
})

const leftPaddingClass = computed(() => {
  if (props.loading || props.prefixIcon || Boolean(slots.prefix)) return 'pl-9'
  return 'pl-3'
})

const rightPaddingClass = computed(() => {
  if (!effectiveSuffixes.value || effectiveSuffixes.value.length === 0) return 'pr-3'
  if (suffixesWidth.value > 0) return ''
  const totalLabelLength = effectiveSuffixes.value.reduce((acc, s) => acc + (s.label ? s.label.length : 0), 0)
  if (totalLabelLength > 10) return 'pr-44'
  if (effectiveSuffixes.value.length === 1) {
    return effectiveSuffixes.value[0]?.label ? 'pr-20' : 'pr-10'
  }
  if (effectiveSuffixes.value.length === 2) return 'pr-28'
  return 'pr-36'
})

// When using the currency or phone formatter and no explicit maxLength is provided,
// default to 15 (E.164 standard for phone numbers, or 12 digits + separators for currency)
const effectiveMaxLength = computed(() => {
  if (props.maxLength !== undefined && props.maxLength !== '') return props.maxLength
  if (activeFormatters.value.includes('currency')) return 15
  if (activeFormatters.value.includes('phone')) return 15
  return undefined
})

// Check if formatters contain numeric or currency
const isNumericOrCurrency = computed(() => {
  return activeFormatters.value.includes('numeric') || activeFormatters.value.includes('currency')
})

// Resolve input title tooltip. Prioritises custom title, falling back to full string model value
const inputTitle = computed<string | undefined>(() => {
  if (props.title) return props.title
  if (typeof attrs.title === 'string' && attrs.title) return attrs.title
  if (typeof modelValue.value === 'string' && modelValue.value) return modelValue.value
  return undefined
})

// Set input type. We use 'text' for formatted numeric/currency inputs
// so that thousand separators can be parsed and rendered correctly.
const inputType = computed(() => {
  if (isNumericOrCurrency.value) {
    return 'text'
  }
  if (activeFormatters.value.includes('phone')) {
    return 'tel'
  }
  if (isUrl.value) {
    return 'url'
  }
  if (props.type) {
    return props.type
  }
  if (attrs.type) {
    return attrs.type as string
  }
  return 'text'
})

// Determine input mode for mobile keyboard mapping
const inputMode = computed(() => {
  if (activeFormatters.value.includes('currency') || activeFormatters.value.includes('decimal')) {
    return 'decimal'
  }
  if (activeFormatters.value.includes('numeric')) {
    return 'numeric'
  }
  if (activeFormatters.value.includes('phone')) {
    return 'tel'
  }
  if (isUrl.value) {
    return 'url'
  }
  return undefined
})

// Multiply value by 1,000 (append ribuan) when 'k' or 'K' is pressed
const handleThousandsShortcut = () => {
  const input = inputRef.value
  const currentVal = input ? input.value : String(modelValue.value || '')
  const rawDigits = currentVal.replace(/\D/g, '')

  if (!rawDigits || /^0+$/.test(rawDigits)) {
    return
  }

  const cleanDigits = rawDigits.replace(/^0+/, '')
  const newRaw = cleanDigits + '000'
  const formatted = applyFormat(newRaw)

  if (effectiveMaxLength.value) {
    const maxLen = Number(effectiveMaxLength.value)
    if (!isNaN(maxLen) && formatted.length > maxLen) {
      return
    }
  }

  modelValue.value = formatted
  if (input) {
    input.value = formatted
    input.setSelectionRange(formatted.length, formatted.length)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }
}

// Keydown handler to capture shortcuts like 'k'/'K'
const handleKeyDown = (event: KeyboardEvent) => {
  if (
    props.readonly ||
    (attrs.readonly !== undefined && attrs.readonly !== false) ||
    props.loading ||
    (attrs.disabled !== undefined && attrs.disabled !== false)
  ) {
    return
  }

  // Multiply by 1000 on 'k' / 'K' key for currency or numeric formatters
  if (isNumericOrCurrency.value && (event.key === 'k' || event.key === 'K')) {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return
    }
    event.preventDefault()
    handleThousandsShortcut()
  }
}

// Keypress handler to prevent entering invalid characters for formatters
const handleKeyPress = (event: KeyboardEvent) => {
  const char = event.key

  // Allow copy-paste, navigation, shortcuts, backspace/delete, etc.
  if (event.ctrlKey || event.metaKey || char.length > 1) {
    return
  }

  if (activeFormatters.value.includes('decimal')) {
    // Only allow digits (0-9), dot (.), and comma (,)
    if (!/^[\d.,]$/.test(char)) {
      event.preventDefault()
    }
  } else if (isNumericOrCurrency.value) {
    // Only allow digits (0-9)
    if (!/^\d$/.test(char)) {
      event.preventDefault()
    }
  } else if (activeFormatters.value.includes('phone')) {
    // Only allow digits, +, -, and spaces
    if (!/^[\d\+\-\s]$/.test(char)) {
      event.preventDefault()
    }
  } else if (activeFormatters.value.includes('letters')) {
    // Only allow letters (a-z, A-Z) and spaces
    if (!/^[a-zA-Z\s]$/.test(char)) {
      event.preventDefault()
    }
  } else if (activeFormatters.value.includes('code')) {
    // Only allow letters (a-z, A-Z), numbers (0-9), and dashes (-)
    if (!/^[a-zA-Z0-9-]$/.test(char)) {
      event.preventDefault()
    }
  }
}

// Function to apply formatting based on the selected formatters
const applyFormat = (val: string): string => {
  if (!val) return ''

  let result = val
  const fmts = activeFormatters.value

  // For decimal, allow digits, dots, and commas. Only keep the first separator
  if (fmts.includes('decimal')) {
    result = result.replace(/[^0-9.,]/g, '')
    let separatorFound = false
    result = result.replace(/[.,]/g, (match) => {
      if (!separatorFound) {
        separatorFound = true
        return match
      }
      return ''
    })
  } else if (fmts.includes('numeric') || fmts.includes('currency')) {
    // For numeric or currency, we first strip any non-digit character
    result = result.replace(/\D/g, '')
  }

  // For phone numbers, strip non-phone characters
  if (fmts.includes('phone')) {
    result = result.replace(/[^\d\+\-\s]/g, '')
  }

  // For letters only, strip any non-letter and non-space characters
  if (fmts.includes('letters')) {
    result = result.replace(/[^a-zA-Z\s]/g, '')
  }

  // For code, strip any non-alphanumeric and non-dash characters
  if (fmts.includes('code')) {
    result = result.replace(/[^a-zA-Z0-9-]/g, '')
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
    } else if (formatter === 'lower') {
      result = result.toLowerCase()
    } else if (formatter === 'upper' || formatter === 'uppercase' || formatter === 'code') {
      result = result.toUpperCase()
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

watch(() => modelValue.value, (newVal) => {
  if (newVal !== null && newVal !== undefined) {
    const formatted = applyFormat(String(newVal))
    if (formatted !== String(newVal)) {
      modelValue.value = formatted
    }
  }
}, { immediate: true })

// Input event handler with cursor position tracking
const handleInput = (event: Event) => {
  const input = event.target as HTMLInputElement
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
  const input = event.target as HTMLInputElement
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
