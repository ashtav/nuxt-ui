<template>
  <div class="inline-flex items-center justify-center" v-bind="$attrs">
    <div v-if="message || $slots.default" :class="[
      'flex items-center justify-center',
      layout === 'vertical' ? 'flex-col space-y-2' : 'flex-row space-x-2'
    ]">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        class="animate-spin" :class="[sizeClasses, variantClasses]">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
      </svg>
      <span :class="['font-medium', textClasses, textVariantClasses]">
        <slot>{{ message }}</slot>
      </span>
    </div>
    <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      class="animate-spin" :class="[sizeClasses, variantClasses]">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg' | 'xl'
    variant?: 'primary' | 'secondary' | 'emerald' | 'white' | 'slate'
    message?: string
    layout?: 'vertical' | 'inline'
  }>(),
  {
    size: 'md',
    variant: 'emerald',
    message: '',
    layout: 'vertical'
  }
)

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-4 w-4 shrink-0'
    case 'lg':
      return 'h-8 w-8 shrink-0'
    case 'xl':
      return 'h-12 w-12 shrink-0'
    case 'md':
    default:
      return 'h-6 w-6 shrink-0'
  }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'text-indigo-600 dark:text-indigo-400'
    case 'secondary':
      return 'text-slate-400 dark:text-slate-500'
    case 'white':
      return 'text-white'
    case 'slate':
      return 'text-slate-500 dark:text-slate-400'
    case 'emerald':
    default:
      return 'text-emerald-600 dark:text-emerald-400'
  }
})

const textClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-xs'
    case 'lg':
    case 'xl':
      return 'text-sm'
    case 'md':
    default:
      return 'text-xs'
  }
})

const textVariantClasses = computed(() => {
  switch (props.variant) {
    case 'white':
      return 'text-white/90'
    case 'slate':
      return 'text-slate-400 dark:text-slate-500'
    default:
      return 'text-slate-500 dark:text-slate-400'
  }
})
</script>
