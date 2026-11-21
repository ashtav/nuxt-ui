<template>
  <div
    class="flex items-center justify-center font-black select-none tracking-tighter text-white bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 shadow-md shadow-emerald-500/25 ring-1 ring-white/20 transition-all duration-300"
    :class="[sizeClasses, rounded]"
  >
    <span class="leading-none transform -translate-y-[0.5px] font-sans">{{ letter }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    letter?: string
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    rounded?: string
  }>(),
  {
    letter: 'N',
    size: 'md',
    rounded: 'rounded-xl'
  }
)

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'w-6 h-6 text-xs'
    case 'sm':
      return 'w-7 h-7 text-sm font-extrabold'
    case 'lg':
      return 'w-11 h-11 text-xl'
    case 'xl':
      return 'w-14 h-14 text-2xl'
    case 'md':
    default:
      return 'w-9 h-9 text-base'
  }
})
</script>
