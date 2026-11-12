<template>
  <fieldset class="flex flex-col gap-1 w-full" :disabled="disabled">
    <!-- Label -->
    <legend v-if="label"
      class="text-sm font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-0.5 self-start px-0">
      <span>{{ label }}</span>
      <span v-if="required" class="text-red-500 font-bold" aria-hidden="true">*</span>
    </legend>

    <!-- Options -->
    <div class="flex gap-x-4 gap-y-2.5" :class="orientation === 'horizontal' ? 'flex-row flex-wrap items-start py-1.5' : 'flex-col'">
      <label v-for="option in options" :key="option.value" :for="`${groupId}-${option.value}`"
        class="inline-flex items-start gap-2.5 text-sm text-slate-900 dark:text-white py-0.5"
        :class="(disabled || option.disabled) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'"
        @click="handleLabelClick">
        <span class="relative inline-flex h-4 w-4 shrink-0 items-center justify-center mt-0.5">
          <input :id="`${groupId}-${option.value}`" type="checkbox" :name="groupId" :value="option.value"
            :checked="modelValue.includes(option.value)" :disabled="disabled || option.disabled"
            @change="handleChange(option, $event)"
            class="peer absolute inset-0 h-4 w-4 shrink-0 appearance-none rounded-[4px] border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed cursor-pointer"
            :class="[
              modelValue.includes(option.value)
                ? 'border-emerald-500 bg-emerald-500'
                : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-theme-app hover:border-slate-400 dark:hover:border-slate-500'
            ]" />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
            class="pointer-events-none h-3 w-3 text-white transition-all duration-150 relative z-10"
            :class="[modelValue.includes(option.value) ? 'scale-100 opacity-100' : 'scale-0 opacity-0']">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <span v-if="option.description" class="select-none leading-normal flex-1" v-html="option.description"></span>
        <span v-else class="select-none leading-normal flex-1">{{ option.label }}</span>
      </label>
    </div>

    <!-- Error message (shown when the minimum required selection isn't met) -->
    <span v-if="errorMessage" class="text-xs font-normal text-red-500 mt-0.5">
      {{ errorMessage }}
    </span>

    <!-- Hint / Help Text -->
    <span v-else-if="hint" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
      {{ hint }}
    </span>
  </fieldset>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue'

defineOptions({
  inheritAttrs: false
})

export interface CheckboxOption {
  label: string
  value: string
  disabled?: boolean
  description?: string
}

interface Props {
  label?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  options: CheckboxOption[]
  orientation?: 'vertical' | 'horizontal'
  /** Minimum number of options that must stay checked when `required` is true */
  min?: number
  errorText?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  hint: '',
  required: false,
  disabled: false,
  orientation: 'vertical',
  min: 1,
  errorText: ''
})

const emit = defineEmits<{
  (e: 'change', options: CheckboxOption[]): void
}>()

const modelValue = defineModel<string[]>({ default: () => [] })

const groupId = useId()
const touched = ref(false)

// Show an error once the user has interacted and the minimum requirement isn't met
const errorMessage = computed(() => {
  if (props.errorText) return props.errorText
  if (!props.required || !touched.value) return ''
  if (modelValue.value.length >= props.min) return ''
  return `Please select at least ${props.min} option${props.min > 1 ? 's' : ''}.`
})

const handleChange = (option: CheckboxOption, event: Event) => {
  touched.value = true
  const checked = (event.target as HTMLInputElement).checked
  const current = new Set(modelValue.value)

  if (checked) {
    current.add(option.value)
  } else {
    current.delete(option.value)
  }

  modelValue.value = Array.from(current)
  emit(
    'change',
    props.options.filter((o) => current.has(o.value))
  )
}

const handleLabelClick = (event: MouseEvent) => {
  const target = (event.target as HTMLElement).closest('a')
  if (target) {
    event.preventDefault()
    const href = target.getAttribute('href')
    const targetAttr = target.getAttribute('target') || '_self'
    if (href && href !== '#') {
      window.open(href, targetAttr)
    }
  }
}
</script>