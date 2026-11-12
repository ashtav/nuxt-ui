<template>
  <UiTooltip v-if="tooltip" :content="tooltip" :position="tooltipPosition">
    <button v-bind="$attrs" :type="type" :disabled="isDisabled" @click="handleClick"
      class="relative inline-flex items-center justify-center gap-2 text-sm whitespace-nowrap transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-theme-app disabled:cursor-not-allowed disabled:opacity-50"
      :class="[roundedClass, sizeClasses, variantClasses, block && 'w-full']">
      <!-- Loading spinner -->
      <svg v-if="loading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        class="h-4 w-4 shrink-0 animate-spin">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
      </svg>

      <!-- Leading icon slot (hidden while loading) -->
      <span v-if="showLeadingIcon && !loading" class="inline-flex shrink-0">
        <slot name="icon">
          <slot name="prefix">
            <Icon v-if="leadingIcon" :name="leadingIcon" />
          </slot>
        </slot>
      </span>

      <!-- Label -->
      <span v-if="$slots.default" class="font-semibold">
        <slot />
      </span>

      <!-- Trailing / Suffix icon slot (hidden while loading) -->
      <span v-if="showTrailingIcon && !loading" class="inline-flex shrink-0">
        <slot name="suffix">
          <slot name="suffix-icon">
            <Icon v-if="trailingIcon" :name="trailingIcon" />
          </slot>
        </slot>
      </span>
    </button>
  </UiTooltip>

  <button v-else v-bind="$attrs" :type="type" :disabled="isDisabled" @click="handleClick"
    class="relative inline-flex items-center justify-center gap-2 text-sm whitespace-nowrap transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-theme-app disabled:cursor-not-allowed disabled:opacity-50"
    :class="[roundedClass, sizeClasses, variantClasses, block && 'w-full']">
    <!-- Loading spinner -->
    <svg v-if="loading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      class="h-4 w-4 shrink-0 animate-spin">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
    </svg>

    <!-- Leading icon slot (hidden while loading) -->
    <span v-if="showLeadingIcon && !loading" class="inline-flex shrink-0">
      <slot name="icon">
        <slot name="prefix">
          <Icon v-if="leadingIcon" :name="leadingIcon" />
        </slot>
      </slot>
    </span>

    <!-- Label -->
    <span v-if="$slots.default" class="font-semibold">
      <slot />
    </span>

    <!-- Trailing / Suffix icon slot (hidden while loading) -->
    <span v-if="showTrailingIcon && !loading" class="inline-flex shrink-0">
      <slot name="suffix">
        <slot name="suffix-icon">
          <Icon v-if="trailingIcon" :name="trailingIcon" />
        </slot>
      </slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
import UiTooltip from './Tooltip.vue'

defineOptions({
  inheritAttrs: false
})

interface Props {
  to?: string | Record<string, any>
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost' | 'link'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon'
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  disabled?: boolean
  block?: boolean
  icon?: string
  suffixIcon?: string
  iconPosition?: 'left' | 'right' | 'prefix' | 'suffix'
  tooltip?: string
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'
  rounded?: string
}

const props = withDefaults(defineProps<Props>(), {
  to: '',
  variant: 'primary',
  size: 'md',
  type: 'button',
  loading: false,
  disabled: false,
  block: false,
  icon: '',
  suffixIcon: '',
  iconPosition: 'left',
  tooltip: '',
  tooltipPosition: 'top',
  rounded: ''
})

const attrs = useAttrs()
const slots = useSlots()

const isRightPosition = computed(() => props.iconPosition === 'right' || props.iconPosition === 'suffix')

const leadingIcon = computed(() => {
  if (isRightPosition.value) return ''
  return props.icon
})

const trailingIcon = computed(() => {
  if (props.suffixIcon) return props.suffixIcon
  if (isRightPosition.value) return props.icon
  return ''
})

const showLeadingIcon = computed(() => {
  return Boolean(leadingIcon.value || slots.prefix || (!isRightPosition.value && slots.icon))
})

const showTrailingIcon = computed(() => {
  return Boolean(trailingIcon.value || slots.suffix || slots['suffix-icon'] || (isRightPosition.value && slots.icon))
})

const roundedClass = computed(() => {
  if (props.rounded) return props.rounded
  const parentClass = String(attrs.class || '')
  if (/\brounded-(none|xs|sm|md|lg|xl|2xl|3xl|full)\b/.test(parentClass)) {
    return ''
  }
  return 'rounded-lg'
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

// Disabled automatically becomes true whenever loading is true
const isDisabled = computed(() => props.disabled || props.loading)

const handleClick = (event: MouseEvent) => {
  if (isDisabled.value) return
  emit('click', event)
  if (props.to) {
    const isExternal = typeof props.to === 'string' && (props.to.startsWith('http://') || props.to.startsWith('https://') || props.to.startsWith('//'))
    const target = attrs.target || (attrs as any).target
    if (isExternal && target === '_blank') {
      window.open(props.to, '_blank', 'noopener,noreferrer')
    } else {
      navigateTo(props.to, { external: isExternal })
    }
  }
}

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return slots.default ? 'h-7 px-2.5 text-xs' : 'h-7 w-7 p-0 text-xs'
    case 'sm':
      return 'h-8 px-3 text-xs'
    case 'lg':
      return 'h-11 px-5 text-base'
    case 'icon':
      return 'h-9 w-9 p-0'
    case 'md':
    default:
      return 'h-9 px-4 text-sm'
  }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500 shadow-sm'
    case 'secondary':
      return 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-400 dark:bg-theme-card dark:text-slate-100 dark:hover:bg-theme-hover border border-theme-border shadow-sm'
    case 'success':
      return 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm'
    case 'warning':
      return 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500 shadow-sm'
    case 'danger':
      return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm'
    case 'outline':
      return 'border border-theme-border bg-theme-card text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-theme-hover focus:ring-emerald-500'
    case 'ghost':
      return 'bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-theme-hover focus:ring-slate-400'
    case 'link':
      return 'bg-transparent text-emerald-600 dark:text-emerald-400 hover:underline focus:ring-emerald-500 h-auto px-0 shadow-none'
    default:
      return ''
  }
})
</script>
