<template>
  <span class="tabular-nums">{{ displayValue }}</span>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

// ── Props ─────────────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  /** Target numeric value to animate toward */
  value: number
  /** Duration of the animation in milliseconds */
  duration?: number
  /** Optional formatter function applied to the intermediate numeric value */
  formatter?: (val: number) => string
}>(), {
  duration: 900,
  formatter: (val: number) => String(Math.round(val))
})

// ── State ─────────────────────────────────────────────────────────────────────
const displayValue = ref(props.formatter(0))
let animationFrame: number | null = null
let startTime: number | null = null
let startValue = 0
let targetValue = props.value

// ── Animation ─────────────────────────────────────────────────────────────────
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function animate(timestamp: number) {
  if (!startTime) startTime = timestamp
  const elapsed = timestamp - startTime
  const progress = Math.min(elapsed / props.duration, 1)
  const eased = easeOutExpo(progress)
  const current = startValue + (targetValue - startValue) * eased

  displayValue.value = props.formatter(current)

  if (progress < 1) {
    animationFrame = requestAnimationFrame(animate)
  } else {
    displayValue.value = props.formatter(targetValue)
  }
}

function startAnimation(from: number, to: number) {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
  startTime = null
  startValue = from
  targetValue = to
  animationFrame = requestAnimationFrame(animate)
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  startAnimation(0, props.value)
})

watch(() => props.value, (newVal, oldVal) => {
  const currentNumeric = oldVal ?? 0
  startAnimation(currentNumeric, newVal)
})

onBeforeUnmount(() => {
  if (animationFrame !== null) cancelAnimationFrame(animationFrame)
})
</script>
