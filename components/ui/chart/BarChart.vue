<template>
  <div
    ref="containerRef"
    class="relative w-full h-72 select-none"
    @mousemove="handleMouseMove"
    @mouseleave="clearHovered"
  >
    <ClientOnly>
      <svg v-if="data && data.length > 0" class="w-full h-full overflow-visible">
        <!-- Horizontal Grid Lines -->
        <line
          v-for="yVal in yGridLines"
          :key="yVal"
          :x1="padding.left"
          :y1="yScale(yVal)"
          :x2="width - padding.right"
          :y2="yScale(yVal)"
          class="stroke-slate-200 dark:stroke-theme-border"
          stroke-dasharray="4 4"
        />

        <!-- Active Column Highlight Band -->
        <rect
          v-if="hoveredIndex !== null && groupWidth > 0"
          :x="groupX(hoveredIndex) - 4"
          :y="padding.top"
          :width="groupWidth + 8"
          :height="chartHeight"
          class="fill-slate-200/50 dark:fill-theme-hover transition-colors pointer-events-none"
          rx="6"
        />

        <!-- Grouped Bars -->
        <g v-for="(item, groupIdx) in data" :key="'group-' + groupIdx">
          <g v-for="(cat, catIdx) in categories" :key="cat">
            <rect
              :x="barX(groupIdx, catIdx)"
              :y="barY(item[cat] || 0)"
              :width="barWidth"
              :height="barHeight(item[cat] || 0)"
              :fill="colors[catIdx] || defaultColors[catIdx % defaultColors.length]"
              :rx="Math.min(barWidth / 2, 4)"
              class="transition-all duration-200"
              :class="[
                hoveredIndex !== null && hoveredIndex !== groupIdx ? 'opacity-35' : 'opacity-100'
              ]"
            />
          </g>
        </g>

        <!-- X Axis Labels -->
        <text
          v-for="(item, idx) in data"
          :key="'x-' + idx"
          :x="groupX(idx) + groupWidth / 2"
          :y="shouldRotateXLabels ? height - padding.bottom + 14 : height - padding.bottom + 18"
          :text-anchor="shouldRotateXLabels ? 'end' : 'middle'"
          :transform="shouldRotateXLabels ? `rotate(-45 ${groupX(idx) + groupWidth / 2} ${height - padding.bottom + 14})` : undefined"
          class="fill-slate-500 dark:fill-slate-400 font-medium text-[9px] sm:text-[10px]"
        >
          {{ item[index] }}
        </text>

        <!-- Y Axis Labels -->
        <text
          v-for="yVal in yGridLines"
          :key="'y-' + yVal"
          :x="padding.left - 10"
          :y="yScale(yVal) + 3"
          text-anchor="end"
          class="fill-slate-500 dark:fill-slate-400 font-medium text-[10px]"
        >
          Rp {{ formatYLabel(yVal) }}
        </text>
      </svg>

      <!-- Tooltip -->
      <div
        v-if="hoveredIndex !== null && hoveredData"
        class="absolute z-20 pointer-events-none p-3 bg-white dark:bg-theme-card border border-slate-200 dark:border-theme-border rounded-xl shadow-xl flex flex-col text-left transition-all duration-150 animate-tooltip-in min-w-[170px]"
        :style="tooltipStyle"
      >
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-1.5 border-b border-slate-200 dark:border-theme-border flex items-center justify-between">
          <span>{{ hoveredData[index] }}</span>
        </div>
        <div class="mt-2 space-y-1.5 text-xs">
          <div
            v-for="(cat, catIdx) in categories"
            :key="cat"
            class="flex items-center justify-between gap-3"
          >
            <div class="flex items-center gap-1.5">
              <span
                class="w-2 h-2 rounded-full shrink-0"
                :style="{ backgroundColor: colors[catIdx] || defaultColors[catIdx % defaultColors.length] }"
              ></span>
              <span class="text-slate-600 dark:text-slate-300 capitalize text-[11px]">{{ categoryLabels[cat] || cat }}:</span>
            </div>
            <span class="font-mono font-semibold text-slate-900 dark:text-white text-[11px]">
              Rp {{ Number(hoveredData[cat] || 0).toLocaleString('id-ID') }}
            </span>
          </div>

          <!-- Calculated Net if both revenue & expenses exist -->
          <div
            v-if="hoveredData.revenue !== undefined && hoveredData.expenses !== undefined"
            class="pt-1.5 border-t border-slate-200 dark:border-theme-border flex items-center justify-between font-semibold text-[11px]"
            :class="(Number(hoveredData.revenue) - Number(hoveredData.expenses)) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
          >
            <span>Net Profit:</span>
            <span class="font-mono">
              Rp {{ (Number(hoveredData.revenue) - Number(hoveredData.expenses)).toLocaleString('id-ID') }}
            </span>
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = withDefaults(
  defineProps<{
    data: any[]
    index: string
    categories: string[]
    colors?: string[]
    categoryLabels?: Record<string, string>
    rotateMobileXLabels?: boolean
  }>(),
  {
    colors: () => ['#3b82f6', '#f43f5e', '#10b981'],
    categoryLabels: () => ({}),
    rotateMobileXLabels: true
  }
)

const defaultColors = ['#3b82f6', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6']

const containerRef = ref<HTMLElement | null>(null)
const width = ref(600)
const height = ref(280)
const hoveredIndex = ref<number | null>(null)
const isMobile = ref(false)

const shouldRotateXLabels = computed(() => isMobile.value && props.rotateMobileXLabels)

const padding = computed(() => ({
  top: 25,
  right: 20,
  bottom: shouldRotateXLabels.value ? 48 : 30,
  left: 55
}))

const chartWidth = computed(() => Math.max(width.value - padding.value.left - padding.value.right, 50))
const chartHeight = computed(() => Math.max(height.value - padding.value.top - padding.value.bottom, 50))

const maxVal = computed(() => {
  let highest = 0
  props.data.forEach(item => {
    props.categories.forEach(cat => {
      const v = Number(item[cat] || 0)
      if (v > highest) highest = v
    })
  })
  if (highest === 0) highest = 1000000
  // Round up to nice number
  const magnitude = Math.pow(10, Math.floor(Math.log10(highest)))
  return Math.ceil(highest / magnitude) * magnitude
})

const yScale = (val: number) => {
  const percent = Math.min(Math.max(val / maxVal.value, 0), 1)
  return height.value - padding.value.bottom - percent * chartHeight.value
}

const yGridLines = computed(() => {
  const steps = 4
  const lines = []
  for (let i = 0; i <= steps; i++) {
    lines.push((maxVal.value / steps) * i)
  }
  return lines
})

const formatYLabel = (val: number) => {
  if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(1) + 'B'
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(0) + 'M'
  if (val >= 1_000) return (val / 1_000).toFixed(0) + 'k'
  return val.toString()
}

// Group & Bar layout calculations
const groupWidth = computed(() => {
  if (!props.data.length) return 0
  const available = chartWidth.value / props.data.length
  return Math.min(available * 0.72, 60)
})

const barGap = 3
const barWidth = computed(() => {
  const count = props.categories.length
  if (count === 0) return 0
  const totalGap = (count - 1) * barGap
  return Math.max((groupWidth.value - totalGap) / count, 4)
})

const groupX = (groupIdx: number) => {
  const step = chartWidth.value / Math.max(props.data.length, 1)
  const groupCenter = padding.value.left + groupIdx * step + step / 2
  return groupCenter - groupWidth.value / 2
}

const barX = (groupIdx: number, catIdx: number) => {
  return groupX(groupIdx) + catIdx * (barWidth.value + barGap)
}

const barHeight = (val: number) => {
  const percent = Math.min(Math.max(val / maxVal.value, 0), 1)
  return percent * chartHeight.value
}

const barY = (val: number) => {
  return yScale(val)
}

const hoveredData = computed(() => {
  if (hoveredIndex.value === null) return null
  return props.data[hoveredIndex.value] || null
})

const tooltipStyle = computed(() => {
  if (hoveredIndex.value === null) return {}
  const gx = groupX(hoveredIndex.value) + groupWidth.value / 2

  let left = gx - 90
  if (left < 10) left = 10
  if (left + 190 > width.value) left = width.value - 200

  return {
    left: `${left}px`,
    top: `10px`
  }
})

const handleMouseMove = (event: MouseEvent) => {
  if (!containerRef.value || !props.data.length) return
  const rect = containerRef.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left

  const step = chartWidth.value / props.data.length
  const relativeX = mouseX - padding.value.left

  if (relativeX < 0 || mouseX > width.value - padding.value.right) {
    hoveredIndex.value = null
    return
  }

  const idx = Math.floor(relativeX / step)
  if (idx >= 0 && idx < props.data.length) {
    hoveredIndex.value = idx
  } else {
    hoveredIndex.value = null
  }
}

const clearHovered = () => {
  hoveredIndex.value = null
}

const handleResize = () => {
  if (containerRef.value) {
    width.value = containerRef.value.clientWidth || 600
    height.value = containerRef.value.clientHeight || 280
  }
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 640 || width.value < 540
  }
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
  if (typeof ResizeObserver !== 'undefined' && containerRef.value) {
    resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
</script>
