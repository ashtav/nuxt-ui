<template>
  <div class="relative flex flex-col h-full bg-white dark:bg-theme-card min-h-0">
    <!-- Header Actions (if any) -->
    <div v-if="visibleActions.length" class="absolute top-4 flex items-center gap-2 z-10"
      :style="{ right: actionsRight }">
      <UiTooltip v-for="(action, index) in visibleActions" :key="index"
        :content="action.tooltip || (!action.label ? action.label : undefined)" position="top">
        <button type="button" :disabled="action.disabled"
          @click="action.onclick ? action.onclick($event) : (action.onClick ? action.onClick($event) : undefined)"
          class="inline-flex h-7 items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          :class="[
            action.variant === 'primary'
              ? 'px-3 gap-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs active:bg-emerald-800'
              : action.label
                ? 'px-2.5 gap-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-theme-input dark:hover:bg-theme-hover dark:text-slate-200 border border-slate-200/80 dark:border-theme-border cursor-pointer'
                : 'w-7 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-theme-hover cursor-pointer'
          ]">
          <Icon v-if="action.icon" :name="action.icon" />
          <span v-if="action.label" class="leading-none text-xs">{{ action.label }}</span>
        </button>
      </UiTooltip>
    </div>

    <!-- Close Button -->
    <div v-if="showCloseButton" class="absolute top-4 right-4 flex items-center gap-2 z-10">
      <button type="button" @click="emit('close')"
        class="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:text-gray-650 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-theme-hover transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        title="Close">
        <Icon name="cancel-01" />
      </button>
    </div>

    <!-- Header -->
    <div v-if="title || description || $slots.header" class="flex flex-col gap-1.5 px-4 sm:px-6 pt-6 pb-2 shrink-0 pr-14">
      <slot name="header">
        <h2 v-if="title" class="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
          {{ title }}
        </h2>
        <p v-if="description" class="text-sm text-gray-500 dark:text-gray-400 truncate">
          {{ description }}
        </p>
      </slot>
    </div>

    <!-- Sticky Tabs Bar -->
    <div v-if="tabs && tabs.length > 0"
      ref="tabsContainerRef"
      @wheel="handleTabsWheel"
      class="flex border-b border-theme-border bg-white dark:bg-theme-card sticky top-0 z-10 shrink-0 overflow-x-auto overflow-y-hidden scrollbar-none">
      <button v-for="(tab, index) in tabs" :key="tab.id" type="button"
        :disabled="tab.disabled"
        class="py-3 text-xs transition-all relative shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-gray-400 cursor-pointer"
        :class="[
          index === 0 ? 'pl-4 sm:pl-6 pr-4 sm:pr-5' : 'px-4 sm:px-5',
          activeTab === tab.id
            ? 'text-emerald-600 dark:text-emerald-400 font-bold'
            : 'text-gray-400 hover:text-gray-650 dark:hover:text-gray-300'
        ]" @click="!tab.disabled && handleTabClick(tab.id, $event)">
        <span class="flex items-center gap-1.5">
          <Icon v-if="tab.icon" :name="tab.icon" class="text-[14px]" />
          <span class="font-semibold">{{ tab.label }}</span>
          <span v-if="tab.count !== undefined && tab.count !== null"
            class="px-1.5 py-0.5 rounded-full text-[10px] font-bold transition-colors" :class="activeTab === tab.id
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'">
            {{ tab.count }}
          </span>
        </span>
        <!-- Red circle badge with wave animation -->
        <span v-if="tab.badge" class="absolute top-2.5 right-2 flex h-2.5 w-2.5">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
        </span>
        <!-- Active Indicator Bar: strictly at bottom-0 within button bounds so it never submerges -->
        <span
          class="absolute bottom-0 inset-x-0 h-0.5 transition-all duration-200 z-10 rounded-t-sm"
          :class="activeTab === tab.id ? 'bg-emerald-500 dark:bg-emerald-400 opacity-100' : 'bg-transparent opacity-0 pointer-events-none'"
        />
      </button>
    </div>

    <!-- Body / Content -->
    <div ref="bodyRef" :class="bodyClasses">
      <slot />
    </div>

    <!-- Optional Footer -->
    <div v-if="$slots.footer" class="flex items-center justify-end gap-3 px-4 sm:px-6 py-3 shrink-0 border-t border-theme-border bg-white dark:bg-theme-card">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ModalAction, ModalTab } from './Modal.vue'

interface Props {
  title?: string
  description?: string
  actions?: ModalAction[]
  tabs?: ModalTab[]
  activeTab?: string
  showCloseButton?: boolean
  bodyClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  actions: () => [],
  tabs: () => [],
  activeTab: '',
  showCloseButton: true,
  bodyClass: ''
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:activeTab', tabId: string): void
  (e: 'tab-click', tabId: string, event: MouseEvent): void
}>()

const tabsContainerRef = ref<HTMLDivElement | null>(null)
const bodyRef = ref<HTMLDivElement | null>(null)

function scrollToTop(behavior: ScrollBehavior = 'smooth') {
  if (bodyRef.value) {
    bodyRef.value.scrollTo({ top: 0, behavior })
  }
}

const visibleActions = computed(() => {
  return props.actions.filter(action => action.show !== false)
})

const actionsRight = computed(() => {
  return props.showCloseButton ? '3rem' : '1.5rem'
})

const bodyClasses = computed(() => {
  if (props.bodyClass) {
    return props.bodyClass
  }
  return 'px-4 sm:px-6 py-4 overflow-y-auto flex-1 min-h-0 overscroll-contain space-y-5 pb-12 text-slate-800 dark:text-slate-200'
})

function handleTabClick(tabId: string, event: MouseEvent) {
  const isAlreadyActive = props.activeTab === tabId
  emit('update:activeTab', tabId)
  emit('tab-click', tabId, event)

  if (bodyRef.value) {
    if (isAlreadyActive) {
      bodyRef.value.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      bodyRef.value.scrollTo({ top: 0, behavior: 'instant' })
    }
  }

  const target = event.currentTarget as HTMLElement
  const container = tabsContainerRef.value || target?.parentElement
  if (target && container) {
    const scrollLeft = target.offsetLeft - (container.clientWidth / 2) + (target.offsetWidth / 2)
    container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
  }
}

function handleTabsWheel(e: WheelEvent) {
  const container = tabsContainerRef.value
  if (!container || container.scrollWidth <= container.clientWidth) return
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    container.scrollLeft += e.deltaY
    e.preventDefault()
  }
}

defineExpose({
  bodyRef,
  scrollToTop
})
</script>
