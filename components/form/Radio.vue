<template>
  <fieldset class="flex flex-col gap-1 w-full" :disabled="disabled || loading">
    <!-- Label -->
    <legend v-if="label"
      class="text-sm font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-0.5 self-start px-0">
      <span>{{ label }}</span>
      <span v-if="required" class="text-red-500 font-bold" aria-hidden="true">*</span>
    </legend>

    <!-- Skeleton Loading Options -->
    <div v-if="loading" class="flex gap-x-4 gap-y-2.5 animate-pulse"
      :class="orientation === 'horizontal' ? 'flex-row flex-wrap items-start py-1.5' : 'flex-col'" role="status"
      aria-label="Loading options">
      <div v-for="item in skeletonItems" :key="item.id" class="inline-flex items-center gap-2.5 py-0.5 select-none">
        <div class="h-4 w-4 shrink-0 rounded-full bg-slate-200 dark:bg-theme-border/80" />
        <div class="h-3.5 rounded-sm bg-slate-200 dark:bg-theme-border/80" :class="item.width" />
      </div>
    </div>

    <!-- Actual Options -->
    <div v-else class="flex gap-x-4 gap-y-2.5"
      :class="orientation === 'horizontal' ? 'flex-row flex-wrap items-start py-1.5' : 'flex-col'" role="radiogroup">
      <label v-for="option in options" :key="option.value" :for="`${groupId}-${option.value}`"
        class="inline-flex items-start gap-2.5 text-sm text-slate-900 dark:text-white py-0.5"
        :class="(disabled || option.disabled) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'">
        <span class="relative inline-flex h-4 w-4 shrink-0 items-center justify-center mt-0.5">
          <input :id="`${groupId}-${option.value}`" type="radio" :name="groupId" :value="option.value"
            :checked="modelValue === option.value" :disabled="disabled || option.disabled" :required="required"
            @change="handleChange(option)"
            class="peer absolute inset-0 h-4 w-4 shrink-0 appearance-none rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/60 dark:focus:ring-emerald-400/60 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-theme-card disabled:cursor-not-allowed cursor-pointer"
            :class="[
              modelValue === option.value
                ? 'border-2 border-emerald-500 dark:border-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/40'
                : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-theme-app hover:border-slate-400 dark:hover:border-slate-500'
            ]" />
          <span
            class="pointer-events-none h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-150"
            :class="modelValue === option.value ? 'scale-100 opacity-100' : 'scale-0 opacity-0'" />
        </span>
        <span class="select-none leading-normal font-normal"
          :class="modelValue === option.value ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'">
          {{ option.label }}
        </span>
      </label>
    </div>

    <!-- Error message display -->
    <span v-if="typeof error === 'string' && error" class="text-xs text-red-500 dark:text-red-400 mt-0.5 font-normal">
      {{ error }}
    </span>

    <!-- Hint / Help Text -->
    <span v-if="hint" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
      {{ hint }}
    </span>
  </fieldset>
</template>

<script setup lang="ts">
import { useId, ref, watch } from 'vue'

defineOptions({
  inheritAttrs: false
})

export interface RadioOption {
  label: string
  value: string
  disabled?: boolean
}

interface Props {
  label?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  options: RadioOption[]
  orientation?: 'vertical' | 'horizontal'
  error?: string | string[] | boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  hint: '',
  required: false,
  disabled: false,
  orientation: 'vertical',
  error: '',
  loading: false
})

const emit = defineEmits<{
  change: [option: RadioOption]
}>()

const modelValue = defineModel<string>({ default: '' })

const groupId = useId()

// Skeleton generation (random 2-5 items with varied widths)
const skeletonWidths = ['w-16', 'w-20', 'w-24', 'w-28', 'w-14', 'w-32']
const getRandomCount = () => Math.floor(Math.random() * 4) + 2

const skeletonItems = ref<Array<{ id: number; width: string }>>([])

const generateSkeletonItems = () => {
  const count = getRandomCount()
  skeletonItems.value = Array.from({ length: count }, (_, i) => ({
    id: i,
    width: skeletonWidths[Math.floor(Math.random() * skeletonWidths.length)] || 'w-20'
  }))
}

generateSkeletonItems()

watch(() => props.loading, (isLoading) => {
  if (isLoading) {
    generateSkeletonItems()
  }
})

const handleChange = (option: RadioOption) => {
  modelValue.value = option.value
  emit('change', option)
}
</script>