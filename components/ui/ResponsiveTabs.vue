<template>
  <!-- Mobile: Horizontally scrollable strip (no awkward dropdown, smooth touch scrolling) -->
  <div class="md:hidden flex items-center gap-1 w-full overflow-x-auto scrollbar-none select-none pb-0.5">
    <button
      v-for="option in options"
      :key="'mobile-' + option.value"
      type="button"
      @click="selectTab(option.value)"
      class="px-3.5 py-1.5 text-xs font-medium rounded-lg capitalize transition-all duration-200 whitespace-nowrap shrink-0 relative cursor-pointer"
      :class="[
        modelValue === option.value
          ? 'bg-slate-100 dark:bg-theme-hover text-emerald-600 dark:text-emerald-400 font-semibold'
          : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
      ]"
    >
      <span>{{ option.label }}</span>
      <span v-if="option.badge" class="absolute -top-0.5 -right-0.5 flex h-2 w-2">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
      </span>
    </button>
  </div>

  <!-- Desktop: Responsive tabs with More dropdown when overflowing -->
  <div ref="containerRef" class="hidden md:flex relative items-center gap-1 w-full select-none">
    <!-- Tab buttons (always rendered, but hidden via CSS class if they overflow) -->
    <button
      v-for="(option, idx) in options"
      :key="'desktop-' + option.value"
      :ref="el => { if (el) tabRefs[idx] = el as HTMLButtonElement }"
      type="button"
      @click="selectTab(option.value)"
      class="px-3.5 py-1.5 text-xs font-medium rounded-lg capitalize transition-all duration-200 whitespace-nowrap relative cursor-pointer"
      :class="[
        modelValue === option.value
          ? 'bg-slate-100 dark:bg-theme-hover text-emerald-600 dark:text-emerald-400 font-semibold'
          : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200',
        idx >= visibleCount ? 'invisible absolute top-0 left-0 pointer-events-none -z-10' : ''
      ]"
    >
      <span>{{ option.label }}</span>
      <span v-if="option.badge" class="absolute -top-0.5 -right-0.5 flex h-2 w-2">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
      </span>
    </button>

    <!-- More Dropdown Button -->
    <div v-show="dropdownOptions.length > 0" ref="dropdownRef" class="relative shrink-0">
      <button
        type="button"
        @click="toggleDropdown"
        class="px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
        :class="[
          isDropdownActive
            ? 'bg-slate-100 dark:bg-theme-hover text-emerald-600 dark:text-emerald-400 font-semibold'
            : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
        ]"
      >
        <span>{{ dropdownButtonLabel }}</span>
        <i class="hgi hgi-stroke hgi-arrow-down-01 text-[10px] transition-transform duration-250"
          :class="{ 'rotate-180': isOpen }"></i>
      </button>

      <!-- Dropdown Menu -->
      <div
        v-show="isOpen"
        class="absolute right-0 mt-1.5 w-48 rounded-xl bg-white dark:bg-theme-card border border-theme-border shadow-xl z-30 py-1.5 animate-fade-in"
      >
        <button
          v-for="option in dropdownOptions"
          :key="option.value"
          type="button"
          @click="selectDropdownTab(option.value)"
          class="w-full text-left px-4 py-2 text-xs font-medium capitalize transition-colors flex items-center justify-between cursor-pointer"
          :class="[
            modelValue === option.value
              ? 'text-emerald-600 dark:text-emerald-400 bg-slate-50 dark:bg-theme-hover font-semibold'
              : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-theme-hover hover:text-slate-850 dark:hover:text-slate-200'
          ]"
        >
          <span>{{ option.label }}</span>
          <i v-if="modelValue === option.value"
            class="hgi hgi-stroke hgi-checkmark-circle-02 text-emerald-500 text-xs"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

interface TabOption {
  label: string
  value: string
  badge?: boolean
}

const props = defineProps<{
  options: TabOption[]
}>()

const modelValue = defineModel<string>({ required: true })

const containerRef = ref<HTMLDivElement | null>(null)
const dropdownRef = ref<HTMLDivElement | null>(null)
const tabRefs = ref<HTMLButtonElement[]>([])

const visibleCount = ref(props.options.length)
const isOpen = ref(false)

// Options that are currently hidden/moved into the dropdown
const dropdownOptions = computed(() => {
  return props.options.slice(visibleCount.value)
})

// Check if any active tab is inside the dropdown
const isDropdownActive = computed(() => {
  return dropdownOptions.value.some(opt => opt.value === modelValue.value)
})

// Dynamic label for the dropdown button
const dropdownButtonLabel = computed(() => {
  if (isDropdownActive.value) {
    const activeOpt = dropdownOptions.value.find(opt => opt.value === modelValue.value)
    return activeOpt ? activeOpt.label : 'More'
  }
  return 'More'
})

const selectTab = (val: string) => {
  modelValue.value = val
  isOpen.value = false
}

const selectDropdownTab = (val: string) => {
  modelValue.value = val
  isOpen.value = false
}

const toggleDropdown = (e: Event) => {
  e.stopPropagation()
  isOpen.value = !isOpen.value
}

// Logic to calculate how many tabs fit in the container
const calculateLayout = () => {
  if (!containerRef.value) return

  const containerWidth = containerRef.value.clientWidth
  if (containerWidth === 0) return

  const tabWidths = tabRefs.value.map(el => el ? el.getBoundingClientRect().width + 4 : 0) // 4px gap
  const dropdownBtnWidth = isDropdownActive.value ? 140 : 80

  const totalWidth = tabWidths.reduce((sum, w) => sum + w, 0)

  // Kalau semua tab muat tanpa perlu dropdown sama sekali, tampilkan semua
  if (totalWidth <= containerWidth) {
    visibleCount.value = props.options.length
    return
  }

  // Kalau tidak muat, baru hitung berapa yang muat sambil reserve ruang untuk tombol "More"
  let accumulatedWidth = 0
  let fitIndex = 0

  for (let i = 0; i < tabWidths.length; i++) {
    const nextWidth = accumulatedWidth + (tabWidths[i] ?? 0)
    if (nextWidth <= containerWidth - dropdownBtnWidth) {
      accumulatedWidth = nextWidth
      fitIndex = i + 1
    } else {
      break
    }
  }

  visibleCount.value = Math.max(1, fitIndex)
}

// Click outside handler
const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

// Resize Observer to trigger layout calculation
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  nextTick(() => {
    calculateLayout()
  })

  // Recalculate setelah font selesai load
  if (document.fonts) {
    document.fonts.ready.then(() => {
      calculateLayout()
    })
  }

  window.addEventListener('click', handleClickOutside)

  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      calculateLayout()
    })
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

// Recalculate on options or modelValue change just in case
watch([() => props.options, () => modelValue.value], () => {
  nextTick(calculateLayout)
}, { deep: true })
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.15s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
</style>
