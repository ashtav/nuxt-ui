<template>
  <div class="flex flex-col gap-2 w-full select-none">
    <!-- Header: Label & Active Value Badge -->
    <div
      v-if="label || $slots.label || showValueBadge || $slots.badge"
      class="flex items-center justify-between gap-2"
    >
      <slot name="label">
        <Label
          v-if="label"
          :icon="icon"
          :text="label"
          :required="required"
          size="sm"
          weight="semibold"
          class="text-slate-900 dark:text-white"
        />
      </slot>

      <!-- Active Value Display Badge (Shadcn style) -->
      <slot name="badge" :value="numericValue">
        <span
          v-if="showValueBadge"
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs shrink-0"
        >
          <span>{{ formattedValue }}</span>
          <span v-if="unit" class="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{{ unit }}</span>
        </span>
      </slot>
    </div>

    <!-- Optional description / helper -->
    <slot name="description">
      <p v-if="description" class="text-xs text-slate-500 dark:text-slate-400">
        {{ description }}
      </p>
    </slot>

    <!-- Slider Container -->
    <div class="relative py-2 flex items-center group">
      <!-- Hidden Native Range Input for accessibility & smooth touch/drag -->
      <input
        type="range"
        :min="inputMin"
        :max="inputMax"
        :step="inputStep"
        :value="inputValue"
        :disabled="disabled"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
        @input="handleInput"
      />

      <!-- Custom Visual Track (Compact 4px track) -->
      <div class="relative w-full h-1 rounded-full bg-slate-200 dark:bg-theme-input overflow-hidden pointer-events-none">
        <!-- Active Progress Fill -->
        <div
          class="h-full bg-emerald-500 dark:bg-emerald-500 transition-all duration-75 rounded-full"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>

      <!-- Custom Visual Thumb -->
      <div
        class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white dark:bg-theme-card border-2 border-emerald-500 dark:border-emerald-400 shadow-xs transition-transform duration-75 pointer-events-none group-hover:scale-115 group-active:scale-95"
        :style="{ left: `${progressPercentage}%` }"
      ></div>
    </div>

    <!-- Ticks & Step Markers (Mathematically aligned to thumb) -->
    <div
      v-if="showTicks && tickItems.length > 0"
      class="relative w-full h-4 mt-1 text-[11px] font-medium text-slate-400 dark:text-slate-500"
    >
      <button
        v-for="(tick, idx) in tickItems"
        :key="tick.value"
        type="button"
        class="absolute top-0 cursor-pointer transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 text-center whitespace-nowrap select-none"
        :style="getTickStyle(tick, idx)"
        :class="numericValue === tick.value ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''"
        @click="setValue(tick.value)"
      >
        <span>{{ tick.label ?? tick.value }}</span>
        <span v-if="tickUnit" class="text-[9px] ml-0.5">{{ tickUnit }}</span>
      </button>
    </div>

    <!-- Error message -->
    <span v-if="typeof error === 'string' && error" class="text-xs text-red-500 dark:text-red-400 mt-0.5 font-normal">
      {{ error }}
    </span>

    <!-- Hint -->
    <span v-else-if="hint" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
      {{ hint }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Label from '~/components/Label.vue'

export interface SliderTick {
  value: number
  label?: string
}

const modelValue = defineModel<number | string>({ default: 1 })

interface Props {
  label?: string
  icon?: string
  description?: string
  min?: number
  max?: number
  step?: number
  steps?: number[]
  ticks?: (number | SliderTick)[]
  unit?: string
  tickUnit?: string
  showTicks?: boolean
  showValueBadge?: boolean
  formatValue?: (val: number) => string | number
  required?: boolean
  disabled?: boolean
  error?: string | boolean
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  icon: '',
  description: '',
  min: 1,
  max: 7,
  step: 1,
  steps: undefined,
  ticks: undefined,
  unit: '',
  tickUnit: '',
  showTicks: true,
  showValueBadge: true,
  formatValue: undefined,
  required: false,
  disabled: false,
  error: false,
  hint: '',
})

const hasCustomSteps = computed(() => Array.isArray(props.steps) && props.steps.length > 0)

const numericValue = computed<number>(() => {
  const val = Number(modelValue.value)
  if (hasCustomSteps.value && props.steps && props.steps.length > 0) {
    return isNaN(val) ? (props.steps[0] ?? props.min) : val
  }
  return isNaN(val) ? props.min : val
})

const formattedValue = computed(() => {
  if (props.formatValue) {
    return props.formatValue(numericValue.value)
  }
  return numericValue.value
})

const inputMin = computed(() => {
  return hasCustomSteps.value ? 0 : props.min
})

const inputMax = computed(() => {
  if (hasCustomSteps.value && props.steps) {
    return props.steps.length - 1
  }
  return props.max
})

const inputStep = computed(() => {
  return hasCustomSteps.value ? 1 : props.step
})

const inputValue = computed<number>(() => {
  if (hasCustomSteps.value && props.steps) {
    const idx = props.steps.indexOf(numericValue.value)
    if (idx !== -1) return idx
    // Find closest index
    let closestIdx = 0
    let minDiff = Infinity
    props.steps.forEach((s, i) => {
      const diff = Math.abs(s - numericValue.value)
      if (diff < minDiff) {
        minDiff = diff
        closestIdx = i
      }
    })
    return closestIdx
  }
  return numericValue.value
})

const progressPercentage = computed(() => {
  if (hasCustomSteps.value && props.steps) {
    const totalSteps = props.steps.length - 1
    if (totalSteps <= 0) return 0
    return (inputValue.value / totalSteps) * 100
  }
  const range = props.max - props.min
  if (range <= 0) return 0
  const clamped = Math.min(Math.max(numericValue.value, props.min), props.max)
  return ((clamped - props.min) / range) * 100
})

const tickItems = computed<SliderTick[]>(() => {
  if (props.ticks && props.ticks.length > 0) {
    return props.ticks.map((t) => (typeof t === 'number' ? { value: t, label: String(t) } : t))
  }
  if (hasCustomSteps.value && props.steps) {
    return props.steps.map((s) => ({ value: s, label: String(s) }))
  }
  if (!props.showTicks) return []
  const range = props.max - props.min
  const count = props.step > 0 ? Math.floor(range / props.step) : 0
  if (count > 15) {
    return [
      { value: props.min, label: String(props.min) },
      { value: props.max, label: String(props.max) },
    ]
  }
  const items: SliderTick[] = []
  for (let i = props.min; i <= props.max; i += props.step) {
    items.push({ value: i, label: String(i) })
  }
  return items
})

const getTickPercentage = (tick: SliderTick, idx: number) => {
  if (hasCustomSteps.value && props.steps) {
    const totalSteps = props.steps.length - 1
    if (totalSteps <= 0) return 0
    const stepIdx = props.steps.indexOf(tick.value)
    return ((stepIdx !== -1 ? stepIdx : idx) / totalSteps) * 100
  }
  const range = props.max - props.min
  if (range <= 0) return 0
  return ((tick.value - props.min) / range) * 100
}

const getTickStyle = (tick: SliderTick, idx: number) => {
  const pct = getTickPercentage(tick, idx)
  if (pct <= 2) {
    return { left: '0%', transform: 'translateX(0%)' }
  }
  if (pct >= 98) {
    return { left: '100%', transform: 'translateX(-100%)' }
  }
  return { left: `${pct}%`, transform: 'translateX(-50%)' }
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const raw = Number(target.value)
  if (hasCustomSteps.value && props.steps && props.steps.length > 0) {
    const selectedVal = props.steps[raw] ?? props.steps[0] ?? props.min
    modelValue.value = selectedVal
  } else {
    modelValue.value = raw
  }
}

const setValue = (val: number) => {
  if (props.disabled) return
  modelValue.value = val
}
</script>
