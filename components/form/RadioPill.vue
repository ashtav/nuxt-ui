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

    <!-- Options Pill Container -->
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
        <!-- Circle Radio Indicator -->
        <span
          :class="[
            'w-4 h-4 rounded-full flex items-center justify-center border shrink-0 transition-all',
            isSelected(option.value)
              ? 'bg-white border-white'
              : 'border-slate-300 dark:border-theme-border bg-slate-100 dark:bg-theme-app'
          ]"
        >
          <!-- Inner circle dot when selected -->
          <span
            v-if="isSelected(option.value)"
            class="w-1.5 h-1.5 rounded-full bg-emerald-600"
          ></span>
        </span>

        <!-- Optional Icon -->
        <span v-if="option.icon" class="text-sm">{{ option.icon }}</span>

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
export interface RadioPillOption {
  label: string
  value: string | number
  disabled?: boolean
  icon?: string
}

interface Props {
  label?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  options: RadioPillOption[]
  error?: string | string[] | boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  hint: '',
  required: false,
  disabled: false,
  error: '',
})

const emit = defineEmits<{
  (e: 'change', option: RadioPillOption): void
}>()

const modelValue = defineModel<any>({ default: undefined })

const isSelected = (val: string | number) => {
  return String(modelValue.value ?? '') === String(val)
}

const handleSelect = (option: RadioPillOption) => {
  if (props.disabled || option.disabled) return
  modelValue.value = option.value
  emit('change', option)
}
</script>
