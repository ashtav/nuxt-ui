<template>
  <div class="flex flex-col gap-1.5 w-full">
    <!-- Label -->
    <label v-if="label"
      class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
      {{ label }}
    </label>

    <!-- Two-column Date Pickers -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
      <FormDatePicker
        v-model="from"
        :placeholder="fromPlaceholder"
        :min="min"
        :max="effectiveFromMax"
        :disabled="disabled"
        :clearable="clearable"
        @change="handleFromChange" />

      <FormDatePicker
        v-model="to"
        :placeholder="toPlaceholder"
        :min="effectiveToMin"
        :max="effectiveMax"
        :disabled="disabled"
        :clearable="clearable"
        @change="handleToChange" />
    </div>

    <!-- Hint Text -->
    <span v-if="hint" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
      {{ hint }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import dayjs from 'dayjs'

interface Props {
  label?: string
  hint?: string
  fromPlaceholder?: string
  toPlaceholder?: string
  disabled?: boolean
  clearable?: boolean
  maxToday?: boolean
  max?: string
  min?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  hint: '',
  fromPlaceholder: 'Start date (From)',
  toPlaceholder: 'End date (To)',
  disabled: false,
  clearable: true,
  maxToday: false,
  max: undefined,
  min: undefined
})

const from = defineModel<string>('from', { default: '' })
const to = defineModel<string>('to', { default: '' })

const todayStr = dayjs().format('YYYY-MM-DD')

const effectiveMax = computed(() => {
  if (props.maxToday) return todayStr
  return props.max || undefined
})

const effectiveFromMax = computed(() => {
  if (to.value && effectiveMax.value) {
    return to.value < effectiveMax.value ? to.value : effectiveMax.value
  }
  return to.value || effectiveMax.value
})

const effectiveToMin = computed(() => {
  if (from.value && props.min) {
    return from.value > props.min ? from.value : props.min
  }
  return from.value || props.min || undefined
})

const handleFromChange = (val: any) => {
  const fromStr = typeof val === 'string' ? val : ''
  if (props.maxToday && fromStr && fromStr > todayStr) {
    from.value = todayStr
    return
  }
  if (fromStr && to.value && fromStr > to.value) {
    to.value = fromStr
  }
}

const handleToChange = (val: any) => {
  const toStr = typeof val === 'string' ? val : ''
  if (props.maxToday && toStr && toStr > todayStr) {
    to.value = todayStr
    return
  }
  if (toStr && from.value && toStr < from.value) {
    from.value = toStr
  }
}

// Watchers for programmatic updates
watch(from, (newFrom) => {
  if (props.maxToday && newFrom && newFrom > todayStr) {
    from.value = todayStr
    return
  }
  if (newFrom && to.value && newFrom > to.value) {
    to.value = newFrom
  }
})

watch(to, (newTo) => {
  if (props.maxToday && newTo && newTo > todayStr) {
    to.value = todayStr
    return
  }
  if (newTo && from.value && newTo < from.value) {
    from.value = newTo
  }
})
</script>
