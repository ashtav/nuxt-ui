<template>
  <div class="flex flex-col gap-1 w-full" :class="[disabled && 'opacity-60 pointer-events-none']">
    <!-- Label -->
    <label v-if="label" :for="triggerId"
      class="text-sm font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-0.5 self-start">
      <span>{{ label }}</span>
      <span v-if="required && !readonly" class="text-red-500 font-bold" aria-hidden="true">*</span>
    </label>

    <!-- Trigger Wrapper -->
    <div ref="rootRef" class="relative w-full">
      <button :id="triggerId" ref="triggerRef" type="button" :disabled="disabled" :aria-readonly="readonly || undefined" :tabindex="readonly ? -1 : undefined" @click="toggleOpen"
        class="flex h-9 w-full items-center justify-between rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-white transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
        :class="[
          readonly ? 'cursor-default select-none focus:ring-0 focus:border-theme-input' : '',
          error
            ? 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/10 dark:bg-red-950/10'
            : 'border-theme-input bg-theme-input focus:ring-emerald-500 focus:border-emerald-500'
        ]">
        <div class="flex items-center gap-2 truncate flex-1 min-w-0">
          <svg v-if="!readonly" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>

          <!-- Range Display -->
          <template v-if="mode === 'range'">
            <span v-if="rangeStart && rangeEnd" class="truncate font-medium flex items-center gap-1.5 text-xs">
              <span>{{ rangeStart }}</span>
              <span class="text-slate-400">–</span>
              <span>{{ rangeEnd }}</span>
              <span v-if="formattedDuration"
                class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1 py-0.2 rounded">
                {{ formattedDuration }}
              </span>
            </span>
            <span v-else class="truncate text-slate-400 dark:text-slate-500">
              {{ placeholder || 'Select time range...' }}
            </span>
          </template>

          <!-- Single Display -->
          <template v-else>
            <span class="truncate" :class="!singleValue && 'text-slate-400 dark:text-slate-500'">
              {{ singleValue || placeholder || 'Select time...' }}
            </span>
          </template>
        </div>

        <!-- Clear or Chevron -->
        <div v-if="!readonly" class="flex items-center gap-1.5 shrink-0 ml-1.5">
          <button v-if="clearable && hasValue && !disabled" type="button" @click.stop="clearTime"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 flex items-center justify-center">
            <Icon name="cancel-01" class="text-xs" />
          </button>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 transition-transform" :class="open && 'rotate-180'">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      <!-- Teleported Popover (w-[256px] matching FormDatePicker) -->
      <Teleport to="body">
        <Transition enter-active-class="transition ease-out duration-100" enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-75"
          leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
          <div v-if="open" ref="popoverRef" :style="popoverStyle"
            class="fixed z-[9999] w-[241px] rounded-lg border border-theme-border bg-theme-card shadow-lg p-2.5 select-none">
            <!-- 1. Range Mode Header Tabs -->
            <div v-if="mode === 'range'" class="pb-2 mb-2 border-b border-theme-border">
              <!-- Start / End Toggle Buttons -->
              <div class="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 dark:bg-theme-app rounded-md">
                <button type="button" @click="setTab('start')"
                  class="flex items-center justify-between px-2 py-1 rounded text-xs transition cursor-pointer" :class="[
                    activeRangeTab === 'start'
                      ? 'bg-theme-card text-emerald-600 dark:text-emerald-400 font-bold shadow-xs border border-theme-border'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                  ]">
                  <span class="text-[9px] uppercase font-bold text-slate-400">Start</span>
                  <span class="text-xs font-mono font-bold">{{ rangeStart || '09:00' }}</span>
                </button>

                <button type="button" @click="setTab('end')"
                  class="flex items-center justify-between px-2 py-1 rounded text-xs transition cursor-pointer" :class="[
                    activeRangeTab === 'end'
                      ? 'bg-theme-card text-emerald-600 dark:text-emerald-400 font-bold shadow-xs border border-theme-border'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                  ]">
                  <span class="text-[9px] uppercase font-bold text-slate-400">End</span>
                  <span class="text-xs font-mono font-bold">{{ rangeEnd || '10:30' }}</span>
                </button>
              </div>
            </div>

            <!-- Single Mode Header -->
            <div v-else class="flex items-center justify-between pb-1.5 mb-1.5 border-b border-theme-border">
              <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Select Time
              </span>
              <span
                class="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded font-mono">
                {{ formatSelectedDisplay }}
              </span>
            </div>

            <!-- Two-Column Picker: Hours & Minutes (Hidden Scrollbars, Smooth Wheel Scroll) -->
            <div class="grid grid-cols-2 gap-2 h-40">
              <!-- Hours Column -->
              <div class="flex flex-col h-full min-h-0">
                <span
                  class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 text-center shrink-0">
                  Hour
                </span>
                <div ref="hoursContainerRef"
                  class="flex-1 overflow-y-auto max-h-36 pr-0.5 space-y-0.5 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <button v-for="h in hoursList" :key="h" :data-hour="h" :disabled="isHourDisabled(h)" type="button"
                    @click="selectHour(h)"
                    class="w-full py-1 text-xs font-medium rounded transition-colors text-center cursor-pointer font-mono disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    :class="[
                      currentEditingHour === h
                        ? 'bg-emerald-500 text-white font-bold shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-theme-hover'
                    ]">
                    {{ pad(h) }}
                  </button>
                </div>
              </div>

              <!-- Minutes Column -->
              <div class="flex flex-col h-full min-h-0">
                <span
                  class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 text-center shrink-0">
                  Minute
                </span>
                <div ref="minutesContainerRef"
                  class="flex-1 overflow-y-auto max-h-36 pr-0.5 space-y-0.5 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <button v-for="m in minutesList" :key="m" :data-minute="m" :disabled="isMinuteDisabled(m)"
                    type="button" @click="selectMinute(m)"
                    class="w-full py-1 text-xs font-medium rounded transition-colors text-center cursor-pointer font-mono disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    :class="[
                      currentEditingMinute === m
                        ? 'bg-emerald-500 text-white font-bold shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-theme-hover'
                    ]">
                    {{ pad(m) }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="pt-2 mt-2 border-t border-theme-border flex items-center justify-between gap-1">
              <button v-if="mode === 'single'" type="button" @click="setNow"
                class="px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-theme-hover rounded transition cursor-pointer">
                Now
              </button>
              <div v-else class="text-[10px] text-slate-400 font-medium truncate">
                {{ formattedDuration ? `Duration: ${formattedDuration}` : '' }}
              </div>

              <div class="flex items-center gap-1">
                <button type="button" @click="open = false"
                  class="px-2 py-0.5 text-[10px] font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-theme-hover rounded transition cursor-pointer">
                  Cancel
                </button>
                <button type="button" @click="confirmTime"
                  class="px-2.5 py-0.5 text-[10px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded transition shadow-xs cursor-pointer">
                  Done
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>

    <!-- Error message display -->
    <span v-if="typeof error === 'string' && error" class="text-xs text-red-500 dark:text-red-400 mt-0.5">
      {{ error }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, useId } from 'vue'

export type TimeRangeValue = { start: string; end: string }

const props = withDefaults(
  defineProps<{
    mode?: 'single' | 'range'
    modelValue?: string | TimeRangeValue | [string, string]
    label?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    clearable?: boolean
    error?: string | string[] | boolean
    minHour?: number
    maxHour?: number
    minTime?: string
    maxTime?: string
    min?: string
    max?: string
    minuteStep?: number
    step?: number
  }>(),
  {
    mode: 'single',
    modelValue: '',
    required: false,
    disabled: false,
    readonly: false,
    clearable: true,
    minHour: 0,
    maxHour: 23,
    minuteStep: 1,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'change', value: any): void
}>()

const triggerId = useId()
const rootRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)
const hoursContainerRef = ref<HTMLElement | null>(null)
const minutesContainerRef = ref<HTMLElement | null>(null)
const open = ref(false)

// Range state
const activeRangeTab = ref<'start' | 'end'>('start')
const rangeStart = ref('09:00')
const rangeEnd = ref('10:30')

// Single state
const singleValue = ref('09:00')

const pad = (n: number) => n.toString().padStart(2, '0')

const actualMinuteStep = computed(() => {
  return props.step ?? props.minuteStep ?? 5
})

const effectiveMaxTime = computed(() => props.maxTime || props.max || '')
const effectiveMinTime = computed(() => props.minTime || props.min || '')

const maxTimeParts = computed(() => {
  if (!effectiveMaxTime.value) return null
  const parts = effectiveMaxTime.value.split(':').map(Number)
  const h = parts[0]
  const m = parts[1]
  if (h === undefined || m === undefined || isNaN(h) || isNaN(m)) return null
  return { h, m }
})

const minTimeParts = computed(() => {
  if (!effectiveMinTime.value) return null
  const parts = effectiveMinTime.value.split(':').map(Number)
  const h = parts[0]
  const m = parts[1]
  if (h === undefined || m === undefined || isNaN(h) || isNaN(m)) return null
  return { h, m }
})

const timeToMinutes = (t: string) => {
  const [h = 0, m = 0] = t.split(':').map(Number)
  return h * 60 + m
}

const minutesToTime = (mins: number) => {
  const clamped = Math.min(Math.max(mins, 0), 23 * 60 + 55)
  const h = Math.floor(clamped / 60)
  const m = clamped % 60
  return `${pad(h)}:${pad(m)}`
}

// Hours & Minutes list
const hoursList = computed(() => {
  const list: number[] = []
  for (let i = props.minHour; i <= props.maxHour; i++) {
    list.push(i)
  }
  return list
})

const minutesList = computed(() => {
  const list: number[] = []
  const step = Math.max(actualMinuteStep.value, 1)
  for (let i = 0; i < 60; i += step) {
    list.push(i)
  }
  return list
})

// Validation: Disabled hours/minutes
const isHourDisabled = (h: number) => {
  if (maxTimeParts.value && h > maxTimeParts.value.h) {
    return true
  }
  if (minTimeParts.value && h < minTimeParts.value.h) {
    return true
  }
  if (props.mode === 'range' && activeRangeTab.value === 'end') {
    const parts = (rangeStart.value || '09:00').split(':').map(Number)
    const sh = parts[0] ?? 0
    return h < sh
  }
  return false
}

const isMinuteDisabled = (m: number) => {
  if (maxTimeParts.value) {
    if (currentEditingHour.value > maxTimeParts.value.h) {
      return true
    }
    if (currentEditingHour.value === maxTimeParts.value.h && m > maxTimeParts.value.m) {
      return true
    }
  }
  if (minTimeParts.value) {
    if (currentEditingHour.value < minTimeParts.value.h) {
      return true
    }
    if (currentEditingHour.value === minTimeParts.value.h && m < minTimeParts.value.m) {
      return true
    }
  }
  if (props.mode === 'range' && activeRangeTab.value === 'end') {
    const parts = (rangeStart.value || '09:00').split(':').map(Number)
    const sh = parts[0] ?? 0
    const sm = parts[1] ?? 0
    if (currentEditingHour.value < sh) return true
    if (currentEditingHour.value === sh) return m <= sm
  }
  return false
}

// Parse modelValue
const parseModelValue = (val: any) => {
  if (props.mode === 'range') {
    if (typeof val === 'object' && val !== null) {
      if (Array.isArray(val)) {
        rangeStart.value = val[0] || '09:00'
        rangeEnd.value = val[1] || '10:30'
      } else {
        rangeStart.value = val.start || '09:00'
        rangeEnd.value = val.end || '10:30'
      }
    } else if (typeof val === 'string' && val.includes('-')) {
      const parts = val.split('-').map((s) => s.trim())
      rangeStart.value = parts[0] || '09:00'
      rangeEnd.value = parts[1] || '10:30'
    }
  } else {
    singleValue.value = typeof val === 'string' ? val : ''
  }
}

watch(
  () => props.modelValue,
  (newVal) => {
    parseModelValue(newVal)
  },
  { immediate: true }
)

const defaultHour = computed(() => {
  const nowH = new Date().getHours()
  if (maxTimeParts.value && nowH > maxTimeParts.value.h) {
    return maxTimeParts.value.h
  }
  if (minTimeParts.value && nowH < minTimeParts.value.h) {
    return minTimeParts.value.h
  }
  return nowH
})

const defaultMinute = computed(() => {
  const nowM = new Date().getMinutes()
  if (maxTimeParts.value && defaultHour.value === maxTimeParts.value.h && nowM > maxTimeParts.value.m) {
    return maxTimeParts.value.m
  }
  if (minTimeParts.value && defaultHour.value === minTimeParts.value.h && nowM < minTimeParts.value.m) {
    return minTimeParts.value.m
  }
  return nowM
})

// Active hour and minute being edited
const currentEditingHour = computed(() => {
  const activeTime = props.mode === 'range'
    ? (activeRangeTab.value === 'start' ? rangeStart.value : rangeEnd.value)
    : singleValue.value

  if (!activeTime) {
    return defaultHour.value
  }
  const parts = activeTime.split(':').map(Number)
  const h = parts[0]
  return h === undefined || isNaN(h) ? defaultHour.value : h
})

const currentEditingMinute = computed(() => {
  const activeTime = props.mode === 'range'
    ? (activeRangeTab.value === 'start' ? rangeStart.value : rangeEnd.value)
    : singleValue.value

  if (!activeTime) {
    return defaultMinute.value
  }
  const parts = activeTime.split(':').map(Number)
  const m = parts[1]
  return m === undefined || isNaN(m) ? defaultMinute.value : m
})

const formatSelectedDisplay = computed(() => {
  return `${pad(currentEditingHour.value)}:${pad(currentEditingMinute.value)}`
})

const hasValue = computed(() => {
  if (props.mode === 'range') {
    return Boolean(rangeStart.value && rangeEnd.value)
  }
  return Boolean(singleValue.value)
})

// Calculate duration in hours & minutes
const formattedDuration = computed(() => {
  if (!rangeStart.value || !rangeEnd.value) return ''
  const [sh = 0, sm = 0] = rangeStart.value.split(':').map(Number)
  const [eh = 0, em = 0] = rangeEnd.value.split(':').map(Number)
  const totalMin = (eh * 60 + em) - (sh * 60 + sm)
  if (totalMin <= 0) return ''
  const hours = Math.floor(totalMin / 60)
  const mins = totalMin % 60
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
  if (hours > 0) return `${hours}h`
  return `${mins}m`
})

const scrollToActive = () => {
  nextTick(() => {
    if (hoursContainerRef.value) {
      const activeEl = hoursContainerRef.value.querySelector(`[data-hour="${currentEditingHour.value}"]`) as HTMLElement
      if (activeEl) {
        const top = activeEl.offsetTop - hoursContainerRef.value.offsetTop - 40
        hoursContainerRef.value.scrollTop = Math.max(0, top)
      }
    }
    if (minutesContainerRef.value) {
      const activeEl = minutesContainerRef.value.querySelector(`[data-minute="${currentEditingMinute.value}"]`) as HTMLElement
      if (activeEl) {
        const top = activeEl.offsetTop - minutesContainerRef.value.offsetTop - 40
        minutesContainerRef.value.scrollTop = Math.max(0, top)
      }
    }
  })
}

const setTab = (tab: 'start' | 'end') => {
  activeRangeTab.value = tab
  scrollToActive()
}

const selectHour = (h: number) => {
  if (isHourDisabled(h)) return
  let m = currentEditingMinute.value
  if (maxTimeParts.value && h === maxTimeParts.value.h && m > maxTimeParts.value.m) {
    m = maxTimeParts.value.m
  }
  if (minTimeParts.value && h === minTimeParts.value.h && m < minTimeParts.value.m) {
    m = minTimeParts.value.m
  }
  if (props.mode === 'range' && activeRangeTab.value === 'end') {
    const parts = (rangeStart.value || '09:00').split(':').map(Number)
    const sh = parts[0] ?? 0
    const sm = parts[1] ?? 0
    if (h === sh && m <= sm) {
      m = Math.min(sm + props.minuteStep, 55)
    }
  }
  const formatted = `${pad(h)}:${pad(m)}`
  updateActiveTime(formatted)
}

const selectMinute = (m: number) => {
  if (isMinuteDisabled(m)) return
  const h = currentEditingHour.value
  const formatted = `${pad(h)}:${pad(m)}`
  updateActiveTime(formatted)
}

const updateActiveTime = (formatted: string) => {
  if (props.mode === 'range') {
    if (activeRangeTab.value === 'start') {
      rangeStart.value = formatted
      // Auto-push end time if start >= end
      const startMins = timeToMinutes(formatted)
      const endMins = timeToMinutes(rangeEnd.value || '10:30')
      if (startMins >= endMins) {
        rangeEnd.value = minutesToTime(Math.min(startMins + 60, 23 * 60 + 55))
      }
    } else {
      rangeEnd.value = formatted
      // Ensure start < end
      const startMins = timeToMinutes(rangeStart.value || '09:00')
      const endMins = timeToMinutes(formatted)
      if (endMins <= startMins) {
        rangeStart.value = minutesToTime(Math.max(endMins - 60, 0))
      }
    }
    emitRange()
  } else {
    singleValue.value = formatted
    emit('update:modelValue', formatted)
    emit('change', formatted)
  }
}

const emitRange = () => {
  const val = { start: rangeStart.value, end: rangeEnd.value }
  emit('update:modelValue', val)
  emit('change', val)
}

const confirmTime = () => {
  if (props.mode === 'range') {
    emitRange()
  } else {
    let h = currentEditingHour.value
    let m = currentEditingMinute.value
    if (isHourDisabled(h)) {
      h = defaultHour.value
    }
    if (isMinuteDisabled(m)) {
      m = defaultMinute.value
    }
    const val = `${pad(h)}:${pad(m)}`
    singleValue.value = val
    emit('update:modelValue', val)
    emit('change', val)
  }
  open.value = false
}

const clearTime = () => {
  if (props.mode === 'range') {
    rangeStart.value = ''
    rangeEnd.value = ''
    emit('update:modelValue', { start: '', end: '' })
    emit('change', { start: '', end: '' })
  } else {
    singleValue.value = ''
    emit('update:modelValue', '')
    emit('change', '')
  }
}

const setNow = () => {
  const now = new Date()
  let h = now.getHours()
  const rawMin = now.getMinutes()
  let m = Math.floor(rawMin / actualMinuteStep.value) * actualMinuteStep.value
  if (m >= 60) {
    m = 55
  }
  if (maxTimeParts.value) {
    if (h > maxTimeParts.value.h) {
      h = maxTimeParts.value.h
      m = maxTimeParts.value.m
    } else if (h === maxTimeParts.value.h && m > maxTimeParts.value.m) {
      m = maxTimeParts.value.m
    }
  }
  if (minTimeParts.value) {
    if (h < minTimeParts.value.h) {
      h = minTimeParts.value.h
      m = minTimeParts.value.m
    } else if (h === minTimeParts.value.h && m < minTimeParts.value.m) {
      m = minTimeParts.value.m
    }
  }
  const formatted = `${pad(h)}:${pad(m)}`
  updateActiveTime(formatted)
}

// Popover positioning
const popoverStyle = ref<{ top: string; left: string }>({ top: '0px', left: '0px' })

const updatePopoverPosition = () => {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  const gap = 4
  const popoverHeight = 240
  const popoverWidth = 241

  let top = rect.bottom + gap
  if (top + popoverHeight > window.innerHeight && rect.top - popoverHeight - gap > 0) {
    top = rect.top - popoverHeight - gap
  }

  let left = rect.left
  if (left + popoverWidth > window.innerWidth) {
    left = window.innerWidth - popoverWidth - 12
  }

  popoverStyle.value = {
    top: `${Math.round(top)}px`,
    left: `${Math.round(left)}px`,
  }
}

const toggleOpen = () => {
  if (props.disabled || props.readonly) return
  open.value = !open.value
  if (open.value) {
    activeRangeTab.value = 'start'
    nextTick(() => {
      updatePopoverPosition()
      scrollToActive()
    })
  }
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as Node
  if (
    !rootRef.value?.contains(target) &&
    !popoverRef.value?.contains(target)
  ) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  window.addEventListener('resize', updatePopoverPosition)
  window.addEventListener('scroll', updatePopoverPosition, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('resize', updatePopoverPosition)
  window.removeEventListener('scroll', updatePopoverPosition, true)
})
</script>
