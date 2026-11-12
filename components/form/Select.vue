<template>
  <div class="flex flex-col gap-1" :class="width || 'w-full'" v-bind="$attrs">
    <!-- Label -->
    <label v-if="label" :for="triggerId"
      class="text-sm font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-0.5 self-start">
      <span>{{ label }}</span>
      <span v-if="required && !readonly" class="text-red-500 font-bold" aria-hidden="true">*</span>
    </label>

    <!-- Combobox wrapper -->
    <div ref="rootRef" class="relative w-full">
      <!-- Trigger -->
      <button :id="triggerId" ref="triggerRef" type="button" role="combobox" :aria-expanded="open"
        aria-haspopup="listbox" :disabled="disabled" :aria-readonly="readonly || undefined"
        :tabindex="readonly ? -1 : undefined" @click="toggleOpen" @keydown="handleTriggerKeydown"
        class="flex w-full items-center justify-between rounded-lg border transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
        :class="[
          triggerSizeClasses,
          readonly ? 'cursor-default select-none focus:ring-0 focus:border-theme-input' : '',
          error
            ? 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/10 dark:bg-red-950/10'
            : isLight
              ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 focus:ring-emerald-500 focus:border-emerald-500'
              : 'border-theme-input bg-theme-input text-slate-900 dark:text-white focus:ring-emerald-500 focus:border-emerald-500'
        ]">
        <span class="truncate pr-4 flex-1 min-w-0 text-left" :class="!selectedLabel && (isLight ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500')">
          <slot name="selected" :option="selectedOption">
            {{ selectedLabel || placeholder }}
          </slot>
        </span>
        <div class="flex items-center gap-1.5 shrink-0">
          <!-- Loading Spinner -->
          <svg v-if="loading" class="animate-spin text-emerald-500" :class="arrowSizeClasses"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>

          <!-- Clear Button (Suffix X when clearable and value is selected) -->
          <button v-if="showClearButton" type="button" @click.stop="clearSelection"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 flex items-center justify-center"
            title="Clear" aria-label="Clear selection">
            <Icon name="cancel-01" class="text-xs" />
          </button>

          <!-- Dropdown Arrow (Hidden when clearable and value is selected) -->
          <svg v-if="!readonly && !loading && !showClearButton" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="transition-transform shrink-0"
            :class="[arrowSizeClasses, isLight ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500', open && 'rotate-180']">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      <!-- Teleported Dropdown panel -->
      <Teleport to="body">
        <Transition enter-active-class="transition ease-out duration-100" enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-75"
          leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1">
          <div v-if="open" ref="panelRef" :style="dropdownStyle"
            class="overflow-hidden rounded-lg border shadow-xl flex flex-col box-border"
            :class="isLight
              ? 'border-slate-200 bg-white text-slate-800 ui-dropdown-theme-light'
              : 'border-slate-200 dark:border-theme-input bg-theme-card text-slate-900 dark:text-white'">

            <!-- Search input -->
            <div v-if="searchable"
              class="flex items-center gap-2 border-b px-3 shrink-0"
              :class="isLight ? 'border-slate-200' : 'border-theme-border dark:border-theme-input'">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="h-4 w-4 shrink-0 text-slate-400" :class="!isLight && 'dark:text-slate-500'">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input ref="searchRef" v-model="query" type="text" :placeholder="searchPlaceholder"
                @input="handleSearchInput" @keydown="handleSearchKeydown"
                class="flex w-full bg-transparent placeholder-slate-400 focus:outline-none"
                :class="[
                  props.size === 'sm' ? 'h-8 py-1.5 text-xs' : 'h-9 py-2 text-sm',
                  isLight ? 'text-slate-900' : 'text-slate-900 dark:text-white dark:placeholder-slate-500'
                ]" />

              <!-- Loading spinner (server-side mode) -->
              <svg v-if="loading" class="animate-spin h-4 w-4 shrink-0 text-emerald-500"
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>

            <!-- Options list -->
            <ul ref="listRef" role="listbox" class="relative overflow-y-auto overflow-x-hidden p-1 flex-1 min-h-0">
              <li v-if="!loading && displayedOptions.length === 0 && !allowCustom"
                class="px-3 py-2 text-sm text-slate-500 text-center" :class="!isLight && 'dark:text-slate-400'">
                {{ emptyText }}
              </li>
              <li v-for="(option, index) in displayedOptions" :key="`${option.value}-${option.label}`" role="option"
                :aria-selected="option.value === modelValue" @click="selectOption(option)"
                @mouseenter="!option.disabled && (activeIndex = index)"
                class="flex items-center gap-2 rounded-md select-none min-w-0" :class="[
                  optionSizeClasses,
                  isLight ? 'text-slate-800' : 'text-slate-900 dark:text-white',
                  option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                  !option.disabled && index === activeIndex
                    ? (isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-100 dark:bg-theme-hover')
                    : ''
                ]">

                <!-- Check icon -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 shrink-0"
                  :class="option.value === modelValue ? (isLight ? 'text-emerald-600' : 'text-emerald-600 dark:text-emerald-400') : 'text-transparent'">
                  <path d="M20 6 9 17l-5-5" />
                </svg>

                <!-- Custom slot or default label -->
                <slot name="option" :option="option" :selected="option.value === modelValue">
                  <span class="truncate min-w-0">{{ option.label }}</span>
                </slot>
              </li>

              <!-- Allow custom: add-as-option row -->
              <li v-if="allowCustom && !loading && query.trim() && displayedOptions.length === 0"
                class="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm cursor-pointer select-none text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-theme-hover min-w-0"
                @click="addCustomOption">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  class="h-4 w-4 shrink-0 text-emerald-500">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span class="truncate min-w-0">No result found. Add <strong class="text-slate-900 dark:text-white">"{{ query.trim()
                    }}"</strong>?</span>
              </li>
            </ul>
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
import type { CSSProperties } from 'vue'
import { computed, nextTick, ref, useAttrs, useId, watch, onMounted, onBeforeUnmount } from 'vue'

defineOptions({
  inheritAttrs: false
})

export interface ComboboxOption {
  label: string
  value: string | number | null
  [key: string]: any
}

export type SelectOptionItem = ComboboxOption | string | number

interface Props {
  label?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  options: SelectOptionItem[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  width?: string
  dropdownMinWidth?: string
  clearable?: boolean
  error?: string | boolean
  /** Show loading spinner inside the search box (useful with @search server-side mode) */
  loading?: boolean
  /**
   * Enable server-side search mode. Set to true when using @search.
   * In this mode local filtering is disabled and the parent is responsible
   * for updating :options based on the emitted query.
   */
  serverSide?: boolean
  searchable?: boolean
  /**
   * When true and no options match the query, shows an "Add as option" row.
   * Selecting it emits a synthetic option { label: query, value: query }.
   */
  allowCustom?: boolean
  /** Size variant: 'sm' (compact, h-8, text-xs) or 'md'/'normal' (standard, h-9, text-sm) */
  size?: 'sm' | 'md' | 'normal'
  theme?: 'auto' | 'light' | 'dark'
  zIndex?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  hint: '',
  required: false,
  disabled: false,
  readonly: false,
  placeholder: 'Select option...',
  searchPlaceholder: 'Search...',
  emptyText: 'No result found.',
  width: '',
  dropdownMinWidth: '',
  clearable: false,
  error: false,
  loading: false,
  serverSide: false,
  searchable: true,
  allowCustom: false,
  size: 'md',
  theme: 'auto',
  zIndex: '10050'
})

const isLight = computed(() => props.theme === 'light')

const emit = defineEmits<{
  (e: 'change', option: ComboboxOption | null): void
  /**
   * Emitted when the search query changes (server-side mode).
   * Attach a @search listener to activate server-side mode:
   * - Local filtering is disabled
   * - Parent is responsible for updating :options based on the query
   */
  (e: 'search', query: string): void
}>()

const attrs = useAttrs()

/**
 * Server-side mode: activated when `serverSide` prop is true.
 * In this mode the component does NOT filter options locally and emits
 * a 'search' event so the parent can fetch results.
 */
const isServerSide = computed(() => props.serverSide)

const triggerSizeClasses = computed(() => {
  return props.size === 'sm' ? 'h-8 px-2.5 py-1 text-xs' : 'h-9 px-3 py-2 text-sm'
})

const arrowSizeClasses = computed(() => {
  return props.size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
})

const optionSizeClasses = computed(() => {
  return props.size === 'sm' ? 'px-2 py-1.5 text-xs' : 'px-2.5 py-2 text-sm'
})

const modelValue = defineModel<string | number | null>({ default: '' })

const hasSelectedValue = computed(() => {
  return modelValue.value !== '' && modelValue.value !== null && modelValue.value !== undefined
})

const showClearButton = computed(() => {
  return Boolean(props.clearable && hasSelectedValue.value && !props.disabled && !props.readonly)
})

const triggerId = useId()
const rootRef = ref<HTMLDivElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const searchRef = ref<HTMLInputElement | null>(null)
const panelRef = ref<HTMLDivElement | null>(null)
const listRef = ref<HTMLUListElement | null>(null)

const open = ref(false)
const query = ref('')
const activeIndex = ref(0)

let searchDebounce: ReturnType<typeof setTimeout> | null = null

const dropdownStyle = ref<CSSProperties>({
  position: 'absolute',
  top: '0px',
  left: '0px',
  width: '0px',
  zIndex: String(props.zIndex || '10050')
})

// Scroll selected option into exact center of dropdown list
const scrollToSelected = (center = true) => {
  const doScroll = () => {
    if (!listRef.value) return
    const selectedEl = listRef.value.querySelector('[aria-selected="true"]') as HTMLElement | null
    if (!selectedEl) return

    if (center) {
      const list = listRef.value
      // Calculate exact center position using layout offsetTop & offsetHeight
      const targetScrollTop = selectedEl.offsetTop - (list.clientHeight / 2) + (selectedEl.offsetHeight / 2)
      list.scrollTop = Math.max(0, targetScrollTop)
    } else {
      scrollToActive()
    }
  }

  nextTick(() => {
    doScroll()
    requestAnimationFrame(doScroll)
    setTimeout(doScroll, 50)
  })
}

// Scroll active item (keyboard navigation) into view
const scrollToActive = () => {
  nextTick(() => {
    if (!listRef.value) return
    const items = listRef.value.querySelectorAll<HTMLElement>('[role="option"]')
    const activeEl = items[activeIndex.value]
    if (!activeEl) return

    const list = listRef.value
    const itemTop = activeEl.offsetTop
    const itemBottom = itemTop + activeEl.offsetHeight
    const listTop = list.scrollTop
    const listBottom = listTop + list.clientHeight

    if (itemTop < listTop) {
      list.scrollTop = itemTop
    } else if (itemBottom > listBottom) {
      list.scrollTop = itemBottom - list.clientHeight
    }
  })
}

// Normalise options so arrays of plain strings/numbers work seamlessly alongside objects
const normalizedOptions = computed<ComboboxOption[]>(() => {
  if (!props.options || !Array.isArray(props.options)) return []
  return props.options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { label: String(opt), value: opt }
    }
    return opt
  })
})

// Derive selected label from modelValue
const customLabel = ref('')
const selectedOption = computed(() => {
  return normalizedOptions.value.find((o) => o.value === modelValue.value) || null
})
const selectedLabel = computed(() => {
  const found = selectedOption.value
  if (found) {
    customLabel.value = found.label
    return found.label
  }
  return customLabel.value
})

watch(modelValue, (newVal) => {
  if (!newVal) {
    customLabel.value = ''
  }
})

// In local mode: filter by query. In server-side mode: pass all options through (parent handles filtering)
const displayedOptions = computed(() => {
  if (isServerSide.value) return normalizedOptions.value
  if (!query.value.trim()) return normalizedOptions.value
  const q = query.value.trim().toLowerCase()
  return normalizedOptions.value.filter((o) => {
    if (o.label && o.label.toLowerCase().includes(q)) return true
    if (typeof o.code === 'string' && o.code.toLowerCase().includes(q)) return true
    if (typeof o.subtext === 'string' && o.subtext.toLowerCase().includes(q)) return true
    return false
  })
})

// Reset active index when displayed options change
watch(displayedOptions, () => {
  activeIndex.value = 0
})

const toggleOpen = () => {
  if (props.disabled || props.readonly) return
  open.value ? closeDropdown() : openDropdown()
}

const openDropdown = () => {
  if (props.disabled || props.readonly) return
  open.value = true
  if (isServerSide.value && query.value) {
    emit('search', '')
  }
  query.value = ''
  activeIndex.value = Math.max(
    0,
    normalizedOptions.value.findIndex((o) => o.value === modelValue.value)
  )
  updateDropdownPosition()
  nextTick(() => {
    updateDropdownPosition()
    if (props.searchable) {
      searchRef.value?.focus({ preventScroll: true })
    }
    scrollToSelected(true)
    requestAnimationFrame(updateDropdownPosition)
  })
}

const closeDropdown = () => {
  open.value = false
  if (searchDebounce) clearTimeout(searchDebounce)
  nextTick(() => triggerRef.value?.focus())
}

const selectOption = (option: ComboboxOption) => {
  if (option.disabled) return
  modelValue.value = option.value
  emit('change', option)
  closeDropdown()
}

const clearSelection = () => {
  modelValue.value = ''
  customLabel.value = ''
  emit('change', null)
  if (isServerSide.value) emit('search', '')
}

const addCustomOption = () => {
  const raw = query.value.trim()
  if (!raw) return
  const val = raw.replace(/\b\w/g, (c) => c.toUpperCase())
  customLabel.value = val
  const customOption: ComboboxOption = { label: val, value: val }
  selectOption(customOption)
}

// Handle search input — debounced emit for server-side, instant for local
const handleSearchInput = () => {
  if (!isServerSide.value) return
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    emit('search', query.value)
  }, 350)
}

// Calculate position on the viewport to place in <body> Teleport
const updateDropdownPosition = () => {
  if (!open.value || !triggerRef.value) return

  const rect = triggerRef.value.getBoundingClientRect()
  if (rect.width === 0) return

  const estimatedHeight = Math.min(260, (displayedOptions.value.length * 38) + 50)
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top
  const placeAbove = spaceBelow < estimatedHeight && spaceAbove > spaceBelow

  const rectWidth = Math.round(rect.width)
  const customMinPx = props.dropdownMinWidth ? (parseInt(props.dropdownMinWidth, 10) || rectWidth) : rectWidth
  const effectiveMinWidth = Math.max(rectWidth, customMinPx)
  const maxAllowedLeft = Math.max(16, window.innerWidth - effectiveMinWidth - 16)
  const left = Math.min(Math.max(16, Math.round(rect.left)), maxAllowedLeft)

  dropdownStyle.value = {
    position: 'fixed',
    left: `${left}px`,
    width: props.dropdownMinWidth ? 'max-content' : `${rectWidth}px`,
    minWidth: `${effectiveMinWidth}px`,
    maxWidth: props.dropdownMinWidth ? `${Math.max(effectiveMinWidth, window.innerWidth - 32)}px` : `${rectWidth}px`,
    zIndex: String(props.zIndex || '10050'),
    boxSizing: 'border-box',
    ...(placeAbove
      ? {
        bottom: `${Math.round(window.innerHeight - rect.top + 4)}px`,
        top: 'auto',
        maxHeight: `${Math.min(260, Math.max(120, spaceAbove - 16))}px`
      }
      : {
        top: `${Math.round(rect.bottom + 4)}px`,
        bottom: 'auto',
        maxHeight: `${Math.min(260, Math.max(120, spaceBelow - 16))}px`
      })
  }
}

let resizeObserver: ResizeObserver | null = null

watch(open, (newVal) => {
  if (newVal) {
    window.addEventListener('scroll', updateDropdownPosition, { passive: true, capture: true })
    window.addEventListener('resize', updateDropdownPosition)
    if (triggerRef.value && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => updateDropdownPosition())
      resizeObserver.observe(triggerRef.value)
    }
  } else {
    window.removeEventListener('scroll', updateDropdownPosition, { capture: true })
    window.removeEventListener('resize', updateDropdownPosition)
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
  }
})

// Keyboard navigation on trigger button
const handleTriggerKeydown = (event: KeyboardEvent) => {
  if (props.disabled || props.readonly) return
  if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
    event.preventDefault()
    if (!open.value) openDropdown()
  }
}

// Keyboard navigation on search input
const handleSearchKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      activeIndex.value = Math.min(activeIndex.value + 1, displayedOptions.value.length - 1)
      scrollToActive()
      break
    case 'ArrowUp':
      event.preventDefault()
      activeIndex.value = Math.max(activeIndex.value - 1, 0)
      scrollToActive()
      break
    case 'Enter': {
      event.preventDefault()
      // Server-side: Enter triggers immediate search if nothing to select
      if (isServerSide.value && displayedOptions.value.length === 0) {
        if (searchDebounce) clearTimeout(searchDebounce)
        emit('search', query.value)
        break
      }
      const option = displayedOptions.value[activeIndex.value]
      if (option) selectOption(option)
      break
    }
    case 'Escape':
      event.preventDefault()
      closeDropdown()
      break
    case 'Tab':
      closeDropdown()
      break
  }
}

// Close the dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  const clickedInsideTrigger = triggerRef.value?.contains(target) || rootRef.value?.contains(target)
  const clickedInsidePanel = panelRef.value?.contains(target)

  if (!clickedInsideTrigger && !clickedInsidePanel) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('scroll', updateDropdownPosition, { capture: true })
  window.removeEventListener('resize', updateDropdownPosition)
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (searchDebounce) clearTimeout(searchDebounce)
})
</script>

<style scoped>
.ui-dropdown-theme-light {
  color-scheme: light;
  --bg-app: #f8fafc;
  --bg-card: #ffffff;
  --bg-hover: #f1f5f9;
  --bg-input: #ffffff;
  --border-default: #e2e8f0;
  --border-card: #e2e8f0;
  --border-input: #d1d5db;
  --text-primary: #0f172a;
  --text-body: #334155;
  --text-muted: #64748b;
  --text-subtle: #94a3b8;
}
</style>