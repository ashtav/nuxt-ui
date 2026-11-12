<template>
  <div v-if="items.length > 0"
    class="flex flex-wrap gap-2 items-center bg-theme-app border border-theme-border rounded-xl p-3 shadow-2xs animate-fade-in">
    <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 select-none">Active Filters:</span>

    <!-- Filter Badges -->
    <span v-for="item in items" :key="item.key"
      :class="[
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border capitalize select-none transition-all',
        getVariantClasses(item.variant || 'slate')
      ]">
      <span>{{ item.label }}</span>
      <button type="button" @click="emit('clear', item.key)"
        :class="[
          'transition-colors cursor-pointer flex items-center justify-center p-0.5 rounded-md hover:bg-black/5 dark:hover:bg-theme-hover',
          getButtonClasses(item.variant || 'slate')
        ]"
        title="Remove filter">
        <Icon name="cancel-01" class="w-3 h-3" />
      </button>
    </span>

    <!-- Clear All Button -->
    <button type="button" @click="emit('clearAll')"
      class="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-theme-card hover:bg-theme-hover border border-theme-border px-2.5 py-1 rounded-lg transition-all ml-auto cursor-pointer shadow-2xs select-none">
      Clear All
    </button>
  </div>
</template>

<script setup lang="ts">
export interface ActiveFilterItem {
  key: string
  label: string
  variant?: 'emerald' | 'blue' | 'purple' | 'slate' | 'amber' | 'red'
}

defineProps<{
  items: ActiveFilterItem[]
}>()

const emit = defineEmits<{
  (e: 'clear', key: string): void
  (e: 'clearAll'): void
}>()

const getVariantClasses = (variant: string) => {
  const styles: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-theme-card dark:text-emerald-400 dark:border-theme-border shadow-2xs',
    blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-theme-card dark:text-blue-400 dark:border-theme-border shadow-2xs',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-theme-card dark:text-purple-400 dark:border-theme-border shadow-2xs',
    slate: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-theme-card dark:text-slate-300 dark:border-theme-border shadow-2xs',
    amber: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-theme-card dark:text-amber-400 dark:border-theme-border shadow-2xs',
    red: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-theme-card dark:text-rose-400 dark:border-theme-border shadow-2xs'
  }
  return styles[variant] || styles.slate
}

const getButtonClasses = (variant: string) => {
  const styles: Record<string, string> = {
    emerald: 'text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200',
    blue: 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200',
    purple: 'text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200',
    slate: 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
    amber: 'text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200',
    red: 'text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-200'
  }
  return styles[variant] || styles.slate
}
</script>
