<template>
  <div :class="[($slots.default && !label) ? 'inline-flex' : 'flex flex-col gap-1 w-full']">
    <!-- Label -->
    <label v-if="label" :for="triggerId"
      class="text-sm font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-0.5 self-start">
      <span>{{ label }}</span>
      <span v-if="required && !readonly" class="text-red-500 font-bold" aria-hidden="true">*</span>
    </label>

    <!-- Wrapper -->
    <div ref="rootRef" class="relative" :class="[($slots.default && !label) ? 'inline-flex' : 'w-full']">
      <!-- Custom Trigger Slot -->
      <div v-if="$slots.default" ref="triggerRef" @click="toggleOpen" class="inline-flex cursor-pointer">
        <slot :toggle="toggleOpen" :open="open" :display-text="displayText" />
      </div>

      <!-- Standard Trigger Button -->
      <button v-else :id="triggerId" ref="triggerRef" type="button" :disabled="disabled" :aria-readonly="readonly || undefined"
        :tabindex="readonly ? -1 : undefined" @click="toggleOpen"
        class="flex h-9 w-full items-center justify-between rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-white transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
        :class="[
          readonly ? 'cursor-default select-none focus:ring-0 focus:border-theme-input' : '',
          error
            ? 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/10 dark:bg-red-950/10'
            : 'border-theme-input bg-theme-input focus:ring-emerald-500 focus:border-emerald-500'
        ]">
        <span class="truncate" :class="!displayText && 'text-slate-400 dark:text-slate-500'">
          {{ displayText || placeholder }}
        </span>
        <svg v-if="!readonly" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="ml-2 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </button>

      <!-- Calendar popover – teleported to body so it escapes overflow/z-index of any parent -->
      <Teleport to="body">
        <Transition enter-active-class="transition ease-out duration-100" enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-75"
          leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
          <div v-if="open" ref="popoverRef" @touchstart="handleTouchStart" @touchend="handleTouchEnd"
            class="fixed z-[10050] rounded-xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card shadow-lg p-2.5"
            :style="popoverStyle">
            <!-- Navigation -->
            <div class="flex items-center justify-between mb-2">
              <button v-if="!showYearSelector" type="button"
                @click="effectiveMode === 'month' ? goToPrevYear() : goToPrevMonth()"
                :disabled="effectiveMode === 'month' ? isPrevYearDisabled : isPrevDisabled"
                class="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-theme-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <div v-else class="w-6 h-6"></div>

              <button type="button" @click="showYearSelector = !showYearSelector"
                class="text-xs font-semibold text-slate-800 dark:text-slate-100 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors px-2 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-theme-hover flex items-center gap-1">
                <span>{{ showYearSelector ? viewYear : (effectiveMode === 'month' ? viewYear : monthLabel) }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 transition-transform"
                  :class="showYearSelector ? 'rotate-180' : ''">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              <button v-if="!showYearSelector" type="button"
                @click="effectiveMode === 'month' ? goToNextYear() : goToNextMonth()"
                :disabled="effectiveMode === 'month' ? isNextYearDisabled : isNextDisabled"
                class="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-theme-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
              <div v-else class="w-6 h-6"></div>
            </div>

            <!-- Year Selector Grid (Tight Grid Border) -->
            <div v-if="showYearSelector" ref="yearContainerRef"
              class="grid grid-cols-4 gap-px bg-slate-200 dark:bg-theme-border rounded-lg border border-slate-200 dark:border-theme-border overflow-hidden max-h-[190px] overflow-y-auto scrollbar-thin">
              <button v-for="year in yearsList" :key="year" type="button" @click="selectYear(year)"
                class="py-2 text-center text-xs transition-colors font-medium"
                :class="year === viewYear ? 'bg-emerald-600 text-white font-semibold dark:bg-emerald-500 dark:text-white' : 'bg-white dark:bg-theme-card text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-theme-hover'">
                {{ year }}
              </button>
            </div>

            <!-- Month Selector Grid (mode === 'month') with 1px Grid Border Matrix -->
            <div v-else-if="effectiveMode === 'month'"
              class="grid grid-cols-3 gap-px bg-slate-200 dark:bg-theme-border rounded-lg border border-slate-200 dark:border-theme-border overflow-hidden">
              <button v-for="(mName, idx) in monthNames" :key="mName" type="button" :disabled="isMonthDisabled(idx)"
                @click="handleMonthClick(idx)"
                class="py-2.5 text-center text-xs transition-colors font-medium flex flex-col items-center justify-center relative disabled:cursor-not-allowed"
                :class="[
                  isMonthSelected(idx)
                    ? 'bg-emerald-600 text-white font-semibold dark:bg-emerald-500 dark:text-white z-10 shadow-xs'
                    : isMonthDisabled(idx)
                      ? 'bg-slate-50 dark:bg-theme-app/50 text-slate-300 dark:text-slate-600'
                      : isCurrentMonth(idx)
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/25 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-100/60 dark:hover:bg-emerald-950/50'
                        : 'bg-white dark:bg-theme-card text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-theme-hover'
                ]">
                <span>{{ mName }}</span>
                <span v-if="isCurrentMonth(idx) && !isMonthSelected(idx)"
                  class="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500"></span>
              </button>
            </div>

            <!-- Normal Calendar Grid -->
            <div v-else>
              <!-- Weekday header -->
              <div class="grid grid-cols-7 mb-0.5">
                <span v-for="day in weekdayLabels" :key="day"
                  class="flex h-7 items-center justify-center text-[12px] font-medium text-slate-400 dark:text-slate-500">
                  {{ day }}
                </span>
              </div>

              <!-- Day grid -->
              <div class="grid grid-cols-7" @mouseleave="hoverDate = null">
                <button v-for="cell in calendarCells" :key="cell.iso" type="button" :disabled="cell.disabled"
                  @click="handleDayClick(cell)" @mouseenter="handleDayHover(cell)"
                  class="relative flex h-7 w-full items-center justify-center rounded text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                  :class="dayClasses(cell)">
                  {{ cell.date.getDate() }}
                </button>
              </div>
            </div>

            <!-- Time Picker (Hours / Minutes) -->
            <div v-if="props.showTime && !showYearSelector"
              class="flex items-center justify-between gap-3 px-2.5 py-1.5 bg-slate-50/65 dark:bg-theme-app/50 border-t border-theme-border">
              <span
                class="font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Time
              </span>
              <div class="flex items-center gap-1 select-none">
                <!-- Hours -->
                <UiTooltip content="Scroll to adjust hours" position="top" teleport>
                  <div @wheel.prevent="handleHourWheel"
                    class="flex items-center justify-center w-10 h-7 bg-theme-input border border-theme-input rounded text-xs font-bold text-slate-700 dark:text-slate-200 cursor-ns-resize hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors">
                    {{ pad(selectedHour) }}
                  </div>
                </UiTooltip>
                <span class="font-bold text-slate-400 dark:text-slate-600">:</span>
                <!-- Minutes -->
                <UiTooltip content="Scroll to adjust minutes" position="top" teleport>
                  <div @wheel.prevent="handleMinuteWheel"
                    class="flex items-center justify-center w-10 h-7 bg-theme-input border border-theme-input rounded text-xs font-bold text-slate-700 dark:text-slate-200 cursor-ns-resize hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors">
                    {{ pad(selectedMinute) }}
                  </div>
                </UiTooltip>
              </div>
            </div>

            <!-- Footer -->
            <div v-if="props.showToday || props.clearable || props.confirm || props.mode === 'multiple'" class="flex gap-2 mt-2 pt-1.5 border-t border-slate-100 dark:border-theme-border">
              <button v-if="props.showToday" type="button" @click="handleTodayClick"
                class="flex-1 py-1.5 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-theme-hover rounded-lg transition-colors cursor-pointer">
                Today
              </button>
              <button v-if="props.clearable" type="button" @click="clearSelection"
                class="flex-1 py-1.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-theme-hover border border-theme-border rounded-lg transition-colors cursor-pointer">
                Clear
              </button>
              <button v-if="props.confirm || props.mode === 'multiple'" type="button" @click="closeDropdown"
                class="flex-1 py-1.5 text-center text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors cursor-pointer">
                Apply
              </button>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>

    <!-- Error message display -->
    <span v-if="typeof error === 'string' && error" class="text-xs text-red-500 dark:text-red-400 mt-0.5 font-normal">
      {{ error }}
    </span>

    <!-- Hint / Help Text -->
    <span v-if="hint" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
      {{ hint }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import UiTooltip from '~/components/ui/Tooltip.vue'

defineOptions({
  inheritAttrs: false
})

export type DateRangeValue = { start: string | null; end: string | null }
interface Props {
  label?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  placeholder?: string
  /** Earliest selectable date, format 'YYYY-MM-DD' or a Date object */
  min?: string | Date
  /** Latest selectable date, format 'YYYY-MM-DD' or a Date object */
  max?: string | Date
  minDate?: string | Date
  maxDate?: string | Date
  /**
   * 'single'   -> pick exactly one date
   * 'range'    -> pick a contiguous start/end range
   * 'multiple' -> pick any number of separate, non-contiguous dates (e.g. 1, 5, 8)
   * 'month'    -> pick a specific Year & Month ('YYYY-MM')
   */
  mode?: 'single' | 'range' | 'multiple' | 'month'
  range?: boolean
  multiple?: boolean
  confirm?: boolean
  error?: string | boolean
  clearable?: boolean
  showTime?: boolean
  showToday?: boolean
  /**
   * Days of the week to disable (e.g. [0, 6] for Sunday & Saturday, or ['sunday', 'saturday', 'weekend']),
   * or specific date strings / custom predicate function (date: Date, iso: string) => boolean.
   */
  disabledDays?: (number | string)[] | ((date: Date, iso: string) => boolean)
  disabledDaysOfWeek?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  hint: '',
  required: false,
  disabled: false,
  readonly: false,
  placeholder: 'Select date',
  min: undefined,
  max: undefined,
  minDate: undefined,
  maxDate: undefined,
  mode: 'single',
  range: false,
  multiple: false,
  confirm: false,
  error: false,
  clearable: true,
  showTime: false,
  showToday: false,
  disabledDays: () => [],
  disabledDaysOfWeek: () => []
})
const emit = defineEmits<{
  (e: 'change', value: string | string[] | DateRangeValue | null): void
}>()

const effectiveMode = computed<'single' | 'range' | 'multiple' | 'month'>(() => {
  if (props.range) return 'range'
  if (props.multiple) return 'multiple'
  return props.mode || 'single'
})

// modelValue shape depends on `mode`:
// - single   -> string ('YYYY-MM-DD') | null
// - range    -> { start: string | null, end: string | null }
// - multiple -> string[]
const modelValue = defineModel<string | string[] | DateRangeValue | null>({
  default: null
})

const triggerId = useId()
const rootRef = ref<HTMLDivElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const popoverRef = ref<HTMLDivElement | null>(null)
const open = ref(false)
const showYearSelector = ref(false)
const yearContainerRef = ref<HTMLDivElement | null>(null)
const hoverDate = ref<string | null>(null)

// ---------- popover positioning ----------
const popoverStyle = ref<Record<string, string>>({})

const updatePopoverPosition = () => {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  const popoverWidth = effectiveMode.value === 'month' ? 240 : 256
  const popoverHeight = props.showTime ? 330 : (effectiveMode.value === 'month' ? 210 : 290)
  const spaceBelow = window.innerHeight - rect.bottom
  const placeAbove = spaceBelow < popoverHeight && rect.top > popoverHeight

  const maxLeft = typeof window !== 'undefined' ? Math.max(16, window.innerWidth - popoverWidth - 16) : rect.left
  const left = typeof window !== 'undefined' ? Math.min(Math.max(16, rect.left), maxLeft) : rect.left

  popoverStyle.value = {
    left: `${left}px`,
    width: `${popoverWidth}px`,
    ...(placeAbove
      ? { bottom: `${window.innerHeight - rect.top + 4}px`, top: 'auto' }
      : { top: `${rect.bottom + 4}px`, bottom: 'auto' })
  }
}

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// ---------- date helpers ----------
const pad = (n: any) => {
  const val = (n && typeof n === 'object' && 'value' in n) ? n.value : n
  return String(val !== undefined && val !== null ? val : '').padStart(2, '0')
}
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const toISODateTimeString = (datePart: string, hour: number, minute: number) => {
  const parts = datePart.split('-').map(Number)
  const localDate = new Date(parts[0] ?? 1970, (parts[1] ?? 1) - 1, parts[2] ?? 1, hour, minute, 0)
  return localDate.toISOString()
}
const parseISO = (s: string) => {
  if (!s || typeof s !== 'string' || !s.trim()) return new Date()
  if (s.includes('T') || s.includes('Z') || s.includes('+') || (s.includes('-') && s.length > 10)) {
    const d = new Date(s)
    if (!isNaN(d.getTime())) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate())
    }
  }
  const parts = s.slice(0, 10).split('-')
  if (parts.length === 2) {
    const [y = 1970, m = 1] = parts.map(Number)
    if (!isNaN(y) && !isNaN(m) && y !== 0) return new Date(y, m - 1, 1)
  }
  if (parts.length < 3) return new Date()
  const [y = 1970, m = 1, d = 1] = parts.map(Number)
  if (isNaN(y) || isNaN(m) || isNaN(d) || y === 0) return new Date()
  return new Date(y, m - 1, d)
}
const toDate = (v?: string | Date): Date | null => {
  if (!v) return null
  return v instanceof Date ? v : parseISO(v)
}
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const isBefore = (a: Date, b: Date) => a.getTime() < b.getTime()
const isAfter = (a: Date, b: Date) => a.getTime() > b.getTime()
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

// ---------- time picker state & interaction ----------
const now = new Date()
const selectedHour = ref(now.getHours())
const selectedMinute = ref(now.getMinutes())

const parseTimeFromModelValue = (val: any) => {
  if (typeof val === 'string' && val) {
    if (val.includes('T') || val.includes('Z') || val.includes('+') || (val.includes('-') && val.length > 10)) {
      const d = new Date(val)
      if (!isNaN(d.getTime())) {
        selectedHour.value = d.getHours()
        selectedMinute.value = d.getMinutes()
        return
      }
    }
    const matches = val.match(/[\sT](\d{2}):(\d{2})/)
    if (matches) {
      selectedHour.value = parseInt(matches[1] ?? '0')
      selectedMinute.value = parseInt(matches[2] ?? '0')
      return
    }
  }
  const current = new Date()
  selectedHour.value = current.getHours()
  selectedMinute.value = current.getMinutes()
}

watch(modelValue, (newVal) => {
  parseTimeFromModelValue(newVal)
}, { immediate: true })

const getLocalDatePart = (val: any): string => {
  if (typeof val === 'string' && val) {
    if (val.includes('T') || val.includes('Z') || val.includes('+') || (val.includes('-') && val.length > 10)) {
      const d = new Date(val)
      if (!isNaN(d.getTime())) {
        return toISO(d)
      }
    }
    return val.slice(0, 10)
  }
  return toISO(new Date())
}

const updateModelWithTime = () => {
  if (effectiveMode.value === 'single') {
    const datePart = getLocalDatePart(modelValue.value)
    const val = props.showTime
      ? toISODateTimeString(datePart, selectedHour.value, selectedMinute.value)
      : datePart
    modelValue.value = val
    emit('change', val)
  }
}

const handleHourWheel = (e: WheelEvent) => {
  e.preventDefault()
  if (e.deltaY < 0) {
    selectedHour.value = (selectedHour.value + 1) % 24
  } else {
    selectedHour.value = (selectedHour.value + 23) % 24
  }
  updateModelWithTime()
}

const handleMinuteWheel = (e: WheelEvent) => {
  e.preventDefault()
  if (e.deltaY < 0) {
    selectedMinute.value = (selectedMinute.value + 1) % 60
  } else {
    selectedMinute.value = (selectedMinute.value + 59) % 60
  }
  updateModelWithTime()
}

const minDate = computed(() => {
  const val = props.minDate !== undefined ? props.minDate : props.min
  return toDate(val) ? startOfDay(toDate(val)!) : null
})
const maxDate = computed(() => {
  const val = props.maxDate !== undefined ? props.maxDate : props.max
  return toDate(val) ? startOfDay(toDate(val)!) : null
})

// ---------- selection state, normalised regardless of mode ----------
const singleDate = computed<Date | null>(() =>
  effectiveMode.value === 'single' && typeof modelValue.value === 'string' && modelValue.value ? parseISO(modelValue.value) : null
)
const rangeValue = computed<DateRangeValue>(() => {
  if (effectiveMode.value === 'range' && modelValue.value && typeof modelValue.value === 'object' && !Array.isArray(modelValue.value)) {
    return modelValue.value as DateRangeValue
  }
  return { start: null, end: null }
})
const multipleDates = computed<string[]>(() =>
  effectiveMode.value === 'multiple' && Array.isArray(modelValue.value) ? (modelValue.value as string[]) : []
)

const handleDayHover = (cell: CalendarCell) => {
  if (effectiveMode.value === 'range' && rangeValue.value.start && !rangeValue.value.end) {
    hoverDate.value = cell.iso
  }
}

// ---------- calendar navigation ----------
const initialAnchor = (() => {
  if (effectiveMode.value === 'single' && typeof modelValue.value === 'string' && modelValue.value) return parseISO(modelValue.value)
  if (effectiveMode.value === 'multiple' && Array.isArray(modelValue.value) && modelValue.value.length) {
    return parseISO(modelValue.value[0]!)
  }
  if (
    effectiveMode.value === 'range' &&
    modelValue.value &&
    typeof modelValue.value === 'object' &&
    (modelValue.value as DateRangeValue).start
  ) {
    return parseISO((modelValue.value as DateRangeValue).start as string)
  }
  return new Date()
})()

const viewYear = ref(initialAnchor.getFullYear())
const viewMonth = ref(initialAnchor.getMonth())

const isPrevDisabled = computed(() => {
  if (!minDate.value) return false
  const minYear = minDate.value.getFullYear()
  const minMonth = minDate.value.getMonth()
  return viewYear.value < minYear || (viewYear.value === minYear && viewMonth.value <= minMonth)
})

const isNextDisabled = computed(() => {
  if (!maxDate.value) return false
  const maxYear = maxDate.value.getFullYear()
  const maxMonth = maxDate.value.getMonth()
  return viewYear.value > maxYear || (viewYear.value === maxYear && viewMonth.value >= maxMonth)
})

const isPrevYearDisabled = computed(() => {
  if (!minDate.value) return false
  return viewYear.value <= minDate.value.getFullYear()
})

const isNextYearDisabled = computed(() => {
  if (!maxDate.value) return false
  return viewYear.value >= maxDate.value.getFullYear()
})

const goToPrevYear = () => {
  if (isPrevYearDisabled.value) return
  viewYear.value -= 1
}

const goToNextYear = () => {
  if (isNextYearDisabled.value) return
  viewYear.value += 1
}

const isCurrentMonth = (monthIndex: number) => {
  const now = new Date()
  return now.getFullYear() === viewYear.value && now.getMonth() === monthIndex
}

const isMonthSelected = (monthIndex: number) => {
  if (effectiveMode.value !== 'month' || typeof modelValue.value !== 'string' || !modelValue.value) return false
  const parts = modelValue.value.slice(0, 7).split('-')
  if (parts.length < 2) return false
  return Number(parts[0]) === viewYear.value && Number(parts[1]) === monthIndex + 1
}

const isMonthDisabled = (monthIndex: number) => {
  if (minDate.value) {
    const minYear = minDate.value.getFullYear()
    const minMonth = minDate.value.getMonth()
    if (viewYear.value < minYear || (viewYear.value === minYear && monthIndex < minMonth)) return true
  }
  if (maxDate.value) {
    const maxYear = maxDate.value.getFullYear()
    const maxMonth = maxDate.value.getMonth()
    if (viewYear.value > maxYear || (viewYear.value === maxYear && monthIndex > maxMonth)) return true
  }
  return false
}

const handleMonthClick = (monthIndex: number) => {
  const val = `${viewYear.value}-${pad(monthIndex + 1)}`
  modelValue.value = val
  emit('change', val)
  if (!props.confirm) {
    closeDropdown()
  }
}

const touchStartX = ref(0)
const touchStartY = ref(0)
const touchEndX = ref(0)
const touchEndY = ref(0)

const handleTouchStart = (event: TouchEvent) => {
  if (showYearSelector.value) return
  const touch = event.changedTouches[0]
  if (!touch) return
  touchStartX.value = touch.screenX
  touchStartY.value = touch.screenY
}

const handleTouchEnd = (event: TouchEvent) => {
  if (showYearSelector.value) return
  const touch = event.changedTouches[0]
  if (!touch) return
  touchEndX.value = touch.screenX
  touchEndY.value = touch.screenY

  handleSwipeGesture()
}

const handleSwipeGesture = () => {
  const diffX = touchEndX.value - touchStartX.value
  const diffY = touchEndY.value - touchStartY.value

  const thresholdX = 50
  const thresholdY = 80

  if (Math.abs(diffX) > thresholdX && Math.abs(diffY) < thresholdY) {
    if (diffX < 0) {
      if (!isNextDisabled.value) {
        goToNextMonth()
      }
    } else {
      if (!isPrevDisabled.value) {
        goToPrevMonth()
      }
    }
  }
}

const monthLabel = computed(() =>
  new Date(viewYear.value, viewMonth.value, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
)

const yearsList = computed(() => {
  const currentYear = new Date().getFullYear()
  const startYear = minDate.value ? minDate.value.getFullYear() : 1900
  const endYear = maxDate.value ? maxDate.value.getFullYear() : currentYear + 20

  const years = []
  for (let y = endYear; y >= startYear; y--) {
    years.push(y)
  }
  return years
})

const selectYear = (year: number) => {
  viewYear.value = year
  showYearSelector.value = false
}

watch(showYearSelector, async (val) => {
  if (val) {
    await nextTick()
    const activeEl = yearContainerRef.value?.querySelector('.bg-emerald-500')
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'center', behavior: 'instant' as any })
    }
  }
})

const goToPrevMonth = () => {
  if (isPrevDisabled.value) return
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value -= 1
  } else {
    viewMonth.value -= 1
  }
}
const goToNextMonth = () => {
  if (isNextDisabled.value) return
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value += 1
  } else {
    viewMonth.value += 1
  }
}

// ---------- calendar grid (42 cells: leading/trailing days included) ----------
interface CalendarCell {
  date: Date
  iso: string
  inCurrentMonth: boolean
  disabled: boolean
}

const isDayDisabledByRule = (date: Date, iso: string): boolean => {
  if (typeof props.disabledDays === 'function') {
    if (props.disabledDays(date, iso)) return true
  }

  const dayOfWeek = date.getDay() // 0=Sunday, 6=Saturday
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayShortNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

  if (Array.isArray(props.disabledDaysOfWeek) && props.disabledDaysOfWeek.length > 0) {
    if (props.disabledDaysOfWeek.includes(dayOfWeek)) return true
  }

  if (Array.isArray(props.disabledDays) && props.disabledDays.length > 0) {
    for (const rule of props.disabledDays) {
      if (typeof rule === 'number' && rule === dayOfWeek) return true
      if (typeof rule === 'string') {
        const r = rule.trim().toLowerCase()
        if (r === 'weekend' && (dayOfWeek === 0 || dayOfWeek === 6)) return true
        if (r === 'weekday' && dayOfWeek >= 1 && dayOfWeek <= 5) return true
        if (dayNames[dayOfWeek] === r || dayShortNames[dayOfWeek] === r) return true
        if (iso === r) return true
      }
    }
  }

  return false
}

const calendarCells = computed<CalendarCell[]>(() => {
  const firstOfMonth = new Date(viewYear.value, viewMonth.value, 1)
  const startOffset = firstOfMonth.getDay() // 0 = Sunday
  const daysInMonth = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()

  const totalCellsNeeded = startOffset + daysInMonth
  const numCells = totalCellsNeeded <= 28 ? 28 : (totalCellsNeeded <= 35 ? 35 : 42)

  const gridStart = new Date(viewYear.value, viewMonth.value, 1 - startOffset)

  const cells: CalendarCell[] = []
  for (let i = 0; i < numCells; i++) {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i)
    const normalised = startOfDay(date)
    const iso = toISO(date)
    const disabled =
      (minDate.value !== null && isBefore(normalised, minDate.value)) ||
      (maxDate.value !== null && isAfter(normalised, maxDate.value)) ||
      isDayDisabledByRule(date, iso)

    cells.push({
      date,
      iso,
      inCurrentMonth: date.getMonth() === viewMonth.value,
      disabled
    })
  }
  return cells
})

// ---------- selection styling ----------
const today = startOfDay(new Date())

const dayClasses = (cell: CalendarCell) => {
  const classes: string[] = []
  const d = startOfDay(cell.date)

  if (!cell.inCurrentMonth) classes.push('text-slate-300 dark:text-slate-600')
  else classes.push('text-slate-900 dark:text-white')

  let isSelected = false
  let isRangeStart = false
  let isRangeEnd = false
  let isInRange = false

  if (effectiveMode.value === 'single' && singleDate.value) {
    isSelected = isSameDay(d, singleDate.value)
  } else if (effectiveMode.value === 'multiple') {
    isSelected = multipleDates.value.includes(cell.iso)
  } else if (effectiveMode.value === 'range') {
    const { start, end } = rangeValue.value
    const activeEnd = end || (hoverDate.value && hoverDate.value !== start ? hoverDate.value : null)
    const startD = start ? parseISO(start) : null
    const endD = activeEnd ? parseISO(activeEnd) : null

    if (startD && isSameDay(d, startD)) isRangeStart = true
    if (endD && isSameDay(d, endD)) isRangeEnd = true

    if (startD && endD) {
      const actualStart = isBefore(startD, endD) ? startD : endD
      const actualEnd = isBefore(startD, endD) ? endD : startD
      if (isAfter(d, actualStart) && isBefore(d, actualEnd)) {
        isInRange = true
      }
    }
  }

  if (isSelected || isRangeStart || isRangeEnd) {
    classes.push('!bg-emerald-600 !text-white dark:!bg-emerald-500 dark:!text-white font-semibold shadow-xs ring-1 ring-emerald-400/50 dark:ring-emerald-400/60')
  } else if (isInRange) {
    classes.push('bg-emerald-500/20 text-emerald-950 dark:bg-emerald-500/25 dark:text-emerald-200 rounded-none font-semibold')
  } else if (!cell.disabled) {
    classes.push('hover:bg-slate-100 dark:hover:bg-theme-hover')
  }

  if (isSameDay(d, today) && !isSelected && !isRangeStart && !isRangeEnd) {
    classes.push('ring-1 ring-inset ring-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold')
  }

  return classes.join(' ')
}

// ---------- display text on the trigger ----------
const formatShort = (iso: string) =>
  parseISO(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })

const displayText = computed(() => {
  if (effectiveMode.value === 'month') {
    if (!modelValue.value || typeof modelValue.value !== 'string') return ''
    const parts = modelValue.value.slice(0, 7).split('-')
    if (parts.length >= 2) {
      const y = Number(parts[0])
      const m = Number(parts[1]) - 1
      if (!isNaN(y) && !isNaN(m) && m >= 0 && m <= 11) {
        return new Date(y, m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }
    }
    return modelValue.value
  }
  if (effectiveMode.value === 'single') {
    if (!singleDate.value) return ''
    const dateStr = formatShort(toISO(singleDate.value))
    if (props.showTime) {
      return `${dateStr} ${pad(selectedHour.value)}:${pad(selectedMinute.value)}`
    }
    return dateStr
  }
  if (effectiveMode.value === 'range') {
    const { start, end } = rangeValue.value
    if (start && end) {
      if (start === end) return formatShort(start)
      return `${formatShort(start)} - ${formatShort(end)}`
    }
    if (start) return `${formatShort(start)} - ...`
    return ''
  }
  // multiple
  const dates = multipleDates.value
  if (dates.length === 0) return ''
  if (dates.length <= 2) return [...dates].sort().map(formatShort).join(', ')
  return `${dates.length} dates selected`
})

// ---------- interaction ----------
let lastToggleTime = 0
const toggleOpen = () => {
  if (props.disabled || props.readonly) return
  const now = Date.now()
  if (now - lastToggleTime < 150) return
  lastToggleTime = now
  open.value ? closeDropdown() : openDropdown()
}
const openDropdown = () => {
  if (props.disabled || props.readonly) return
  showYearSelector.value = false
  updatePopoverPosition()

  // Normalise visible month and year on open based on value or constraints
  let anchor = new Date()
  if (effectiveMode.value === 'month' && typeof modelValue.value === 'string' && modelValue.value) {
    const parts = modelValue.value.slice(0, 7).split('-')
    if (parts.length >= 2) {
      const y = Number(parts[0])
      const m = Number(parts[1]) - 1
      if (!isNaN(y) && !isNaN(m)) {
        anchor = new Date(y, m, 1)
      }
    }
  } else if (effectiveMode.value === 'single' && typeof modelValue.value === 'string' && modelValue.value) {
    anchor = parseISO(modelValue.value)
  } else if (effectiveMode.value === 'multiple' && Array.isArray(modelValue.value) && modelValue.value.length) {
    anchor = parseISO(modelValue.value[0]!)
  } else if (
    effectiveMode.value === 'range' &&
    modelValue.value &&
    typeof modelValue.value === 'object' &&
    (modelValue.value as DateRangeValue).start
  ) {
    anchor = parseISO((modelValue.value as DateRangeValue).start as string)
  } else {
    // If no date selected, check max and min date constraints
    const maxVal = toDate(props.max)
    const minVal = toDate(props.min)
    if (maxVal && anchor > maxVal) {
      anchor = maxVal
    } else if (minVal && anchor < minVal) {
      anchor = minVal
    }
  }

  viewYear.value = anchor.getFullYear()
  viewMonth.value = anchor.getMonth()

  open.value = true
}
const closeDropdown = () => {
  open.value = false
  showYearSelector.value = false
  hoverDate.value = null
  nextTick(() => triggerRef.value?.focus())
}

const handleDayClick = (cell: CalendarCell) => {
  if (cell.disabled) return

  if (effectiveMode.value === 'single') {
    const val = props.showTime
      ? toISODateTimeString(cell.iso, selectedHour.value, selectedMinute.value)
      : cell.iso
    modelValue.value = val
    emit('change', val)
    if (!props.confirm) {
      closeDropdown()
    }
    return
  }

  if (effectiveMode.value === 'multiple') {
    const set = new Set(multipleDates.value)
    if (set.has(cell.iso)) set.delete(cell.iso)
    else set.add(cell.iso)
    const next = Array.from(set).sort()
    modelValue.value = next
    emit('change', next)
    return
  }

  // range mode: click 1 sets start, click 2 sets end (auto-swaps if end < start),
  // click 3 starts a new range
  const { start, end } = rangeValue.value
  let next: DateRangeValue

  if (!start || (start && end)) {
    next = { start: cell.iso, end: null }
    hoverDate.value = null
  } else {
    const startD = parseISO(start)
    if (isBefore(cell.date, startD)) {
      next = { start: cell.iso, end: start }
    } else {
      next = { start, end: cell.iso }
    }
    hoverDate.value = null
  }

  modelValue.value = next
  emit('change', next)

  if (!props.confirm && next.start && next.end) {
    closeDropdown()
  }
}

const clearSelection = () => {
  hoverDate.value = null
  if (effectiveMode.value === 'month' || effectiveMode.value === 'single') {
    modelValue.value = null
    emit('change', null)
  } else if (effectiveMode.value === 'multiple') {
    modelValue.value = []
    emit('change', [])
  } else {
    modelValue.value = { start: null, end: null }
    emit('change', { start: null, end: null })
  }
}

const handleTodayClick = () => {
  const t = new Date()
  const normalised = startOfDay(t)
  const iso = toISO(t)
  const disabled =
    (minDate.value !== null && isBefore(normalised, minDate.value)) ||
    (maxDate.value !== null && isAfter(normalised, maxDate.value)) ||
    isDayDisabledByRule(t, iso)

  if (disabled) return

  viewYear.value = t.getFullYear()
  viewMonth.value = t.getMonth()

  if (effectiveMode.value === 'month') {
    handleMonthClick(t.getMonth())
    return
  }

  handleDayClick({
    date: t,
    iso,
    inCurrentMonth: true,
    disabled: false
  })
}

// ---------- close on outside click ----------
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  const inTrigger = rootRef.value?.contains(target)
  const inPopover = popoverRef.value?.contains(target)
  if (!inTrigger && !inPopover) {
    open.value = false
    showYearSelector.value = false
    hoverDate.value = null
  }
}
onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutside))

// Reset the view month if the mode changes at runtime
watch(
  () => [props.mode, props.range, props.multiple],
  () => {
    viewYear.value = new Date().getFullYear()
    viewMonth.value = new Date().getMonth()
  }
)

defineExpose({
  open: openDropdown,
  close: closeDropdown,
  toggle: toggleOpen
})
</script>