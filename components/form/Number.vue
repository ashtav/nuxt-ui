<template>
  <div class="flex flex-col gap-1 w-full select-none">
    <!-- Header: Label & Unit / Info Badge -->
    <div v-if="label || unit" class="flex items-center justify-between">
      <label v-if="label" :for="inputId" class="text-sm font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-0.5">
        <span>{{ label }}</span>
        <span v-if="required" class="text-red-500 font-bold" aria-hidden="true">*</span>
      </label>

      <!-- Unit Badge -->
      <span v-if="unit" class="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/40">
        {{ numericValue }} {{ unit }}
      </span>
    </div>

    <!-- Number Input with Suffix Minus & Plus Buttons -->
    <div class="relative w-full flex items-center">
      <input
        :id="inputId"
        ref="inputRef"
        type="text"
        inputmode="numeric"
        :value="displayValue"
        :placeholder="placeholder || `Min: ${min}`"
        :maxlength="maxlength"
        :disabled="disabled"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
        @keydown="handleKeyDown"
        @wheel="handleWheel"
        class="flex h-9 w-full rounded-lg border pl-3 pr-16 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
        :class="[
          error
            ? 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/10 dark:bg-red-950/10'
            : 'border-theme-input bg-theme-input focus:ring-emerald-500 focus:border-emerald-500'
        ]"
      />

      <!-- Suffix Controls: United Stepper Group [- | +] -->
      <div
        class="absolute inset-y-1 right-1 flex items-center rounded-md border border-slate-200 dark:border-theme-border bg-slate-100/80 dark:bg-theme-card overflow-hidden shadow-2xs"
      >
        <!-- Decrement Button -->
        <button
          type="button"
          :disabled="disabled || isMinReached"
          @click="decrement"
          title="Decrease"
          class="flex h-full w-7 items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 active:bg-slate-300 dark:hover:bg-theme-hover transition-colors disabled:opacity-35 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <!-- Vertical Separator Line -->
        <div class="w-px h-3.5 bg-slate-200 dark:bg-theme-border shrink-0"></div>

        <!-- Increment Button -->
        <button
          type="button"
          :disabled="disabled || isMaxReached"
          @click="increment"
          title="Increase"
          class="flex h-full w-7 items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 active:bg-slate-300 dark:hover:bg-theme-hover transition-colors disabled:opacity-35 disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Error message display -->
    <span v-if="typeof error === 'string' && error" class="text-xs text-red-500 dark:text-red-400 mt-0.5 font-normal">
      {{ error }}
    </span>

    <!-- Hint / Help Text -->
    <span v-else-if="hint" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
      {{ hint }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue'

const inputId = useId()
const inputRef = ref<HTMLInputElement | null>(null)

interface Props {
  modelValue?: number | string | null
  min?: number
  max?: number
  maxlength?: number
  step?: number
  label?: string
  unit?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string | boolean
  hint?: string
  scrollable?: boolean
  scrollToChange?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 1,
  min: 1,
  max: 99999,
  maxlength: 5,
  step: 1,
  label: '',
  unit: '',
  placeholder: '',
  required: false,
  disabled: false,
  error: false,
  hint: '',
  scrollable: true,
  scrollToChange: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'change', value: number): void
}>()

const numericValue = computed(() => {
  const val = Number(props.modelValue)
  if (isNaN(val) || props.modelValue === '' || props.modelValue === null || props.modelValue === undefined) {
    return props.min
  }
  return val
})

const displayValue = computed(() => {
  if (props.modelValue === '' || props.modelValue === null || props.modelValue === undefined) {
    return ''
  }
  return String(props.modelValue)
})

const isMinReached = computed(() => {
  return numericValue.value <= props.min
})

const isMaxReached = computed(() => {
  return props.max !== undefined && numericValue.value >= props.max
})

const clamp = (val: number): number => {
  let res = val
  if (props.min !== undefined && res < props.min) {
    res = props.min
  }
  if (props.max !== undefined && res > props.max) {
    res = props.max
  }
  return res
}

const updateValue = (newVal: number) => {
  const clamped = clamp(newVal)
  emit('update:modelValue', clamped)
  emit('change', clamped)
}

const increment = () => {
  if (props.disabled || isMaxReached.value) return
  const current = numericValue.value
  updateValue(current + props.step)
}

const decrement = () => {
  if (props.disabled || isMinReached.value) return
  const current = numericValue.value
  updateValue(current - props.step)
}

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  // Permit only digits & respect maxlength
  let rawDigits = target.value.replace(/[^0-9]/g, '')
  if (props.maxlength && rawDigits.length > props.maxlength) {
    rawDigits = rawDigits.slice(0, props.maxlength)
  }
  target.value = rawDigits

  if (rawDigits === '') {
    // Allow empty during typing
    return
  }

  const num = parseInt(rawDigits, 10)
  if (!isNaN(num)) {
    emit('update:modelValue', num)
    emit('change', num)
  }
}

const isFocused = ref(false)

const handleFocus = () => {
  isFocused.value = true
}

const handleBlur = (e: FocusEvent) => {
  isFocused.value = false
  const target = e.target as HTMLInputElement
  const raw = target.value.trim()
  if (raw === '' || isNaN(Number(raw))) {
    updateValue(props.min)
  } else {
    updateValue(parseInt(raw, 10))
  }
}

const handleWheel = (e: WheelEvent) => {
  const isScrollEnabled = props.scrollable && props.scrollToChange
  if (!isScrollEnabled || props.disabled) return

  // Only trigger when the input element is currently active/focused
  if (isFocused.value || document.activeElement === inputRef.value) {
    e.preventDefault()
    if (e.deltaY < 0) {
      increment()
    } else if (e.deltaY > 0) {
      decrement()
    }
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    increment()
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    decrement()
  }
}
</script>
