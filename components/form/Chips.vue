<template>
  <div class="flex flex-col gap-1 w-full" :class="[disabled && 'opacity-60 pointer-events-none']">
    <!-- Label -->
    <label v-if="label"
      class="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-0.5 self-start">
      <span>{{ label }}</span>
      <span v-if="required" class="text-red-500 font-bold" aria-hidden="true">*</span>
    </label>

    <!-- Chips Container -->
    <div v-if="separated" :class="containerClass ? containerClass : 'flex flex-wrap gap-2 py-1.5'">
      <button v-for="option in options" :key="option.value" type="button" :disabled="disabled || option.disabled"
        @click="handleChange(option)"
        class="h-9 px-4 text-xs font-semibold rounded-lg border transition-all duration-150 outline-none select-none flex items-center justify-center gap-1.5 active:scale-[0.98]"
        :class="[
          buttonClass,
          modelValue === option.value
            ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/20 font-bold'
            : 'bg-white dark:bg-theme-card border-slate-200 dark:border-theme-border text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-theme-hover hover:text-slate-900 dark:hover:text-white cursor-pointer'
        ]">
        <!-- Indicator Dot for Selected -->
        <span v-if="modelValue === option.value" class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
        <span>{{ option.label }}</span>
      </button>
    </div>

    <div v-else
      class="p-1 bg-slate-50 dark:bg-theme-app border border-slate-200 dark:border-theme-border rounded-lg inline-flex flex-wrap w-fit items-center gap-1">
      <button v-for="option in options" :key="option.value" type="button" :disabled="disabled || option.disabled"
        @click="handleChange(option)"
        class="h-7 px-3 text-xs font-semibold rounded-md transition-all duration-100 outline-none select-none flex items-center gap-1.5 whitespace-nowrap"
        :class="[
          modelValue === option.value
            ? 'bg-white dark:bg-theme-card text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-theme-border shadow-sm font-bold'
            : option.disabled
              ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-theme-hover cursor-pointer'
        ]">
        <!-- Indicator Dot for Selected -->
        <span v-if="modelValue === option.value" class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span>{{ option.label }}</span>
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
export interface ChipsOption {
  label: string
  value: string | number
  disabled?: boolean
}

interface Props {
  label?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  options: ChipsOption[]
  error?: string | string[] | boolean
  separated?: boolean
  containerClass?: string
  buttonClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  hint: '',
  required: false,
  disabled: false,
  error: '',
  separated: false,
  containerClass: '',
  buttonClass: ''
})

const emit = defineEmits<{
  (e: 'change', option: ChipsOption): void
}>()

const modelValue = defineModel<string | number | null>({ default: '' })

const handleChange = (option: ChipsOption) => {
  if (props.disabled || option.disabled) return
  modelValue.value = option.value
  emit('change', option)
}
</script>
