<template>
  <div class="flex flex-col gap-1 w-full">
    <!-- Label -->
    <label v-if="label" :for="inputId"
      class="text-sm font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-0.5 self-start">
      <span>{{ label }}</span>
      <span v-if="required" class="text-red-500 font-bold" aria-hidden="true">*</span>
    </label>

    <!-- Chips Input Wrapper (styled like a standard input field) -->
    <div
      class="flex flex-wrap gap-1.5 w-full rounded-lg border px-3 py-1.5 transition-all bg-theme-input focus-within:ring-2 min-h-[38px] items-center cursor-text"
      :class="[
        error
          ? 'border-red-500 dark:border-red-500 focus-within:ring-red-500 focus-within:border-red-500 bg-red-50/10 dark:bg-red-950/10'
          : 'border-theme-input focus-within:ring-emerald-500 focus-within:border-emerald-500'
      ]"
      @click="focusInput"
    >
      <!-- Rendered Chips -->
      <span
        v-for="(chip, index) in modelValue"
        :key="index"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/45 text-xs font-semibold"
      >
        <span>{{ chip }}</span>
        <button
          type="button"
          @click.stop="removeChip(index)"
          class="hover:text-rose-500 transition-colors p-0.5 rounded-full hover:bg-emerald-100/50 dark:hover:bg-emerald-900/50 cursor-pointer"
        >
          <Icon name="cancel-01" size="xs" />
        </button>
      </span>

      <!-- Text Input -->
      <input
        :id="inputId"
        ref="inputRef"
        v-model="inputValue"
        type="text"
        v-bind="$attrs"
        class="flex-1 min-w-[120px] bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 border-none p-0"
        :placeholder="modelValue.length === 0 ? placeholder : ''"
        @keydown.enter.prevent="handleEnter"
        @keydown.comma.prevent="handleComma"
        @keydown.backspace="handleBackspace"
        @blur="handleBlur"
      />
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
import { ref, useId } from 'vue'
import { toast } from 'vue-sonner'

// Prevent attribute inheritance on outer div
defineOptions({
  inheritAttrs: false
})

interface Props {
  label?: string
  hint?: string
  required?: boolean
  placeholder?: string
  error?: string | boolean | string[]
  validation?: 'email' | 'none'
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  hint: '',
  required: false,
  placeholder: 'Type and press Enter...',
  error: false,
  validation: 'none'
})

const modelValue = defineModel<string[]>({ default: () => [] })

const inputValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const inputId = useId()

const focusInput = () => {
  inputRef.value?.focus()
}

const addChip = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return

  // Split by comma, newline or space to allow bulk paste
  const parts = trimmed.split(/[\s,\n]+/).map(p => p.trim().toLowerCase()).filter(Boolean)

  let addedCount = 0
  let hasInvalid = false
  let hasDuplicate = false

  const currentValues = [...modelValue.value]

  for (const part of parts) {
    if (props.validation === 'email') {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(part)
      if (!isEmail) {
        hasInvalid = true
        continue
      }
    }

    if (currentValues.includes(part)) {
      hasDuplicate = true
      continue
    }

    currentValues.push(part)
    addedCount++
  }

  if (addedCount > 0) {
    modelValue.value = currentValues
  }

  if (hasInvalid) {
    toast.error('Invalid email format skipped.')
  }
  if (hasDuplicate) {
    toast.warning('Duplicate email skipped.')
  }

  inputValue.value = ''
}

const handleEnter = () => {
  addChip(inputValue.value)
}

const handleComma = () => {
  addChip(inputValue.value)
}

const handleBlur = () => {
  addChip(inputValue.value)
}

const handleBackspace = () => {
  if (inputValue.value === '' && modelValue.value.length > 0) {
    // Remove the last chip
    const currentValues = [...modelValue.value]
    currentValues.pop()
    modelValue.value = currentValues
  }
}

const removeChip = (index: number) => {
  const currentValues = [...modelValue.value]
  currentValues.splice(index, 1)
  modelValue.value = currentValues
}
</script>
