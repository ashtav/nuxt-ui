<template>
  <div class="relative w-full h-full min-h-[260px] select-none" ref="containerRef" @mousemove="handleMouseMove"
    @mouseleave="clearHovered">
    <ClientOnly>
      <!-- SVG Area Chart -->
      <svg class="w-full h-full overflow-visible" v-if="points.length > 0">
        <!-- Grid Lines -->
        <line v-for="yVal in yGridLines" :key="yVal" :x1="padding.left" :y1="yScale(yVal)" :x2="width - padding.right"
          :y2="yScale(yVal)" class="stroke-slate-100 dark:stroke-theme-border" stroke-dasharray="4 4" />

        <!-- Active Vertical Guideline -->
        <line v-if="hoveredPoint" :x1="hoveredPoint.x" :y1="padding.top" :x2="hoveredPoint.x"
          :y2="height - padding.bottom" class="stroke-slate-200 dark:stroke-theme-border" stroke-width="1.5"
          stroke-dasharray="4 4" />

        <!-- Area Gradient Fill -->
        <defs>
          <linearGradient :id="`gradient-${gradientId}`" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" :stop-color="colors[0] || '#3b82f6'" stop-opacity="0.25" />
            <stop offset="100%" :stop-color="colors[0] || '#3b82f6'" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Fill Path -->
        <path :d="areaPath" :fill="`url(#gradient-${gradientId})`" class="transition-all duration-300" />

        <!-- Stroke Path -->
        <path :d="strokePath" fill="none" :stroke="colors[0] || '#3b82f6'" stroke-width="2.5" stroke-linecap="round"
          stroke-linejoin="round" class="transition-all duration-300" />

        <!-- Glow Dots on points on Hover/Active -->
        <g v-for="(pt, idx) in points" :key="idx">
          <!-- Outer Halo -->
          <circle v-if="hoveredIndex === idx" :cx="pt.x" :cy="pt.y" r="9" :fill="colors[0] || '#3b82f6'"
            class="opacity-20 transition-all duration-150" />
          <!-- Inner Dot -->
          <circle :cx="pt.x" :cy="pt.y" :r="hoveredIndex === idx ? 5.5 : 4" :fill="colors[0] || '#3b82f6'"
            class="stroke-white dark:stroke-theme-card transition-all duration-150"
            :class="[hoveredIndex === idx ? 'stroke-2 shadow-md shadow-emerald-500/50' : 'stroke-1.5']" />
        </g>

        <!-- X Axis labels with breathing room -->
        <text v-for="(pt, idx) in points" :key="'x-' + idx" :x="pt.x"
          :y="shouldRotateXLabels ? height - padding.bottom + 14 : height - padding.bottom + 20"
          :text-anchor="shouldRotateXLabels ? 'end' : (idx === 0 ? 'start' : idx === points.length - 1 ? 'end' : 'middle')"
          :transform="shouldRotateXLabels ? `rotate(-45 ${pt.x} ${height - padding.bottom + 14})` : undefined"
          class="fill-slate-400 dark:fill-slate-500 font-medium text-[10px] sm:text-[11px]">
          {{ formatXLabel(data[idx][index], idx) }}
        </text>

        <!-- Y Axis labels -->
        <text v-for="yVal in yGridLines" :key="'y-' + yVal" :x="padding.left - 10" :y="yScale(yVal) + 3"
          text-anchor="end" class="fill-slate-400 dark:fill-slate-500 font-medium text-[9px] sm:text-[10px]">
          {{ renderYLabel(yVal) }}
        </text>
      </svg>

      <!-- Chart Tooltip -->
      <div v-if="hoveredPoint && hoveredData"
        class="absolute z-20 pointer-events-none p-3 bg-white dark:bg-theme-card border border-slate-200 dark:border-theme-border rounded-xl shadow-lg flex flex-col text-left transition-all duration-150 animate-tooltip-in"
        :style="tooltipStyle">
        <span class="text-[9px] font-medium tracking-wider text-slate-400 dark:text-slate-500" :class="{ 'uppercase': !props.tooltipTitleFormatter }">
          {{ renderTooltipTitle(hoveredData) }}
        </span>
        <span class="text-xs font-semibold text-slate-800 dark:text-white mt-0.5">
          {{ displayCategoryLabel }}: {{ renderTooltipValue(hoveredData[categoryKey], hoveredData) }}
        </span>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'
import { formatIDR } from '~/utils/format'

interface Props {
  data: any[]
  index: string
  categories: string[]
  colors?: string[]
  mobileXLabelFormat?: string
  rotateMobileXLabels?: boolean
  xFormatter?: (val: string, idx: number, total: number) => string
  yMin?: number
  yMax?: number
  ySteps?: number
  yPrefix?: string
  ySuffix?: string
  yFormatter?: (val: number) => string
  categoryLabel?: string
  valueFormatter?: (val: any, dataItem?: any) => string
  tooltipTitleFormatter?: (dataItem: any) => string
}

const props = withDefaults(defineProps<Props>(), {
  colors: () => ['#10b981'],
  mobileXLabelFormat: 'MM/YYYY',
  rotateMobileXLabels: false,
  yMin: 0,
  ySteps: 4,
  yPrefix: 'Rp '
})

const containerRef = ref<HTMLElement | null>(null)
const width = ref(500)
const height = ref(280)
const hoveredIndex = ref<number | null>(null)
const isMobile = ref(false)

// Unique ID for gradients
const gradientId = Math.random().toString(36).substring(2, 9)

const shouldRotateXLabels = computed(() => isMobile.value && props.rotateMobileXLabels && !props.xFormatter)

const padding = computed(() => ({
  top: 24,
  right: 24,
  bottom: shouldRotateXLabels.value ? 52 : 36,
  left: props.yPrefix === '' ? 38 : 55
}))

// Compute scaling functions
const xScale = (index: number) => {
  const chartWidth = width.value - padding.value.left - padding.value.right
  if (props.data.length <= 1) {
    return padding.value.left + chartWidth / 2
  }
  const step = chartWidth / (props.data.length - 1)
  return padding.value.left + index * step
}

const categoryKey = computed(() => props.categories[0] || '')

const displayCategoryLabel = computed(() => {
  if (props.categoryLabel) return props.categoryLabel
  if (props.categories && props.categories[0] === 'revenue') return 'Revenue'
  return props.categories[0] || 'Value'
})

const maxVal = computed(() => {
  if (props.yMax !== undefined) {
    return props.yMax
  }
  const values = props.data.map(item => Number(item[categoryKey.value]) || 0)
  const peak = Math.max(...values, 0)
  if (peak >= 100_000_000) {
    return Math.ceil(peak / 50_000_000) * 50_000_000
  }
  if (peak >= 10_000_000) {
    return Math.ceil(peak / 10_000_000) * 10_000_000
  }
  if (peak >= 1_000_000) {
    return Math.ceil(peak / 1_000_000) * 1_000_000
  }
  if (peak >= 1_000) {
    return Math.ceil(peak / 1000) * 1000
  }
  if (peak >= 100) {
    return Math.ceil(peak / 20) * 20
  }
  if (peak >= 10) {
    return Math.ceil(peak / 5) * 5
  }
  return Math.max(peak, 5)
})

const minVal = computed(() => {
  return props.yMin !== undefined ? props.yMin : 0
})

const yScale = (val: number) => {
  const chartHeight = height.value - padding.value.top - padding.value.bottom
  const range = (maxVal.value - minVal.value) || 1
  const percent = (val - minVal.value) / range
  return height.value - padding.value.bottom - percent * chartHeight
}

// Grid lines generator with intervals
const yGridLines = computed(() => {
  const steps = props.ySteps || 4
  const lines = []
  const stepSize = (maxVal.value - minVal.value) / steps
  for (let i = 0; i <= steps; i++) {
    lines.push(minVal.value + stepSize * i)
  }
  return lines
})

const renderYLabel = (val: number) => {
  if (props.yFormatter) {
    return props.yFormatter(val)
  }
  const prefix = props.yPrefix !== undefined ? props.yPrefix : 'Rp '
  const suffix = props.ySuffix || ''
  return `${prefix}${formatYLabel(val)}${suffix}`
}

const renderTooltipValue = (val: any, item?: any) => {
  if (props.valueFormatter) {
    return props.valueFormatter(val, item)
  }
  if (props.yPrefix === '') {
    return String(val)
  }
  return formatIDR(val)
}

const renderTooltipTitle = (item: any) => {
  if (props.tooltipTitleFormatter) {
    return props.tooltipTitleFormatter(item)
  }
  return item?.[props.index] ?? ''
}

const formatYLabel = (val: number) => {
  if (val >= 1_000_000_000) {
    const formatted = (val / 1_000_000_000).toFixed(val % 1_000_000_000 === 0 ? 0 : 1)
    return `${formatted}B`
  }
  if (val >= 1_000_000) {
    const formatted = (val / 1_000_000).toFixed(val % 1_000_000 === 0 ? 0 : 1)
    return `${formatted}M`
  }
  if (val >= 1_000) {
    return `${Math.round(val / 1_000)}k`
  }
  return Math.round(val).toString()
}

const formatXLabel = (val: string, idx: number) => {
  if (!val) return ''
  const total = props.data.length
  const chartWidth = width.value - padding.value.left - padding.value.right
  const step = chartWidth / Math.max(total - 1, 1)

  // 1. If custom xFormatter is supplied, use it
  let formatted = props.xFormatter ? props.xFormatter(val, idx, total) : val

  // 2. Mobile formatting fallback if no custom formatter
  if (isMobile.value && props.mobileXLabelFormat && !props.xFormatter) {
    const d = dayjs(val)
    if (d.isValid()) {
      formatted = d.format(props.mobileXLabelFormat)
    }
  }

  // 3. Smart collision avoidance:
  // If step width is cramped (< 46px), only show alternate labels to avoid text overlapping
  if (step < 46 && idx % 2 !== 0 && idx !== total - 1) {
    return ''
  }
  if (step < 28 && idx % 3 !== 0 && idx !== total - 1) {
    return ''
  }

  return formatted
}

// Calculate Bezier Curve control points for smooth path
const points = computed(() => {
  return props.data.map((item, idx) => ({
    x: xScale(idx),
    y: yScale(Number(item[categoryKey.value]))
  }))
})

const hoveredPoint = computed(() => {
  if (hoveredIndex.value === null) return null
  return points.value[hoveredIndex.value] || null
})

const hoveredData = computed(() => {
  if (hoveredIndex.value === null) return null
  return props.data[hoveredIndex.value] || null
})

const strokePath = computed(() => {
  const pts = points.value
  if (pts.length === 0) return ''

  const p0 = pts[0]!
  if (pts.length === 1) {
    return `M ${p0.x - 24} ${p0.y} L ${p0.x + 24} ${p0.y}`
  }

  let d = `M ${p0.x} ${p0.y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const pCurrent = pts[i]!
    const pNext = pts[i + 1]!
    const cpX1 = pCurrent.x + (pNext.x - pCurrent.x) / 3
    const cpY1 = pCurrent.y
    const cpX2 = pCurrent.x + 2 * (pNext.x - pCurrent.x) / 3
    const cpY2 = pNext.y
    d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pNext.x} ${pNext.y}`
  }
  return d
})

const areaPath = computed(() => {
  const pts = points.value
  if (pts.length === 0) return ''
  const baselineY = height.value - padding.value.bottom
  const pStart = pts[0]!
  if (pts.length === 1) {
    return `M ${pStart.x - 24} ${pStart.y} L ${pStart.x + 24} ${pStart.y} L ${pStart.x + 24} ${baselineY} L ${pStart.x - 24} ${baselineY} Z`
  }
  const sPath = strokePath.value
  const pEnd = pts[pts.length - 1]!
  return `${sPath} L ${pEnd.x} ${baselineY} L ${pStart.x} ${baselineY} Z`
})

// Computed tooltip position style with overflow boundaries safety
const tooltipStyle = computed(() => {
  if (!hoveredPoint.value) return {}
  const x = hoveredPoint.value.x
  const y = hoveredPoint.value.y

  let left = x - 70
  if (x < 85) {
    left = x + 15
  } else if (x > width.value - 95) {
    left = x - 155
  }

  return {
    left: `${left}px`,
    top: `${y - 85}px`
  }
})

// Hover interactions computed globally on the container element coordinates
const handleMouseMove = (event: MouseEvent) => {
  if (!containerRef.value || points.value.length === 0) return
  const rect = containerRef.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left

  let closestIdx = 0
  let minDiff = Infinity

  points.value.forEach((pt, idx) => {
    const diff = Math.abs(pt.x - mouseX)
    if (diff < minDiff) {
      minDiff = diff
      closestIdx = idx
    }
  })

  // Highlight index if mouse is within active grid columns bounds
  if (mouseX >= padding.value.left - 15 && mouseX <= width.value - padding.value.right + 15) {
    hoveredIndex.value = closestIdx
  } else {
    hoveredIndex.value = null
  }
}

const clearHovered = () => {
  hoveredIndex.value = null
}

// Handle resize listener
const handleResize = () => {
  if (containerRef.value) {
    width.value = containerRef.value.clientWidth
    height.value = containerRef.value.clientHeight
  }
  if (import.meta.client) {
    isMobile.value = window.innerWidth < 640 || width.value < 540
  }
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)

  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      handleResize()
    })
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

<style scoped>
@keyframes tooltip-zoom-in {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(4px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-tooltip-in {
  animation: tooltip-zoom-in 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
