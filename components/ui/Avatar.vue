<template>
  <div class="relative inline-flex shrink-0 select-none" :class="[dimensionClasses, shapeClasses]">
    <!-- Avatar Container -->
    <div
      class="relative w-full h-full overflow-hidden flex items-center justify-center font-semibold text-white transition-transform duration-200"
      :class="[
        shapeClasses,
        bordered ? 'ring-1 ring-inset ring-slate-900/10 dark:ring-white/10 shadow-2xs' : '',
      ]"
      :style="{ backgroundColor: fallbackBgColor }"
      :title="name || alt || 'Avatar'"
    >
      <!-- Initials / Fallback (Always rendered as base layer) -->
      <slot name="fallback">
        <span class="leading-none select-none tracking-tight">
          {{ displayInitials }}
        </span>
      </slot>

      <!-- User Photo Image (Rendered on top if src is valid and loaded) -->
      <img
        v-if="src && !hasError"
        :src="src"
        :alt="alt || name || 'Avatar'"
        class="absolute inset-0 w-full h-full object-cover transition-opacity duration-200"
        :class="[shapeClasses, isLoaded ? 'opacity-100' : 'opacity-0']"
        @load="onLoad"
        @error="onError"
      />
    </div>

    <!-- Optional Corner Status Indicator Dot -->
    <span
      v-if="status !== undefined && status !== null"
      class="absolute -top-0.5 -right-0.5 flex items-center justify-center pointer-events-none z-10"
      :class="statusWrapperClasses"
      :title="statusTitle"
    >
      <!-- Inactive / Offline (Solid Dot) -->
      <span
        v-if="isStatusInactive"
        class="rounded-full bg-rose-500 ring-2 ring-white dark:ring-theme-card"
        :class="statusDotClasses"
      ></span>

      <!-- Active / Online (Pulsing Dot) -->
      <span v-else class="relative flex" :class="statusDotClasses">
        <span
          class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
        ></span>
        <span
          class="relative inline-flex rounded-full bg-emerald-500 ring-2 ring-white dark:ring-theme-card"
          :class="statusDotClasses"
        ></span>
      </span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { getInitials, getAvatarColor } from '~/utils/utils'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom'
export type AvatarShape = 'circle' | 'square' | 'rounded'
export type AvatarStatus = 'active' | 'inactive' | 'online' | 'offline' | boolean

const props = withDefaults(
  defineProps<{
    src?: string | null
    name?: string | null
    initials?: string
    size?: AvatarSize
    shape?: AvatarShape
    bordered?: boolean
    bgColor?: string
    alt?: string
    status?: AvatarStatus
  }>(),
  {
    src: null,
    name: '',
    initials: '',
    size: 'md',
    shape: 'circle',
    bordered: true,
    bgColor: '',
    alt: '',
    status: undefined,
  }
)

const hasError = ref(false)
const isLoaded = ref(false)

// Reset error & loaded states whenever src changes
watch(
  () => props.src,
  (newSrc) => {
    hasError.value = false
    isLoaded.value = false
  }
)

const onLoad = () => {
  isLoaded.value = true
  hasError.value = false
}

const onError = () => {
  hasError.value = true
  isLoaded.value = false
}

// 1. Initials extraction
const displayInitials = computed(() => {
  if (props.initials) return props.initials.toUpperCase()
  if (props.name) return getInitials(props.name)
  return '?'
})

// 2. Fallback Background Color (Deterministic HSL based on name, or explicit override)
const fallbackBgColor = computed(() => {
  if (props.bgColor) return props.bgColor
  if (props.name) return getAvatarColor(props.name)
  return '#10b981' // Default JB brand emerald
})

// 3. Shape classes
const shapeClasses = computed(() => {
  if (props.shape === 'circle') return 'rounded-full'
  return 'rounded-xl' // Standard rounded-xl for square/rounded per project standards
})

// 4. Size dimension & font size classes
const dimensionClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'w-6 h-6 text-[10px]'
    case 'sm':
      return 'w-8 h-8 text-xs'
    case 'md':
      return 'w-10 h-10 text-sm'
    case 'lg':
      return 'w-12 h-12 text-base'
    case 'xl':
      return 'w-14 h-14 text-lg'
    case '2xl':
      return 'w-20 h-20 text-2xl'
    case 'custom':
      return ''
    default:
      return 'w-10 h-10 text-sm'
  }
})

// 5. Status Dot helpers
const isStatusInactive = computed(() => {
  if (props.status === false || props.status === 'inactive' || props.status === 'offline') {
    return true
  }
  return false
})

const statusTitle = computed(() => {
  if (isStatusInactive.value) return 'Inactive'
  return 'Active'
})

const statusWrapperClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'h-2 w-2'
    case 'sm':
      return 'h-2.5 w-2.5'
    case 'lg':
    case 'xl':
      return 'h-3.5 w-3.5'
    case '2xl':
      return 'h-4.5 w-4.5'
    default:
      return 'h-3 w-3'
  }
})

const statusDotClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'h-1.5 w-1.5'
    case 'sm':
      return 'h-2 w-2'
    case 'lg':
    case 'xl':
      return 'h-3 w-3'
    case '2xl':
      return 'h-3.5 w-3.5'
    default:
      return 'h-2.5 w-2.5'
  }
})
</script>
