<template>
  <div class="space-y-6 py-2">
    <!-- File Type Selection (Custom Premium Radio Cards) -->
    <div class="space-y-2">
      <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
        File Format
      </label>
      <div class="grid grid-cols-3 gap-2">
        <!-- Excel Option -->
        <button type="button" @click="fileType = 'excel'"
          class="flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 text-center cursor-pointer group bg-theme-card"
          :class="[
            fileType === 'excel'
              ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
              : 'border-theme-border hover:bg-slate-50 dark:hover:bg-theme-hover text-slate-500 dark:text-slate-400'
          ]">
          <Icon name="files-01" size="lg"
            class="mb-2 group-hover:scale-110 transition-transform text-emerald-600 dark:text-emerald-500" />
          <span class="text-xs font-bold">Excel</span>
        </button>

        <!-- CSV Option -->
        <button type="button" @click="fileType = 'csv'"
          class="flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 text-center cursor-pointer group bg-theme-card"
          :class="[
            fileType === 'csv'
              ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400'
              : 'border-theme-border hover:bg-slate-50 dark:hover:bg-theme-hover text-slate-500 dark:text-slate-400'
          ]">
          <Icon name="csv-02" size="lg"
            class="mb-2 group-hover:scale-110 transition-transform text-blue-600 dark:text-blue-500" />
          <span class="text-xs font-bold">CSV</span>
        </button>

        <!-- PDF Option -->
        <button type="button" @click="fileType = 'pdf'"
          class="flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 text-center cursor-pointer group bg-theme-card"
          :class="[
            fileType === 'pdf'
              ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400'
              : 'border-theme-border hover:bg-slate-50 dark:hover:bg-theme-hover text-slate-500 dark:text-slate-400'
          ]">
          <Icon name="pdf-02" size="lg"
            class="mb-2 group-hover:scale-110 transition-transform text-rose-600 dark:text-rose-500" />
          <span class="text-xs font-bold">PDF</span>
        </button>
      </div>
    </div>

    <!-- Limit Selection (Custom Chip Radios) -->
    <div class="space-y-2">
      <label class="text-sm font-semibold text-slate-700 dark:text-slate-200 block">
        Number of Records
      </label>
      <div class="flex flex-wrap gap-2">
        <button v-for="opt in limitOptions" :key="opt.value" type="button" @click="limit = opt.value"
          class="px-4 py-2 text-xs font-semibold rounded-lg border transition-all duration-150 cursor-pointer" :class="[
            limit === opt.value
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
              : 'bg-theme-card text-slate-600 dark:text-slate-400 border-theme-border hover:bg-slate-50 dark:hover:bg-theme-hover'
          ]">
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- Sort/Order Selection -->
    <div class="space-y-2">
      <label class="text-sm font-semibold text-slate-700 dark:text-slate-200 block">
        {{ sortLabel }}
      </label>
      <div class="flex gap-4">
        <label
          class="inline-flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200 cursor-pointer select-none">
          <span class="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
            <input type="radio" value="desc" v-model="order"
              class="peer absolute inset-0 h-4 w-4 shrink-0 appearance-none rounded-full border border-theme-input bg-theme-input transition-all checked:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <span
              class="pointer-events-none h-1.5 w-1.5 rounded-full bg-emerald-500 scale-0 peer-checked:scale-100 transition-transform" />
          </span>
          <span>{{ latestLabel }}</span>
        </label>

        <label
          class="inline-flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200 cursor-pointer select-none">
          <span class="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
            <input type="radio" value="asc" v-model="order"
              class="peer absolute inset-0 h-4 w-4 shrink-0 appearance-none rounded-full border border-theme-input bg-theme-input transition-all checked:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <span
              class="pointer-events-none h-1.5 w-1.5 rounded-full bg-emerald-500 scale-0 peer-checked:scale-100 transition-transform" />
          </span>
          <span>{{ oldestLabel }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const fileType = defineModel<'excel' | 'csv' | 'pdf'>('fileType', { default: 'excel' })
const limit = defineModel<string>('limit', { default: 'all' })
const order = defineModel<'desc' | 'asc'>('order', { default: 'desc' })

withDefaults(
  defineProps<{
    sortLabel?: string
    latestLabel?: string
    oldestLabel?: string
  }>(),
  {
    sortLabel: 'Sort Order',
    latestLabel: 'Newest First',
    oldestLabel: 'Oldest First'
  }
)

const limitOptions = [
  { label: 'All Data', value: 'all' },
  { label: '100 Records', value: '100' },
  { label: '500 Records', value: '500' },
  { label: '1,000 Records', value: '1000' },
  { label: '1,500 Records', value: '1500' }
]
</script>
