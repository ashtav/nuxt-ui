<template>
  <div class="flex flex-col gap-1 w-full" :class="[disabled && 'opacity-60 pointer-events-none']">
    <!-- Label -->
    <label
      v-if="label || $slots.label"
      class="text-sm font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-0.5 self-start mb-0.5 select-none"
    >
      <slot name="label">
        <span>{{ label }}</span>
      </slot>
      <span v-if="required" class="text-red-500 font-bold" aria-hidden="true">*</span>
    </label>

    <!-- Options Pill Container (No scroll, displays all items wrapped) -->
    <div class="flex flex-wrap gap-1.5 py-0.5">
      <button
        v-for="option in options"
        :key="String(option.value)"
        type="button"
        :disabled="disabled || option.disabled"
        @click="handleSelect(option)"
        :class="[
          'px-3 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 select-none border',
          isSelected(option.value)
            ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/20'
            : 'bg-white dark:bg-theme-card text-slate-700 dark:text-slate-300 border-slate-200 dark:border-theme-border hover:bg-slate-50 dark:hover:bg-theme-hover cursor-pointer',
          (disabled || option.disabled) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        ]"
      >
        <!-- Checkmark Box Indicator -->
        <span
          :class="[
            'w-4 h-4 rounded-[4px] flex items-center justify-center border text-[10px] shrink-0 transition-all',
            isSelected(option.value)
              ? 'bg-white border-white text-emerald-600'
              : 'border-slate-300 dark:border-slate-600 bg-slate-100/80 dark:bg-theme-app'
          ]"
        >
          <svg
            v-if="isSelected(option.value)"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-2.5 h-2.5 text-emerald-600"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>

        <!-- Option Label -->
        <span class="whitespace-nowrap">{{ option.label }}</span>
      </button>
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
import { computed } from 'vue'

export interface PillOption {
  label: string
  value: string | number
  disabled?: boolean
}

interface Props {
  label?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  options: PillOption[]
  /** Allow selecting multiple options (returns array when true, single value when false) */
  multiple?: boolean
  error?: string | string[] | boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  hint: '',
  required: false,
  disabled: false,
  multiple: false,
  error: ''
})

const emit = defineEmits<{
  (e: 'change', option: PillOption): void
}>()

const modelValue = defineModel<any>({ default: undefined })

const isSelected = (val: string | number) => {
  if (props.multiple || Array.isArray(modelValue.value)) {
    const list = Array.isArray(modelValue.value) ? modelValue.value : []
    return list.map(String).includes(String(val))
  }
  return String(modelValue.value ?? '') === String(val)
}

const handleSelect = (option: PillOption) => {
  if (props.disabled || option.disabled) return

  if (props.multiple) {
    const current = Array.isArray(modelValue.value) ? [...modelValue.value] : []
    const idx = current.findIndex(v => String(v) === String(option.value))
    if (idx >= 0) {
      current.splice(idx, 1)
    } else {
      current.push(option.value)
    }
    modelValue.value = current
  } else {
    modelValue.value = option.value
  }

  emit('change', option)
}
</script>
