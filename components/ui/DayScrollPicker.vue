<template>
  <div ref="containerRef" class="relative inline-block text-left select-none">
    <!-- Trigger Button (Icon Only) -->
    <UiTooltip :content="loading ? 'Loading schedules...' : tooltipText" position="top">
      <button
        type="button"
        :disabled="disabled || loading || daysList.length === 0"
        :aria-expanded="isOpen"
        aria-haspopup="dialog"
        class="h-8 w-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50 select-none shrink-0"
        :class="[
          isOpen
            ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:border-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400 ring-2 ring-emerald-500/25'
            : modelValue !== null && modelValue !== undefined
              ? 'border-emerald-500 bg-emerald-50/80 text-emerald-600 dark:border-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400 hover:bg-emerald-100/70 dark:hover:bg-emerald-500/25'
              : 'border-theme-input bg-theme-input text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-100 dark:hover:bg-theme-hover hover:text-slate-800 dark:hover:text-slate-200'
        ]"
        @click="toggleOpen"
      >
        <!-- Loading spinner -->
        <svg v-if="loading" class="animate-spin h-4 w-4 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
        </svg>
        <Icon v-else :name="icon" class="text-base" />
      </button>
    </UiTooltip>

    <!-- Cupertino Wheel Popover (Minimalist: Numbers Only with Fade Out) -->
    <Transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="transform opacity-0 scale-95 -translate-y-1"
      enter-to-class="transform opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="transform opacity-100 scale-100 translate-y-0"
      leave-to-class="transform opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="isOpen"
        ref="panelRef"
        class="absolute right-0 mt-2 w-20 rounded-xl bg-white dark:bg-theme-card border border-slate-200 dark:border-theme-border shadow-xl p-1 z-50 focus:outline-none"
        tabindex="-1"
      >
        <!-- Wheel Viewport: Exactly 5 items visible (5 * 38px = 190px) -->
        <div class="relative w-full h-[190px] overflow-hidden cupertino-wheel">
          <!-- iOS Hairline Selection Divider: Edge-to-Edge Top & Bottom Border (Center Slot: top 76px, height 38px) -->
          <div
            class="pointer-events-none absolute inset-x-0 top-[76px] h-[38px] border-y border-slate-200 dark:border-slate-700/80 z-10"
          />

          <!-- Scrollable Wheel List -->
          <div
            ref="scrollListRef"
            class="h-full overflow-y-auto scroll-smooth snap-y snap-mandatory scrollbar-none py-[76px]"
            @scroll="handleScroll"
          >
            <div
              v-for="day in daysList"
              :key="day"
              :data-day="day"
              class="h-[38px] snap-center flex items-center justify-center cursor-pointer select-none transition-colors duration-150 relative z-0 hover:text-emerald-600 dark:hover:text-emerald-400"
              :title="`Click to select Day ${day}`"
              @click="confirmDay(day)"
            >
              <span
                class="font-mono text-center transition-all duration-150"
                :class="[
                  currentActiveDay === day
                    ? 'text-lg font-bold text-slate-900 dark:text-white scale-110'
                    : isAdjacent(day)
                      ? 'text-sm font-medium text-slate-500 dark:text-slate-400 opacity-60 scale-95'
                      : 'text-xs font-normal text-slate-400 dark:text-slate-500 opacity-30 scale-85'
                ]"
              >
                {{ day < 10 ? `0${day}` : day }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

const ITEM_HEIGHT = 38 // 38px per item row (5 items visible = 190px viewport)

interface Props {
  modelValue?: number | null
  days?: number[]
  minDay?: number
  maxDay?: number
  icon?: string
  tooltip?: string
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  days: () => [],
  minDay: 1,
  maxDay: 31,
  icon: 'calendar-03',
  tooltip: 'Jump to Schedule Date',
  loading: false,
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void
  (e: 'select', day: number): void
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLDivElement | null>(null)
const panelRef = ref<HTMLDivElement | null>(null)
const scrollListRef = ref<HTMLDivElement | null>(null)

// Generate days list: either custom schedule days or fallback to 1..31
const daysList = computed<number[]>(() => {
  if (Array.isArray(props.days) && props.days.length > 0) {
    return Array.from(new Set(props.days)).sort((a, b) => a - b)
  }
  const list: number[] = []
  for (let i = props.minDay; i <= props.maxDay; i++) {
    list.push(i)
  }
  return list
})

const currentActiveDay = ref<number>(
  props.modelValue || daysList.value[0] || new Date().getDate()
)

// Check if day is 1 index away from active day
const isAdjacent = (day: number) => {
  const activeIdx = daysList.value.indexOf(currentActiveDay.value)
  const itemIdx = daysList.value.indexOf(day)
  if (activeIdx === -1 || itemIdx === -1) return false
  return Math.abs(activeIdx - itemIdx) === 1
}

// Find index for day (with closest fallback)
const getIndexForDay = (day: number): number => {
  if (daysList.value.length === 0) return 0
  const idx = daysList.value.indexOf(day)
  if (idx !== -1) return idx

  let closestIdx = 0
  let minDiff = Infinity
  daysList.value.forEach((d, i) => {
    const diff = Math.abs(d - day)
    if (diff < minDiff) {
      minDiff = diff
      closestIdx = i
    }
  })
  return closestIdx
}

// Find closest day in daysList
const findClosestDay = (target: number): number => {
  if (daysList.value.length === 0) return target
  const idx = getIndexForDay(target)
  return daysList.value[idx] ?? target
}

// Key typing buffer for numeric typing
let typedBuffer = ''
let typedBufferTimeout: ReturnType<typeof setTimeout> | null = null

const tooltipText = computed(() => {
  if (props.modelValue !== null && props.modelValue !== undefined) {
    return `Jumped to Day ${props.modelValue}`
  }
  return props.tooltip
})

watch(
  () => props.modelValue,
  (val) => {
    if (val !== null && val !== undefined) {
      currentActiveDay.value = val
      if (isOpen.value) {
        scrollToDay(val, true)
      }
    }
  }
)

watch(
  daysList,
  (newList) => {
    if (newList.length > 0 && !newList.includes(currentActiveDay.value)) {
      currentActiveDay.value = newList[0] ?? 1
    }
  }
)

const toggleOpen = () => {
  if (props.disabled || daysList.value.length === 0) return
  isOpen.value ? closePopover() : openPopover()
}

const openPopover = () => {
  isOpen.value = true
  typedBuffer = ''
  const targetDay = props.modelValue || currentActiveDay.value || daysList.value[0] || 1
  currentActiveDay.value = findClosestDay(targetDay)

  window.addEventListener('keydown', handleGlobalKeydown)

  nextTick(() => {
    panelRef.value?.focus()
    scrollToDay(currentActiveDay.value, false)
  })
}

const closePopover = () => {
  isOpen.value = false
  typedBuffer = ''
  if (typedBufferTimeout) clearTimeout(typedBufferTimeout)
  window.removeEventListener('keydown', handleGlobalKeydown)
}

const scrollToDay = (day: number, smooth = true) => {
  if (!scrollListRef.value || daysList.value.length === 0) return
  const idx = getIndexForDay(day)
  const targetTop = idx * ITEM_HEIGHT
  scrollListRef.value.scrollTo({
    top: targetTop,
    behavior: smooth ? 'smooth' : 'auto'
  })
}

let scrollDebounce: ReturnType<typeof setTimeout> | null = null

const handleScroll = () => {
  if (!scrollListRef.value || daysList.value.length === 0) return
  const scrollTop = scrollListRef.value.scrollTop
  const index = Math.round(scrollTop / ITEM_HEIGHT)
  const clampedIdx = Math.max(0, Math.min(daysList.value.length - 1, index))
  const candidateDay = daysList.value[clampedIdx] ?? currentActiveDay.value

  if (currentActiveDay.value !== candidateDay) {
    currentActiveDay.value = candidateDay
  }

  if (scrollDebounce) clearTimeout(scrollDebounce)
  scrollDebounce = setTimeout(() => {
    scrollToDay(currentActiveDay.value, true)
  }, 120)
}

// Click to confirm: selects the day, emits, and immediately closes the popover
const confirmDay = (day: number) => {
  currentActiveDay.value = day
  emit('update:modelValue', day)
  emit('select', day)
  closePopover()
}

// Global keyboard handler while popover is open
const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (!isOpen.value || daysList.value.length === 0) return

  // Numbers 0-9: type-ahead numeric jump
  if (/^[0-9]$/.test(event.key)) {
    event.preventDefault()
    typedBuffer += event.key
    const parsed = parseInt(typedBuffer, 10)

    const targetDay = findClosestDay(parsed)
    currentActiveDay.value = targetDay
    scrollToDay(targetDay, true)

    if (typedBufferTimeout) clearTimeout(typedBufferTimeout)
    typedBufferTimeout = setTimeout(() => {
      typedBuffer = ''
    }, 900)
    return
  }

  const currentIdx = daysList.value.indexOf(currentActiveDay.value)

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    const nextIdx = Math.max(0, currentIdx - 1)
    const next = daysList.value[nextIdx] ?? currentActiveDay.value
    currentActiveDay.value = next
    scrollToDay(next, true)
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    const nextIdx = Math.min(daysList.value.length - 1, currentIdx + 1)
    const next = daysList.value[nextIdx] ?? currentActiveDay.value
    currentActiveDay.value = next
    scrollToDay(next, true)
  } else if (event.key === 'Enter') {
    event.preventDefault()
    confirmDay(currentActiveDay.value)
  } else if (event.key === 'Escape') {
    event.preventDefault()
    closePopover()
  }
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  if (
    containerRef.value &&
    !containerRef.value.contains(target) &&
    panelRef.value &&
    !panelRef.value.contains(target)
  ) {
    closePopover()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('keydown', handleGlobalKeydown)
  if (scrollDebounce) clearTimeout(scrollDebounce)
  if (typedBufferTimeout) clearTimeout(typedBufferTimeout)
})
</script>

<style scoped>
/* Cupertino fade-out gradient mask: smooth fade at top and bottom edges */
.cupertino-wheel {
  mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.25) 15%,
    rgba(0, 0, 0, 1) 35%,
    rgba(0, 0, 0, 1) 65%,
    rgba(0, 0, 0, 0.25) 85%,
    rgba(0, 0, 0, 0) 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.25) 15%,
    rgba(0, 0, 0, 1) 35%,
    rgba(0, 0, 0, 1) 65%,
    rgba(0, 0, 0, 0.25) 85%,
    rgba(0, 0, 0, 0) 100%
  );
}

/* Hide scrollbar for standard iOS wheel drum appearance */
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
