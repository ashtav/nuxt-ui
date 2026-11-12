<template>
  <div class="flex flex-col gap-1" :class="width || 'w-full'" v-bind="$attrs">
    <!-- Label -->
    <label v-if="label" :for="triggerId"
      class="text-sm font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-0.5 self-start">
      <span>{{ label }}</span>
      <span v-if="required" class="text-red-500 font-bold" aria-hidden="true">*</span>
    </label>

    <!-- Combobox wrapper -->
    <div ref="rootRef" class="relative w-full">
      <!-- Trigger area (styled like an input but containing chips and an input field) -->
      <div :id="triggerId" ref="triggerRef" role="combobox" :aria-expanded="open" aria-haspopup="listbox"
        @click="handleTriggerClick"
        class="flex min-h-[38px] w-full flex-wrap items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-all focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 bg-theme-input cursor-text"
        :class="[
          error
            ? 'border-red-500 dark:border-red-500 focus-within:ring-red-500 focus-within:border-red-500 bg-red-50/10 dark:bg-red-950/10'
            : 'border-theme-input focus-within:ring-emerald-500 focus-within:border-emerald-500',
          disabled && 'cursor-not-allowed opacity-50 pointer-events-none'
        ]">
        
        <!-- Selected Chips -->
        <div v-for="val in selectedOptions" :key="val.value"
          class="flex items-center gap-1 bg-slate-100 dark:bg-theme-card text-slate-800 dark:text-slate-200 pl-2 pr-1 py-0.5 rounded-md text-xs font-medium border border-theme-border max-w-full">
          <span class="truncate max-w-[120px]">{{ val.label }}</span>
          <button type="button" :disabled="disabled" @click.stop="removeOption(val.value)"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors focus:outline-none flex items-center justify-center cursor-pointer">
            <Icon name="cancel-01" class="text-[10px]" />
          </button>
        </div>

        <!-- Search Input -->
        <input ref="inputRef" v-model="query" type="text" :disabled="disabled"
          autocomplete="off"
          :placeholder="modelValue.length === 0 ? placeholder : ''" @input="handleSearchInput"
          @keydown="handleKeyDown" @focus="openDropdown"
          class="flex-1 bg-transparent py-0.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none min-w-[60px]" />

        <!-- Actions -->
        <div class="flex items-center gap-1.5 shrink-0 ml-auto pl-1">
          <!-- Loading Spinner -->
          <svg v-if="loading" class="animate-spin h-4 w-4 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>

          <!-- Clear Button -->
          <button v-else-if="clearable && modelValue.length > 0 && !disabled" type="button" @click.stop="clearAll"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded transition-colors focus:outline-none flex items-center justify-center cursor-pointer">
            <Icon name="cancel-01" class="text-xs" />
          </button>

          <!-- Dropdown Arrow -->
          <svg v-else-if="modelValue.length === 0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform pointer-events-none" :class="open && 'rotate-180'">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      <!-- Teleported Dropdown panel -->
      <Teleport to="body">
        <Transition enter-active-class="transition ease-out duration-100" enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-75"
          leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
          <div v-if="open" ref="panelRef" :style="dropdownStyle"
            class="overflow-hidden rounded-lg border border-theme-border bg-theme-card shadow-lg z-[9999]">

            <!-- Options list -->
            <ul role="listbox" class="max-h-60 overflow-y-auto p-1">
              <li v-if="!loading && displayedOptions.length === 0 && !allowCustom"
                class="px-3 py-2 text-sm text-slate-500 dark:text-slate-400 text-center">
                {{ emptyText }}
              </li>
              <li v-for="(option, index) in displayedOptions" :key="option.value + '-' + option.label" role="option"
                :aria-selected="isSelected(option)" @click="toggleOption(option)"
                @mouseenter="!option.disabled && (activeIndex = index)"
                class="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm select-none text-slate-900 dark:text-white"
                :class="[
                  option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                  !option.disabled && index === activeIndex ? 'bg-slate-100 dark:bg-theme-hover' : ''
                ]">

                <!-- Custom slot or default label -->
                <slot name="option" :option="option" :selected="isSelected(option)">
                  <span class="truncate">{{ option.label }}</span>
                </slot>
              </li>

              <!-- Allow custom option -->
              <li v-if="canShowCustomAdd && !loading"
                class="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm cursor-pointer select-none text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-theme-hover"
                @click="addCustomOption">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  class="h-4 w-4 shrink-0 text-emerald-500">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>Add <strong class="text-slate-900 dark:text-white">"{{ validation === 'email' ? query.trim().toLowerCase() : query.trim() }}"</strong></span>
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
import { toast } from 'vue-sonner'

defineOptions({
  inheritAttrs: false
})

export interface ComboboxOption {
  label: string
  value: string | number
  disabled?: boolean
  [key: string]: any
}

interface Props {
  label?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  options: ComboboxOption[]
  placeholder?: string
  emptyText?: string
  width?: string
  clearable?: boolean
  error?: string | boolean
  loading?: boolean
  serverSide?: boolean
  allowCustom?: boolean
  preserveCase?: boolean
  validation?: 'email'
  debounce?: number
  max?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  hint: '',
  required: false,
  disabled: false,
  placeholder: 'Select options...',
  emptyText: 'No result found.',
  width: '',
  clearable: false,
  error: false,
  loading: false,
  serverSide: false,
  allowCustom: false,
  preserveCase: false,
  validation: undefined,
  debounce: 350,
  max: undefined
})

const emit = defineEmits<{
  (e: 'change', options: ComboboxOption[]): void
  (e: 'search', query: string): void
}>()

const attrs = useAttrs()

const modelValue = defineModel<(string | number)[]>({ default: () => [] })

const triggerId = useId()
const rootRef = ref<HTMLDivElement | null>(null)
const triggerRef = ref<HTMLDivElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const panelRef = ref<HTMLDivElement | null>(null)

const open = ref(false)
const query = ref('')
const activeIndex = ref(0)

let searchDebounce: ReturnType<typeof setTimeout> | null = null

const dropdownStyle = ref<CSSProperties>({
  position: 'absolute',
  top: '0px',
  left: '0px',
  width: '0px',
  zIndex: '9999'
})

// Selected options cache to preserve labels even in serverSide mode
const selectedOptionsCache = ref<ComboboxOption[]>([])

watch([modelValue, () => props.options], () => {
  // 1. Add current options that are selected to cache
  props.options.forEach((opt) => {
    if (modelValue.value.includes(opt.value)) {
      const exists = selectedOptionsCache.value.some((c) => c.value === opt.value)
      if (!exists) {
        selectedOptionsCache.value.push(opt)
      }
    }
  })

  // 2. Filter cache to keep only currently selected values
  selectedOptionsCache.value = selectedOptionsCache.value.filter((c) =>
    modelValue.value.includes(c.value)
  )

  // 3. Populate missing selections with fallback placeholders
  modelValue.value.forEach((val) => {
    const exists = selectedOptionsCache.value.some((c) => c.value === val)
    if (!exists) {
      const found = props.options.find((opt) => opt.value === val)
      if (found) {
        selectedOptionsCache.value.push(found)
      } else {
        selectedOptionsCache.value.push({ label: String(val), value: val })
      }
    }
  })
}, { immediate: true, deep: true })

const selectedOptions = computed(() => selectedOptionsCache.value)

const isSelected = (option: ComboboxOption) => {
  return modelValue.value.includes(option.value)
}

// Option list selection
const toggleOption = (option: ComboboxOption) => {
  if (option.disabled) return
  const isCurrentlySelected = isSelected(option)
  
  if (props.max && modelValue.value.length >= props.max && !isCurrentlySelected) {
    toast.error(`You can only select up to ${props.max} options.`)
    return
  }

  let newValue: (string | number)[]
  
  if (isCurrentlySelected) {
    newValue = modelValue.value.filter((val) => val !== option.value)
  } else {
    newValue = [...modelValue.value, option.value]
  }

  modelValue.value = newValue
  
  // Sync cache immediately so labels don't flicker or get lost in async watch queue
  const cachedIdx = selectedOptionsCache.value.findIndex((c) => c.value === option.value)
  if (isCurrentlySelected) {
    if (cachedIdx !== -1) {
      selectedOptionsCache.value.splice(cachedIdx, 1)
    }
  } else {
    if (cachedIdx === -1) {
      selectedOptionsCache.value.push(option)
    }
  }

  emit('change', selectedOptionsCache.value.filter((c) => newValue.includes(c.value)))

  if (!isCurrentlySelected && (props.preserveCase || props.validation === 'email')) {
    query.value = ''
  }

  nextTick(() => {
    updateDropdownPosition()
    inputRef.value?.focus()
  })
}

const removeOption = (value: string | number) => {
  if (props.disabled) return
  const newValue = modelValue.value.filter((val) => val !== value)
  modelValue.value = newValue
  
  // Sync cache immediately
  const cachedIdx = selectedOptionsCache.value.findIndex((c) => c.value === value)
  if (cachedIdx !== -1) {
    selectedOptionsCache.value.splice(cachedIdx, 1)
  }

  emit('change', selectedOptionsCache.value.filter((c) => newValue.includes(c.value)))
  
  nextTick(() => {
    updateDropdownPosition()
  })
}

const clearAll = () => {
  modelValue.value = []
  selectedOptionsCache.value = []
  emit('change', [])
  query.value = ''
  nextTick(() => {
    updateDropdownPosition()
  })
}

const addCustomOption = () => {
  const raw = query.value.trim()
  if (!raw) return

  let val: string
  if (props.validation === 'email') {
    val = raw.toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(val)) {
      toast.error('Please enter a valid email address.')
      return
    }
  } else if (props.preserveCase) {
    val = raw
  } else {
    val = raw.replace(/\b\w/g, (c) => c.toUpperCase())
  }

  if (modelValue.value.some((v) => String(v).toLowerCase() === val.toLowerCase())) {
    query.value = ''
    return
  }

  const customOption: ComboboxOption = { label: val, value: val }

  const existsInCache = selectedOptionsCache.value.some((c) => c.value === val)
  if (!existsInCache) {
    selectedOptionsCache.value.push(customOption)
  }

  toggleOption(customOption)
  query.value = ''
}

const canShowCustomAdd = computed(() => {
  const raw = query.value.trim()
  if (!raw || !props.allowCustom) return false
  const normalized = props.validation === 'email' ? raw.toLowerCase() : raw
  const alreadySelected = modelValue.value.some((v) => String(v).toLowerCase() === normalized.toLowerCase())
  const existsInDisplayed = displayedOptions.value.some((o) => String(o.value).toLowerCase() === normalized.toLowerCase())
  return !alreadySelected && !existsInDisplayed
})

// Local vs Server-side options filtering
const displayedOptions = computed(() => {
  const availableOptions = props.options.filter((o) => !isSelected(o))
  if (props.serverSide) return availableOptions
  if (!query.value.trim()) return availableOptions
  const q = query.value.trim().toLowerCase()
  return availableOptions.filter((o) => o.label.toLowerCase().includes(q))
})

watch(displayedOptions, () => {
  activeIndex.value = 0
})

const handleTriggerClick = (event: MouseEvent) => {
  if (props.disabled) return
  if ((event.target as HTMLElement).closest('button')) return
  
  inputRef.value?.focus()
  if (!open.value) {
    openDropdown()
  }
}

const openDropdown = () => {
  if (props.disabled || open.value) return
  open.value = true
  activeIndex.value = 0
  
  nextTick(() => {
    updateDropdownPosition()
  })
}

const closeDropdown = () => {
  open.value = false
  if (searchDebounce) clearTimeout(searchDebounce)
}

const handleSearchInput = () => {
  if (!open.value) {
    openDropdown()
  }
  if (!props.serverSide) return
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    emit('search', query.value)
  }, props.debounce)
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Backspace' && !query.value && modelValue.value.length > 0) {
    event.preventDefault()
    const newValue = [...modelValue.value]
    newValue.pop()
    modelValue.value = newValue
    emit('change', selectedOptionsCache.value.filter((c) => newValue.includes(c.value)))
    nextTick(() => updateDropdownPosition())
    return
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (!open.value) {
        openDropdown()
      } else {
        activeIndex.value = Math.min(activeIndex.value + 1, displayedOptions.value.length - 1)
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (open.value) {
        activeIndex.value = Math.max(activeIndex.value - 1, 0)
      }
      break
    case 'Enter':
      event.preventDefault()
      if (!open.value) {
        openDropdown()
      } else {
        const option = displayedOptions.value[activeIndex.value]
        if (option) {
          toggleOption(option)
        } else if (props.allowCustom && query.value.trim()) {
          addCustomOption()
        }
      }
      break
    case 'Escape':
      event.preventDefault()
      closeDropdown()
      break
    case 'Tab':
      closeDropdown()
      break
  }
}

const updateDropdownPosition = () => {
  if (!open.value || !triggerRef.value) return

  const rect = triggerRef.value.getBoundingClientRect()
  const dropdownHeight = Math.min(260, (displayedOptions.value.length * 36) + 12)
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top

  let top = rect.bottom + window.scrollY
  if (spaceBelow < dropdownHeight + 10 && spaceAbove > spaceBelow) {
    top = rect.top - dropdownHeight - 6 + window.scrollY
  } else {
    top = rect.bottom + 6 + window.scrollY
  }

  dropdownStyle.value = {
    position: 'absolute',
    top: `${top}px`,
    left: `${rect.left + window.scrollX}px`,
    width: `${rect.width}px`,
    zIndex: '9999'
  }
}

watch(open, (newVal) => {
  if (newVal) {
    window.addEventListener('scroll', updateDropdownPosition, { passive: true })
    window.addEventListener('resize', updateDropdownPosition)
  } else {
    window.removeEventListener('scroll', updateDropdownPosition)
    window.removeEventListener('resize', updateDropdownPosition)
  }
})

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
  window.removeEventListener('scroll', updateDropdownPosition)
  window.removeEventListener('resize', updateDropdownPosition)
  if (searchDebounce) clearTimeout(searchDebounce)
})
</script>
