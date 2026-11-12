<template>
  <div class="space-y-3">
    <!-- Control/Search Panel -->
    <div
      class="bg-white dark:bg-theme-card border border-theme-border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
      <div class="w-full md:w-auto flex-1 flex flex-wrap md:flex-nowrap items-center gap-2">
        <!-- Per Page Dropdown -->
        <UiDropdownMenu v-if="showPerPage" :options="perPageDropdownOptions" align="left" width="w-28">
          <button type="button"
            class="h-9 px-2.5 flex items-center gap-1.5 text-xs bg-slate-100 focus:bg-white dark:bg-theme-input dark:focus:bg-theme-hover border border-transparent dark:border-theme-border focus:border-emerald-500/35 rounded-lg outline-none text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-200 dark:hover:bg-theme-hover cursor-pointer whitespace-nowrap shrink-0 select-none">
            <span>{{ perPage }} / page</span>
            <Icon name="arrow-down-01" class="text-[10px] text-slate-400 dark:text-slate-500" />
          </button>
        </UiDropdownMenu>

        <!-- Search Input & Menu Actions Group -->
        <div class="flex-1 min-w-0 flex items-center gap-2 w-full sm:w-auto">
          <!-- Search Input -->
          <div class="relative flex-1 min-w-0 max-w-md flex items-center">
            <span
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Icon name="search-01" class="text-sm" />
            </span>
            <input :value="searchQuery" @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
              type="text" name="search" autocomplete="off" :placeholder="searchPlaceholder"
              class="w-full h-9 pl-9 pr-9 py-0 text-xs bg-slate-100 focus:bg-white dark:bg-theme-input dark:focus:bg-theme-hover border border-transparent dark:border-theme-border focus:border-emerald-500/35 rounded-lg outline-none text-slate-850 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200" />
            <button v-if="searchQuery" @click="emit('update:searchQuery', '')"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-655 dark:text-slate-500 dark:hover:text-slate-355 transition-colors cursor-pointer"
              type="button" title="Clear search">
              <Icon name="cancel-01" class="text-sm" />
            </button>
          </div>

          <!-- Menu Action Dropdown -->
          <UiDropdownMenu v-if="actions && actions.length > 0" :options="actions" align="right" width="w-[200px]">
            <button type="button"
              class="h-9 w-9 flex items-center justify-center bg-slate-100 dark:bg-theme-input rounded-lg outline-none text-slate-500 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-theme-hover transition-all cursor-pointer border border-transparent dark:border-theme-border shrink-0"
              title="Actions">
              <Icon name="menu-02" />
            </button>
          </UiDropdownMenu>
        </div>

        <!-- Inline filters slot -->
        <slot />
      </div>

      <!-- Summary info -->
      <div v-if="total !== undefined && currentPage !== undefined"
        class="hidden sm:block text-[13px] text-slate-400 dark:text-slate-500 select-none shrink-0">
        Showing {{ total === 0 ? 0 : (currentPage - 1) * perPage + 1 }} - {{ Math.min(currentPage * perPage,
          total) }} of {{ total }} Data
      </div>
    </div>

    <!-- Active Filters Display -->
    <UiActiveFilters v-if="filterItems && filterItems.length > 0" :items="filterItems"
      @clear="emit('clearFilter', $event)" @clearAll="emit('clearAllFilters')" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DropdownItem } from '~/components/ui/DropdownMenu.vue'
import type { ActiveFilterItem } from '~/components/ui/ActiveFilters.vue'

const props = withDefaults(defineProps<{
  searchQuery: string
  searchPlaceholder?: string
  perPage?: number
  perPageOptions?: number[]
  showPerPage?: boolean
  actions?: DropdownItem[]
  total?: number
  currentPage?: number
  filterItems?: ActiveFilterItem[]
}>(), {
  searchPlaceholder: 'Search...',
  perPage: 10,
  perPageOptions: () => [10, 15, 30, 50, 100],
  showPerPage: true,
  actions: () => [] as DropdownItem[],
  filterItems: () => [] as ActiveFilterItem[]
})

const emit = defineEmits<{
  (e: 'update:searchQuery', val: string): void
  (e: 'update:perPage', val: number): void
  (e: 'clearFilter', key: string): void
  (e: 'clearAllFilters'): void
}>()

// Generate perPage dropdown options dynamically
const perPageDropdownOptions = computed(() => {
  return props.perPageOptions.map(opt => ({
    label: `${opt} / page`,
    selected: props.perPage === opt,
    onClick: () => emit('update:perPage', opt)
  }))
})
</script>
