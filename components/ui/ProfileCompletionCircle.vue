<template>
  <div class="relative inline-block" ref="containerRef">
    <!-- Circle Button Trigger -->
    <button
      @click="isOpen = !isOpen"
      type="button"
      class="group relative flex items-center gap-3 p-1.5 pr-3 rounded-full transition-all duration-300 hover:shadow-md cursor-pointer border select-none"
      :class="wrapperClasses"
      title="Profile Completeness"
    >
      <!-- Circular Progress Ring -->
      <div class="relative flex items-center justify-center w-10 h-10 shrink-0">
        <svg class="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
          <!-- Background Ring -->
          <path
            class="text-slate-200 dark:text-slate-800"
            stroke-width="3.5"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <!-- Progress Stroke -->
          <path
            :class="strokeColorClass"
            class="transition-all duration-700 ease-out"
            stroke-dasharray="100, 100"
            :stroke-dashoffset="100 - percentage"
            stroke-width="3.5"
            stroke-linecap="round"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>

        <!-- Percentage Label in Center -->
        <span class="absolute text-[11px] font-semibold tracking-tight" :class="textColorClass">
          {{ percentage }}%
        </span>

        <!-- Attention Pulse for Incomplete Profile (< 85%) -->
        <span
          v-if="percentage < 85"
          class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-ping"
          :class="badgeColorClass"
        ></span>
        <span
          v-if="percentage < 85"
          class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
          :class="badgeColorClass"
        ></span>
      </div>

      <!-- Label text for desktop/large view -->
      <div class="hidden sm:flex flex-col text-left">
        <span class="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Profile Completeness
        </span>
        <span class="text-xs font-semibold truncate max-w-[130px]" :class="textColorClass">
          {{ completion.status_label }}
        </span>
      </div>

      <Icon name="arrow-down-01" class="text-xs text-slate-400 group-hover:translate-y-0.5 transition-transform" />
    </button>

    <!-- Interactive Popover Dropdown -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-80 sm:w-96 p-4 rounded-2xl bg-white dark:bg-theme-card border border-theme-border shadow-2xl z-50 animate-fade-in-up"
    >
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-theme-border">
        <div class="flex items-center gap-2.5">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs text-white"
            :class="percentage >= 85 ? 'bg-emerald-500' : (percentage >= 50 ? 'bg-amber-500' : 'bg-orange-500')"
          >
            {{ percentage }}%
          </div>
          <div>
            <h4 class="text-xs font-semibold text-slate-900 dark:text-white leading-none">
              Student Profile Status
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-normal">
              {{ percentage >= 85 ? '🎉 Profile is complete and ready!' : 'Complete your details to help tutors prepare.' }}
            </p>
          </div>
        </div>
        <button
          @click="isOpen = false"
          class="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <Icon name="cancel-01" class="text-xs" />
        </button>
      </div>

      <!-- Checklist Items -->
      <div class="py-3 space-y-2">
        <div
          v-for="item in completion.checklist"
          :key="item.id"
          class="flex items-center justify-between p-2.5 rounded-xl border transition-colors"
          :class="item.completed ? 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800/40 opacity-70' : 'bg-orange-50/30 dark:bg-orange-950/10 border-orange-200/50 dark:border-orange-900/30'"
        >
          <div class="flex items-start gap-2.5 min-w-0 pr-2">
            <div
              class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              :class="item.completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'"
            >
              <Icon :name="item.completed ? 'checkmark-circle-02' : 'clock-01'" class="text-xs" />
            </div>
            <div class="min-w-0">
              <p class="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" :class="{ 'line-through': item.completed }">
                {{ item.title }} <span class="text-[10px] text-slate-400 font-normal">(+{{ item.weight }}%)</span>
              </p>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 font-normal">
                {{ item.desc }}
              </p>
            </div>
          </div>

          <NuxtLink
            v-if="!item.completed"
            :to="item.action_route"
            @click="isOpen = false"
            class="shrink-0 px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition shadow-sm"
          >
            {{ item.action_label || 'Complete' }}
          </NuxtLink>
        </div>
      </div>

      <!-- Footer CTA -->
      <div class="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center text-[11px]">
        <span class="text-slate-400 font-normal">
          {{ completion.missing_count }} items remaining
        </span>
        <NuxtLink
          to="/profile"
          @click="isOpen = false"
          class="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          View in Profile <Icon name="arrow-right-01" class="text-xs" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useProfileCompletion } from '~/composables/useProfileCompletion'

const { completion, fetchCompletion } = useProfileCompletion()
const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

onMounted(() => {
  fetchCompletion()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

const percentage = computed(() => completion.value?.percentage ?? 40)

const strokeColorClass = computed(() => {
  if (percentage.value >= 100) return 'text-emerald-500'
  if (percentage.value >= 70) return 'text-amber-500'
  return 'text-orange-500'
})

const textColorClass = computed(() => {
  if (percentage.value >= 100) return 'text-emerald-600 dark:text-emerald-400'
  if (percentage.value >= 70) return 'text-amber-600 dark:text-amber-400'
  return 'text-orange-600 dark:text-orange-400'
})

const badgeColorClass = computed(() => {
  if (percentage.value >= 70) return 'bg-amber-500'
  return 'bg-orange-500'
})

const wrapperClasses = computed(() => {
  if (percentage.value >= 100) {
    return 'bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-900/40'
  }
  if (percentage.value >= 70) {
    return 'bg-amber-50/50 hover:bg-amber-50 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 border-amber-200/60 dark:border-amber-900/40'
  }
  return 'bg-orange-50/60 hover:bg-orange-50 dark:bg-orange-950/20 dark:hover:bg-orange-950/40 border-orange-200/70 dark:border-orange-900/40'
})
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
