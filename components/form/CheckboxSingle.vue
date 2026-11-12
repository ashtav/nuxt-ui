<template>
  <div class="flex flex-col gap-1 min-w-0" :class="[width || 'w-full', disabled && 'opacity-60']">
    <label
      class="inline-flex w-full min-w-0 select-none"
      :class="[
        (disabled || readonly) ? 'cursor-default' : 'cursor-pointer',
        align === 'start' ? 'items-start' : 'items-center',
        size === 'sm'
          ? 'gap-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 py-0.5'
          : 'gap-2.5 text-sm text-slate-900 dark:text-white py-0.5'
      ]"
      @click="handleLabelClick"
    >
      <span
        class="relative inline-flex shrink-0 items-center justify-center"
        :class="[
          size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4',
          align === 'start' ? 'mt-0.5' : ''
        ]"
      >
        <UiLoading v-if="loading" size="sm" variant="emerald" class="!h-3.5 !w-3.5" />
        <template v-else>
          <input
            type="checkbox"
            v-model="modelValue"
            :disabled="disabled || readonly"
            class="peer absolute inset-0 shrink-0 appearance-none rounded-[4px] border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-theme-app disabled:cursor-not-allowed cursor-pointer"
            :class="[
              size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4',
              modelValue
                ? (disabled || readonly ? 'border-emerald-600/80 bg-emerald-600/80 dark:border-emerald-500/80 dark:bg-emerald-500/80' : 'border-emerald-500 bg-emerald-500')
                : (disabled || readonly ? 'border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-theme-input' : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-theme-app hover:border-slate-400 dark:hover:border-slate-500')
            ]"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="pointer-events-none text-white transition-all duration-150 relative z-10"
            :class="[
              size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3',
              modelValue ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            ]"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </template>
      </span>
      <span v-if="label || $slots.default" class="leading-normal flex-1 min-w-0 font-medium">
        <slot>{{ label }}</slot>
        <span v-if="required" class="text-red-500 font-bold" aria-hidden="true">*</span>
      </span>
    </label>

    <!-- Error message / Hint -->
    <span v-if="errorText || error" class="text-xs font-normal text-red-500 mt-0.5 pl-6.5">
      {{ errorText || error }}
    </span>
    <span v-else-if="hint" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 pl-6.5">
      {{ hint }}
    </span>
  </div>
</template>

<script setup lang="ts">
import UiLoading from '~/components/ui/Loading.vue'

interface Props {
  label?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  loading?: boolean
  error?: string
  errorText?: string
  align?: 'center' | 'start'
  size?: 'sm' | 'md'
  width?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  hint: '',
  required: false,
  disabled: false,
  readonly: false,
  loading: false,
  error: '',
  errorText: '',
  align: 'center',
  size: 'md',
  width: ''
})

const modelValue = defineModel<boolean>({ default: false })

const handleLabelClick = (event: MouseEvent) => {
  const target = (event.target as HTMLElement).closest('a')
  if (target) {
    // If clicking a link, don't toggle checkbox state and let browser navigate
    event.stopPropagation()
    return
  }
  if (props.readonly || props.disabled || props.loading) {
    event.preventDefault()
  }
}
</script>
