<template>
  <div ref="triggerRef" class="relative group" :class="[block ? 'block w-full' : 'inline-block']" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <!-- Trigger Element -->
    <slot />

    <!-- Tooltip Bubble (Teleported to body when teleport=true) -->
    <Teleport v-if="teleport && isHovered && (content || $slots.content)" to="body">
      <Transition enter-active-class="transition-opacity duration-150 ease-out" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition-opacity duration-100 ease-in"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div ref="tooltipRef"
          class="fixed z-[999999] px-2.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 rounded-lg shadow-2xl pointer-events-none whitespace-nowrap"
          :style="{ top: `${coords.top}px`, left: `${coords.left}px` }">
          <slot name="content">
            {{ content }}
          </slot>

          <!-- Tooltip Arrow -->
          <div class="absolute w-2 h-2 rotate-45 pointer-events-none" :class="arrowClasses" :style="arrowStyle"></div>
        </div>
      </Transition>
    </Teleport>

    <!-- Tooltip Bubble (Local DOM fallback when teleport=false) -->
    <div v-else-if="!teleport && isHovered && (content || $slots.content)" ref="tooltipRef"
      class="absolute z-50 px-2.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 rounded-lg shadow-xl pointer-events-none whitespace-nowrap"
      :class="positionClasses">
      <slot name="content">
        {{ content }}
      </slot>

      <!-- Tooltip Arrow -->
      <div class="absolute w-2 h-2 rotate-45 pointer-events-none" :class="localArrowClasses"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onBeforeUnmount } from 'vue'

interface Props {
  content?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  offset?: number
  disabled?: boolean
  block?: boolean
  teleport?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  position: 'top',
  offset: 8,
  disabled: false,
  block: false,
  teleport: true
})

const isHovered = ref(false)
const resolvedPosition = ref<'top' | 'bottom' | 'left' | 'right'>(props.position)
const triggerRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const coords = ref({ top: 0, left: 0 })
const arrowPos = ref({ offset: 0 })

const onScrollOrResize = () => {
  if (isHovered.value) {
    calculatePosition()
  }
}

const removeListeners = () => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', onScrollOrResize)
    window.removeEventListener('resize', onScrollOrResize)
  }
}

// If tooltip becomes disabled while open, hide it
watch(() => props.disabled, (isDisabled) => {
  if (isDisabled) {
    isHovered.value = false
    removeListeners()
  }
})

onBeforeUnmount(() => {
  removeListeners()
})

// Local positioning (when teleport = false)
const positionClasses = computed(() => {
  switch (resolvedPosition.value) {
    case 'bottom':
      return 'top-full left-1/2 -translate-x-1/2 mt-2'
    case 'left':
      return 'right-full top-1/2 -translate-y-1/2 mr-2'
    case 'right':
      return 'left-full top-1/2 -translate-y-1/2 ml-2'
    case 'top':
    default:
      return 'bottom-full left-1/2 -translate-x-1/2 mb-2'
  }
})

const localArrowClasses = computed(() => {
  switch (resolvedPosition.value) {
    case 'bottom':
      return 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-l border-t border-slate-800 dark:border-slate-700 bg-slate-900 dark:bg-slate-800'
    case 'left':
      return 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 border-r border-t border-slate-800 dark:border-slate-700 bg-slate-900 dark:bg-slate-800'
    case 'right':
      return 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 border-l border-b border-slate-800 dark:border-slate-700 bg-slate-900 dark:bg-slate-800'
    case 'top':
    default:
      return 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-r border-b border-slate-800 dark:border-slate-700 bg-slate-900 dark:bg-slate-800'
  }
})

// Teleported arrow classes (centered on pixel offset)
const arrowClasses = computed(() => {
  switch (resolvedPosition.value) {
    case 'bottom':
      return 'top-0 -translate-x-1/2 -translate-y-1/2 border-l border-t border-slate-800 dark:border-slate-700 bg-slate-900 dark:bg-slate-800'
    case 'left':
      return 'right-0 translate-x-1/2 -translate-y-1/2 border-r border-t border-slate-800 dark:border-slate-700 bg-slate-900 dark:bg-slate-800'
    case 'right':
      return 'left-0 -translate-x-1/2 -translate-y-1/2 border-l border-b border-slate-800 dark:border-slate-700 bg-slate-900 dark:bg-slate-800'
    case 'top':
    default:
      return 'bottom-0 -translate-x-1/2 translate-y-1/2 border-r border-b border-slate-800 dark:border-slate-700 bg-slate-900 dark:bg-slate-800'
  }
})

const arrowStyle = computed(() => {
  if (resolvedPosition.value === 'top' || resolvedPosition.value === 'bottom') {
    return { left: `${arrowPos.value.offset}px` }
  } else {
    return { top: `${arrowPos.value.offset}px` }
  }
})

const calculatePosition = () => {
  if (!triggerRef.value) return
  const triggerRect = triggerRef.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let currentPos = props.position

  const tooltipWidth = tooltipRef.value?.offsetWidth || 120
  const tooltipHeight = tooltipRef.value?.offsetHeight || 32
  const padding = 12
  const gap = props.offset

  // 1. Auto-flip if not enough space
  if (currentPos === 'top' && triggerRect.top - tooltipHeight - gap < padding) {
    currentPos = 'bottom'
  } else if (currentPos === 'bottom' && triggerRect.bottom + tooltipHeight + gap > viewportHeight - padding) {
    currentPos = 'top'
  } else if (currentPos === 'left' && triggerRect.left - tooltipWidth - gap < padding) {
    currentPos = 'right'
  } else if (currentPos === 'right' && triggerRect.right + tooltipWidth + gap > viewportWidth - padding) {
    currentPos = 'left'
  }

  resolvedPosition.value = currentPos

  if (props.teleport) {
    let top = 0
    let left = 0
    let arrowOffset = 0

    if (currentPos === 'top' || currentPos === 'bottom') {
      const triggerCenterX = triggerRect.left + triggerRect.width / 2

      // Calculate ideal left edge of tooltip
      const idealLeft = triggerCenterX - tooltipWidth / 2

      // Clamp left edge inside viewport bounds with padding
      const minLeft = padding
      const maxLeft = Math.max(padding, viewportWidth - tooltipWidth - padding)
      const clampedLeft = Math.max(minLeft, Math.min(maxLeft, idealLeft))

      left = clampedLeft

      // Calculate where arrow should be relative to the tooltip's left edge
      const exactArrowLeft = triggerCenterX - clampedLeft
      // Clamp arrow inside the tooltip bubble so it doesn't overflow corners
      arrowOffset = Math.max(10, Math.min(tooltipWidth - 10, exactArrowLeft))

      if (currentPos === 'top') {
        top = triggerRect.top - tooltipHeight - gap
      } else {
        top = triggerRect.bottom + gap
      }
    } else {
      const triggerCenterY = triggerRect.top + triggerRect.height / 2

      // Calculate ideal top edge of tooltip
      const idealTop = triggerCenterY - tooltipHeight / 2

      // Clamp top edge inside viewport bounds
      const minTop = padding
      const maxTop = Math.max(padding, viewportHeight - tooltipHeight - padding)
      const clampedTop = Math.max(minTop, Math.min(maxTop, idealTop))

      top = clampedTop

      // Calculate where arrow should be relative to the tooltip's top edge
      const exactArrowTop = triggerCenterY - clampedTop
      arrowOffset = Math.max(8, Math.min(tooltipHeight - 8, exactArrowTop))

      if (currentPos === 'left') {
        left = triggerRect.left - tooltipWidth - gap
      } else {
        left = triggerRect.right + gap
      }
    }

    coords.value = { top, left }
    arrowPos.value = { offset: arrowOffset }
  }
}

const onMouseEnter = () => {
  if (props.disabled) return
  if (typeof window !== 'undefined' && window.innerWidth < 768) return

  // 1. Initial quick calculation based on trigger geometry
  calculatePosition()
  isHovered.value = true

  // 2. Refine exact pixel layout once DOM node is rendered and measured
  nextTick(() => {
    calculatePosition()
  })

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize)
  }
}

const onMouseLeave = () => {
  isHovered.value = false
  removeListeners()
}
</script>
