<template>
  <component
    :is="as"
    class="inline-flex items-center gap-1.5 text-slate-800 dark:text-slate-200"
    :class="[
      sizeClasses,
      uppercase ? 'uppercase tracking-wider text-[11px]' : ''
    ]">
    <span v-if="icon" class="shrink-0 inline-flex items-center" :class="iconColorClass">
      <Icon
        :name="icon"
        :class="iconSizeClass" />
    </span>
    <slot name="icon" />

    <span :class="[weightClass]">
      <slot>{{ text }}</slot>
    </span>

    <span v-if="required" class="text-rose-500 font-bold" aria-hidden="true">*</span>
    <slot name="extra" />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    text?: string
    icon?: string
    iconColor?: string
    iconSize?: string
    size?: 'xs' | 'sm' | 'md' | 'lg'
    uppercase?: boolean
    weight?: 'normal' | 'medium' | 'semibold' | 'bold'
    required?: boolean
    as?: string
  }>(),
  {
    text: '',
    icon: '',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconSize: 'text-xs',
    size: 'xs',
    uppercase: false,
    weight: 'semibold',
    required: false,
    as: 'div'
  }
)

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-sm'
    case 'md':
      return 'text-base'
    case 'lg':
      return 'text-lg'
    case 'xs':
    default:
      return 'text-xs'
  }
})

const iconColorClass = computed(() => props.iconColor || 'text-emerald-500')
const iconSizeClass = computed(() => props.iconSize || 'text-xs')

const weightClass = computed(() => {
  switch (props.weight) {
    case 'normal':
      return 'font-normal'
    case 'medium':
      return 'font-medium'
    case 'bold':
      return 'font-bold'
    case 'semibold':
    default:
      return 'font-semibold'
  }
})
</script>
