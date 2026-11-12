<template>
  <div class="flex flex-col gap-1 w-full" v-bind="$attrs">
    <!-- Label -->
    <label v-if="label" :for="inputId"
      class="text-sm font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-0.5 self-start">
      <span>{{ label }}</span>
      <span v-if="required" class="text-red-500 font-bold" aria-hidden="true">*</span>
    </label>

    <!-- Phone input container with integrated country badge prefix -->
    <div ref="rootRef"
      class="relative flex items-center w-full h-9 border transition-all bg-theme-input focus-within:ring-2"
      :class="[
        rounded || 'rounded-lg',
        error
          ? 'border-red-500 dark:border-red-500 focus-within:ring-red-500 focus-within:border-red-500 bg-red-50/10 dark:bg-red-950/10'
          : 'border-theme-input focus-within:ring-emerald-500 focus-within:border-emerald-500',
        disabled ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-theme-hover' : ''
      ]">
      <!-- Country Code Badge Button -->
      <button :id="triggerId" ref="triggerRef" type="button" role="combobox" :aria-expanded="open"
        aria-haspopup="listbox" :disabled="disabled" @click="toggleOpen" @keydown="handleTriggerKeydown"
        class="flex items-center gap-1.5 px-2 h-7 ml-1 rounded-md text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 dark:bg-theme-card dark:hover:bg-theme-hover text-slate-800 dark:text-slate-200 border border-theme-border transition-all shrink-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed">
        <img v-if="selectedCountryIso && selectedCountryIso !== 'UN'"
          :src="`https://flagcdn.com/w40/${selectedCountryIso.toLowerCase()}.png`" :alt="selectedCountryIso"
          class="w-5 h-3.5 object-cover rounded-[2px] shadow-xs shrink-0 border border-theme-border"
          loading="lazy" />
        <span v-else class="text-xs shrink-0">🌐</span>
        <span class="font-mono tracking-tight font-bold text-[11px] text-slate-700 dark:text-slate-300">+{{
          selectedCountryCode }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"
          class="h-3 w-3 text-slate-400 dark:text-slate-500 transition-transform" :class="open && 'rotate-180'">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <!-- Phone Number Input -->
      <input :id="inputId" ref="inputRef" type="tel" inputmode="numeric" :value="localPhoneNumber"
        :placeholder="placeholder" :disabled="disabled" :required="required" :maxlength="effectiveMaxLength"
        @keypress="handleKeyPress" @input="handlePhoneInput" @paste="handlePaste" @blur="handleBlur"
        class="flex h-full w-full bg-transparent px-2.5 py-1 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none disabled:cursor-not-allowed font-mono" />

      <!-- Clear Button (if number entered) -->
      <button v-if="clearable && localPhoneNumber && !disabled" type="button" @click="clearNumber"
        class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 mr-2 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>

    <!-- Error message -->
    <span v-if="typeof error === 'string' && error" class="text-xs text-red-500 dark:text-red-400 mt-0.5 font-normal">
      {{ error }}
    </span>

    <!-- Hint / Help Text -->
    <span v-if="hint" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
      {{ hint }}
    </span>

    <!-- Teleported Country Dropdown Modal/Panel -->
    <Teleport to="body">
      <Transition enter-active-class="transition ease-out duration-100" enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-75"
        leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
        <div v-if="open" ref="panelRef" :style="dropdownStyle"
          class="overflow-hidden rounded-lg border border-theme-border bg-theme-card shadow-xl z-[9999]">

          <!-- Search input header -->
          <div
            class="flex items-center gap-2 border-b border-theme-border px-3 py-1 bg-slate-50/50 dark:bg-theme-card">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input ref="searchRef" v-model="searchQuery" type="text" :placeholder="searchPlaceholder"
              @keydown="handleSearchKeydown"
              class="flex h-9 w-full bg-transparent py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none" />
            <span v-if="searchQuery" @click="searchQuery = ''"
              class="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer">
              Clear
            </span>
          </div>

          <!-- Country List -->
          <ul role="listbox" ref="listRef" class="max-h-64 overflow-y-auto p-1 text-xs">
            <li v-if="filteredCountries.length === 0"
              class="px-3 py-4 text-xs text-slate-500 dark:text-slate-400 text-center space-y-2">
              <p>No country found for "{{ searchQuery }}"</p>
              <button v-if="customDialCodeOption" type="button" @click="selectCustomDialCode"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-semibold text-xs transition-colors border border-emerald-200 dark:border-emerald-800">
                <span>🌐</span>
                <span>Use <strong>+{{ customDialCodeOption }}</strong> as dial code</span>
              </button>
            </li>
            <li v-for="(country, index) in filteredCountries" :key="country.iso + '-' + country.code" role="option"
              :aria-selected="country.code === selectedCountryCode && country.iso === selectedCountryIso"
              @click="selectCountry(country)" @mouseenter="activeIndex = index"
              class="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 select-none text-slate-900 dark:text-white cursor-pointer transition-colors"
              :class="[
                index === activeIndex ? 'bg-slate-100 dark:bg-theme-hover' : '',
                country.code === selectedCountryCode && country.iso === selectedCountryIso ? 'font-semibold text-emerald-600 dark:text-emerald-400' : ''
              ]">

              <div class="flex items-center gap-2.5 min-w-0">
                <img :src="`https://flagcdn.com/w40/${country.iso.toLowerCase()}.png`" :alt="country.iso"
                  class="w-5 h-3.5 object-cover rounded-[2px] shadow-xs shrink-0 border border-theme-border"
                  loading="lazy" />
                <span class="truncate">{{ country.name }}</span>
                <span class="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-mono shrink-0">({{
                  country.iso }})</span>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <span class="font-mono text-slate-500 dark:text-slate-400 text-[11px]">+{{ country.code }}</span>
                <!-- Check icon -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5 shrink-0"
                  :class="country.code === selectedCountryCode && country.iso === selectedCountryIso ? 'text-emerald-600 dark:text-emerald-400' : 'text-transparent'">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
            </li>
          </ul>

          <!-- Footer Count / Hint Notice -->
          <div v-if="totalMatches > filteredCountries.length || !searchQuery.trim()"
            class="px-3 py-1.5 text-[11px] text-center border-t border-theme-border bg-slate-50/70 dark:bg-theme-card text-slate-400 dark:text-slate-500 select-none">
            <span v-if="!searchQuery.trim()">Showing popular countries. Type to search all 240+ countries.</span>
            <span v-else>Showing top {{ filteredCountries.length }} of {{ totalMatches }} countries.</span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, useId, onMounted, onBeforeUnmount, watch, type CSSProperties } from 'vue'
import { COUNTRY_CODES, type CountryCode } from '~~/shared/utils/countries'

interface Props {
  label?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  searchPlaceholder?: string
  clearable?: boolean
  error?: string | boolean
  defaultCountry?: string // e.g. 'ID' or '62' or '+62'
  maxlength?: number
  rounded?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  hint: '',
  required: false,
  disabled: false,
  placeholder: '812-3456-7890',
  searchPlaceholder: 'Search country or code...',
  clearable: true,
  error: false,
  defaultCountry: 'ID',
  rounded: 'rounded-lg'
})

// Two-way binding for the full unified phone string (e.g. "+6281234567890")
const modelValue = defineModel<string>({ default: '' })

// Optional separate models for countryCode and phoneNumber
const countryCodeModel = defineModel<string>('countryCode')
const phoneNumberModel = defineModel<string>('phoneNumber')

const emit = defineEmits<{
  (e: 'change', fullNumber: string, country: CountryCode): void
  (e: 'blur', event: FocusEvent): void
}>()

const inputId = useId()
const triggerId = useId()

const rootRef = ref<HTMLDivElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const searchRef = ref<HTMLInputElement | null>(null)
const panelRef = ref<HTMLDivElement | null>(null)
const listRef = ref<HTMLUListElement | null>(null)

const open = ref(false)
const searchQuery = ref('')
const activeIndex = ref(0)

// Flag emoji generator helper
const getFlagEmoji = (isoCode: string) => {
  if (!isoCode) return '🌐'
  return isoCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
}

// Initial country resolution based on prop or ID
const findInitialCountry = (): CountryCode => {
  const def = props.defaultCountry.toUpperCase().replace('+', '')
  const found = COUNTRY_CODES.find((c) => c.iso === def || c.code === def)
  return found || { code: '62', iso: 'ID', name: 'Indonesia' }
}

const initialCountry = findInitialCountry()
const selectedCountryCode = ref(initialCountry.code)
const selectedCountryIso = ref(initialCountry.iso)
const localPhoneNumber = ref('')

const selectedCountryFlag = computed(() => getFlagEmoji(selectedCountryIso.value))

// ITU-T E.164 international standard specifies a maximum total of 15 digits
const MAX_E164_TOTAL_DIGITS = 15

// Max digits allowed for the national/subscriber number based on the country dial code length
const maxLocalDigits = computed(() => {
  return Math.max(10, MAX_E164_TOTAL_DIGITS - selectedCountryCode.value.length)
})

// Input field max character length based on E.164 standard
const effectiveMaxLength = computed(() => {
  return props.maxlength || maxLocalDigits.value
})

// Sorted country code patterns (longest code first for accurate prefix extraction)
const sortedCountriesForParse = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length)

// Parse external full modelValue into selectedCountry and localNumber
const parseIncomingValue = (val: string) => {
  if (!val) {
    localPhoneNumber.value = ''
    return
  }

  const clean = val.trim()
  if (clean.startsWith('+')) {
    const rawNumber = clean.slice(1)
    const match = sortedCountriesForParse.find((c) => rawNumber.startsWith(c.code))
    if (match) {
      selectedCountryCode.value = match.code
      selectedCountryIso.value = match.iso
      const numOnly = rawNumber.slice(match.code.length).replace(/\D/g, '')
      localPhoneNumber.value = numOnly.slice(0, maxLocalDigits.value)
      return
    }
  }

  // Fallback: If doesn't start with '+', check if starts with '08...' for Indonesia
  let digits = clean.replace(/\D/g, '')
  if (digits.startsWith('0') && selectedCountryCode.value === '62') {
    digits = digits.replace(/^0+/, '')
  }

  localPhoneNumber.value = digits.slice(0, maxLocalDigits.value)
}

// Sync external changes to internal state
watch(
  () => modelValue.value,
  (newVal) => {
    const currentCombined = localPhoneNumber.value
      ? `+${selectedCountryCode.value}${localPhoneNumber.value.replace(/\D/g, '')}`
      : ''
    if (newVal !== currentCombined) {
      parseIncomingValue(newVal)
    }
  },
  { immediate: true }
)

// Update external models when internal state changes
const emitUpdate = () => {
  const digitsOnly = localPhoneNumber.value.replace(/\D/g, '')
  const fullVal = digitsOnly ? `+${selectedCountryCode.value}${digitsOnly}` : ''

  modelValue.value = fullVal
  if (countryCodeModel.value !== undefined) {
    countryCodeModel.value = `+${selectedCountryCode.value}`
  }
  if (phoneNumberModel.value !== undefined) {
    phoneNumberModel.value = digitsOnly
  }

  const currentCountry = COUNTRY_CODES.find(
    (c) => c.code === selectedCountryCode.value && c.iso === selectedCountryIso.value
  ) || { code: selectedCountryCode.value, iso: selectedCountryIso.value, name: '' }

  emit('change', fullVal, currentCountry)
}

// Prevent typing letters and non-numeric characters (allow '+' if at beginning)
const handleKeyPress = (e: KeyboardEvent) => {
  // Allow navigation/shortcut keys (Ctrl/Cmd combos)
  if (e.ctrlKey || e.metaKey || e.altKey) return
  // Allow '+' only if input is currently empty
  if (e.key === '+' && (e.target as HTMLInputElement).value === '') {
    return
  }
  // Block any non-digit character
  if (!/^\d$/.test(e.key)) {
    e.preventDefault()
  }
}

// Handle manual phone number input
const handlePhoneInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  let val = target.value

  // If user pasted or typed '+...', auto-switch country
  if (val.startsWith('+')) {
    parseIncomingValue(val)
    emitUpdate()
    return
  }

  // Remove all non-digits
  let digits = val.replace(/\D/g, '')

  // If user typed leading '0' (e.g. 0812...), strip leading 0 for Indonesia (+62)
  if (digits.startsWith('0') && selectedCountryCode.value === '62') {
    digits = digits.replace(/^0+/, '')
  }

  // Enforce digits maximum (E.164 standard)
  if (digits.length > maxLocalDigits.value) {
    digits = digits.slice(0, maxLocalDigits.value)
  }

  localPhoneNumber.value = digits
  target.value = digits
  emitUpdate()
}

// Handle paste event
const handlePaste = (e: ClipboardEvent) => {
  const pasted = e.clipboardData?.getData('text') || ''
  if (pasted.startsWith('+')) {
    e.preventDefault()
    parseIncomingValue(pasted)
    emitUpdate()
  } else {
    e.preventDefault()
    let digits = pasted.replace(/\D/g, '')
    if (digits.startsWith('0') && selectedCountryCode.value === '62') {
      digits = digits.replace(/^0+/, '')
    }
    digits = digits.slice(0, maxLocalDigits.value)
    localPhoneNumber.value = digits
    emitUpdate()
  }
}

const handleBlur = (e: FocusEvent) => {
  emit('blur', e)
}

const clearNumber = () => {
  localPhoneNumber.value = ''
  emitUpdate()
  inputRef.value?.focus()
}

const DEFAULT_DISPLAY_LIMIT = 20
const SEARCH_DISPLAY_LIMIT = 30
const totalMatches = ref(0)

// Detect custom dial code option if search is digits (e.g. 352 or +352)
const customDialCodeOption = computed(() => {
  const q = searchQuery.value.trim().replace('+', '')
  const digitsOnly = q.replace(/\D/g, '')
  if (digitsOnly.length >= 1 && digitsOnly.length <= 4) {
    return digitsOnly
  }
  return null
})

const selectCustomDialCode = () => {
  if (!customDialCodeOption.value) return
  selectedCountryCode.value = customDialCodeOption.value
  selectedCountryIso.value = 'UN'
  emitUpdate()
  closeDropdown()
}

// Filtered country list based on search query with client-side limit
const filteredCountries = computed(() => {
  if (!searchQuery.value.trim()) {
    totalMatches.value = COUNTRY_CODES.length
    return COUNTRY_CODES.slice(0, DEFAULT_DISPLAY_LIMIT)
  }
  const q = searchQuery.value.trim().toLowerCase().replace('+', '')
  const matched = COUNTRY_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      (c.nameId && c.nameId.toLowerCase().includes(q)) ||
      c.iso.toLowerCase().includes(q) ||
      c.code.includes(q)
  )
  totalMatches.value = matched.length
  return matched.slice(0, SEARCH_DISPLAY_LIMIT)
})

watch(filteredCountries, () => {
  activeIndex.value = 0
})

// Dropdown Positioning
const dropdownStyle = ref<CSSProperties>({
  position: 'absolute',
  top: '0px',
  left: '0px',
  width: '320px',
  zIndex: '9999'
})

const updateDropdownPosition = () => {
  if (!open.value || !triggerRef.value) return

  const rect = triggerRef.value.getBoundingClientRect()
  const dropdownWidth = Math.max(300, Math.min(340, window.innerWidth - 32))
  const dropdownHeight = 300
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top

  let top = rect.bottom + 6 + window.scrollY
  if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
    top = rect.top - dropdownHeight - 6 + window.scrollY
  }

  // Left alignment with boundary checking
  let left = rect.left + window.scrollX
  if (left + dropdownWidth > window.innerWidth - 16) {
    left = window.innerWidth - dropdownWidth - 16 + window.scrollX
  }

  dropdownStyle.value = {
    position: 'absolute',
    top: `${top}px`,
    left: `${Math.max(16, left)}px`,
    width: `${dropdownWidth}px`,
    zIndex: '9999'
  }
}

const toggleOpen = () => {
  if (props.disabled) return
  open.value ? closeDropdown() : openDropdown()
}

const openDropdown = () => {
  if (props.disabled) return
  open.value = true
  searchQuery.value = ''
  activeIndex.value = Math.max(
    0,
    filteredCountries.value.findIndex(
      (c) => c.code === selectedCountryCode.value && c.iso === selectedCountryIso.value
    )
  )
  nextTick(() => {
    updateDropdownPosition()
    searchRef.value?.focus({ preventScroll: true })
  })
}

const closeDropdown = () => {
  open.value = false
  nextTick(() => inputRef.value?.focus())
}

const selectCountry = (country: CountryCode) => {
  selectedCountryCode.value = country.code
  selectedCountryIso.value = country.iso
  emitUpdate()
  closeDropdown()
}

// Keyboard navigation
const handleTriggerKeydown = (event: KeyboardEvent) => {
  if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
    event.preventDefault()
    if (!open.value) openDropdown()
  }
}

const handleSearchKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (filteredCountries.value.length > 0) {
        activeIndex.value = (activeIndex.value + 1) % filteredCountries.value.length
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (filteredCountries.value.length > 0) {
        activeIndex.value =
          (activeIndex.value - 1 + filteredCountries.value.length) % filteredCountries.value.length
      }
      break
    case 'Enter': {
      event.preventDefault()
      const selected = filteredCountries.value[activeIndex.value]
      if (selected) selectCountry(selected)
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

// Click outside handler
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  const clickedInsideTrigger = triggerRef.value?.contains(target)
  const clickedInsidePanel = panelRef.value?.contains(target)

  if (!clickedInsideTrigger && !clickedInsidePanel) {
    open.value = false
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

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('scroll', updateDropdownPosition)
  window.removeEventListener('resize', updateDropdownPosition)
})
</script>
