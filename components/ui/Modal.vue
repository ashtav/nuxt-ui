<template>
  <Teleport to="body" :disabled="!isMounted">
    <!-- Backdrop (separate Transition so it fades independently) -->
    <Transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition ease-in duration-300" leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div v-if="open" class="fixed inset-0" :style="{ backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: backdropZIndex }"
        @click="handleBackdropClick" @wheel.prevent @touchmove.prevent />
    </Transition>

    <!-- Panel container: always in DOM so its child Transition can animate freely -->
    <div class="fixed inset-0 pointer-events-none"
      :class="[wrapperPositionClasses, expandable ? 'transition-all duration-300 ease-in-out' : '']"
      :style="{ zIndex: panelZIndex }">
      <Transition appear :enter-active-class="panelTransition.enterActive" :enter-from-class="panelTransition.enterFrom"
        :enter-to-class="panelTransition.enterTo" :leave-active-class="panelTransition.leaveActive"
        :leave-from-class="panelTransition.leaveFrom" :leave-to-class="panelTransition.leaveTo"
        @after-leave="handleAfterLeave">
        <div v-if="open" ref="panelRef" role="dialog" aria-modal="true" :aria-labelledby="title ? titleId : undefined"
          :aria-describedby="description ? descId : undefined"
          class="pointer-events-auto relative z-10 w-full bg-white dark:bg-theme-card border border-theme-border shadow-xl flex flex-col overflow-hidden overscroll-contain"
          :class="[panelClasses, sizeClasses, expandable ? 'transition-all duration-300 ease-in-out' : '']"
          v-bind="$attrs">
          <!-- Base Content Layer (Cupertino depth: steps back to the left and dims when stack layer is active) -->
          <div class="flex-1 flex flex-col min-h-0 w-full transition-all duration-300 ease-out origin-left" :class="{
            '-translate-x-8 scale-[0.98] opacity-50 pointer-events-none filter brightness-90 transform': !!$slots.stack
          }">
            <!-- Header (Symmetrical Title, Actions, and Controls) -->
            <div v-if="title || description || $slots.header || showCloseButton || visibleActions.length"
              class="flex items-start justify-between gap-4 px-4 sm:px-6 pt-5 sm:pt-6 pb-2 shrink-0">
              <!-- Left: Title & Description (or custom #header slot) -->
              <div v-if="title || description || $slots.header" class="flex flex-col gap-1 flex-1 min-w-0">
                <slot name="header">
                  <h2 v-if="title" :id="titleId"
                    class="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate leading-7">
                    {{ title }}
                  </h2>
                  <p v-if="description" :id="descId" class="text-sm text-gray-500 dark:text-gray-400">
                    {{ description }}
                  </p>
                </slot>
              </div>
              <div v-else class="flex-1" />

              <!-- Right: Actions, Expand & Close buttons -->
              <div v-if="visibleActions.length || expandable || showCloseButton"
                class="flex items-center gap-2 shrink-0">
                <!-- Actions -->
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
                          : action.variant === 'danger'
                            ? 'w-7 rounded-md text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer'
                            : 'w-7 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-theme-hover cursor-pointer'
                    ]">
                    <Icon v-if="action.icon" :name="action.icon" />
                    <span v-if="action.label" class="leading-none text-xs">{{ action.label }}</span>
                  </button>
                </UiTooltip>

                <!-- Expand/Collapse button -->
                <UiTooltip v-if="expandable" :content="isExpanded ? 'Minimize' : 'Maximize'" position="top">
                  <button type="button" @click="toggleExpand"
                    class="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:text-gray-650 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-theme-hover transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <Icon :name="isExpanded ? 'minimize-screen' : 'maximize-screen'" />
                  </button>
                </UiTooltip>

                <!-- Close button -->
                <button v-if="showCloseButton" type="button" @click="close"
                  class="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:text-gray-650 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-theme-hover transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <Icon name="cancel-01" />
                </button>
              </div>
            </div>

            <!-- Tabs (Sticky & Full-width) -->
            <div v-if="tabs && tabs.length > 0" ref="tabsContainerRef" @wheel="handleTabsWheel"
              class="flex border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-theme-card sticky top-0 z-10 shrink-0 overflow-x-auto overflow-y-hidden scrollbar-none">
              <button v-for="(tab, index) in tabs" :key="tab.id" type="button" :disabled="tab.disabled"
                class="py-3 text-xs transition-all relative shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-gray-400"
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
                <span class="absolute bottom-0 inset-x-0 h-0.5 transition-all duration-200 z-10 rounded-t-sm"
                  :class="activeTab === tab.id ? 'bg-emerald-500 dark:bg-emerald-400 opacity-100' : 'bg-transparent opacity-0 pointer-events-none'" />
              </button>
            </div>

            <!-- Body -->
            <div ref="bodyRef" :class="bodyClass || 'px-4 sm:px-6 py-4 overflow-y-auto flex-1 min-h-0 overscroll-contain'">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" :class="footerClass || 'flex items-center justify-end gap-2 px-4 sm:px-6 py-4 shrink-0'">
              <slot name="footer" />
            </div>
          </div>

          <!-- Stacked Layer (Slide-in Cupertino sheet over base content) -->
          <Transition enter-active-class="transition-all ease-out duration-300 transform"
            enter-from-class="translate-x-full opacity-0 shadow-2xl"
            enter-to-class="translate-x-0 opacity-100 shadow-2xl"
            leave-active-class="transition-all ease-in duration-200 transform"
            leave-from-class="translate-x-0 opacity-100 shadow-2xl"
            leave-to-class="translate-x-full opacity-0 shadow-2xl">
            <div v-if="$slots.stack"
              class="absolute inset-0 z-30 bg-white dark:bg-theme-card flex flex-col overflow-hidden shadow-2xl border-l border-theme-border rounded-l-xl">
              <slot name="stack" />
            </div>
          </Transition>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, useSlots, watch } from 'vue'
import UiTooltip from './Tooltip.vue'

defineOptions({
  inheritAttrs: false
})

const slots = useSlots()

const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})

export interface ModalAction {
  icon?: string
  tooltip?: string
  label?: string
  variant?: 'primary' | 'secondary' | 'danger'
  onclick?: (event: MouseEvent) => void
  onClick?: (event: MouseEvent) => void
  disabled?: boolean
  show?: boolean
}

export interface ModalTab {
  id: string
  label: string
  icon?: string
  badge?: boolean
  count?: number | string
  disabled?: boolean
}

interface Props {
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** Click on the backdrop to close the modal */
  closeOnBackdrop?: boolean
  /** Press the Esc key to close the modal */
  closeOnEsc?: boolean
  showCloseButton?: boolean
  variant?: 'center' | 'right'
  actions?: ModalAction[]
  tabs?: ModalTab[]
  backdropZIndex?: number
  panelZIndex?: number
  fullscreenOnMobile?: boolean
  expandable?: boolean
  bodyClass?: string
  footerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  size: 'md',
  closeOnBackdrop: true,
  closeOnEsc: true,
  showCloseButton: true,
  variant: 'center',
  actions: () => [],
  tabs: () => [],
  backdropZIndex: 200,
  panelZIndex: 210,
  fullscreenOnMobile: true,
  expandable: false
})

const emit = defineEmits<{
  (e: 'close', payload?: { preventDefault: () => void }): void
  (e: 'close-stack'): void
}>()

// v-model:open
const open = defineModel<boolean>('open', { default: false })

// v-model:activeTab
const activeTab = defineModel<string>('activeTab', { default: '' })

const tabsContainerRef = ref<HTMLDivElement | null>(null)
const bodyRef = ref<HTMLDivElement | null>(null)

function scrollToTop(behavior: ScrollBehavior = 'smooth') {
  if (bodyRef.value) {
    bodyRef.value.scrollTo({ top: 0, behavior })
  }
}

function handleTabClick(tabId: string, event: MouseEvent) {
  const isAlreadyActive = activeTab.value === tabId
  activeTab.value = tabId

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

const visibleActions = computed(() => {
  return props.actions.filter(action => action.show !== false)
})

const panelRef = ref<HTMLDivElement | null>(null)
const titleId = useId()
const descId = useId()

const isExpanded = ref(false)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}


const wrapperPositionClasses = computed(() => {
  if (props.variant === 'right') {
    return 'flex justify-end'
  }
  if (isExpanded.value) {
    return 'flex items-center justify-center p-0'
  }
  if (!props.fullscreenOnMobile) {
    return 'flex items-center justify-center p-4'
  }
  return 'flex items-center justify-center p-0 sm:p-4'
})

const panelClasses = computed(() => {
  if (props.variant === 'right') {
    const borderClass = isExpanded.value
      ? 'border-0'
      : props.fullscreenOnMobile
        ? 'border-0 sm:border-l border-y-0 border-r-0 border-slate-200 dark:border-theme-border'
        : 'border-l border-y-0 border-r-0 border-slate-200 dark:border-theme-border'
    return `h-full max-h-dvh sm:max-h-screen rounded-none ${borderClass}`
  }
  if (isExpanded.value) {
    return 'h-full max-h-screen rounded-none border-0'
  }
  if (!props.fullscreenOnMobile) {
    return `${props.expandable ? 'h-full' : 'h-auto'} max-h-[85vh] rounded-xl border border-slate-200 dark:border-theme-border`
  }
  return `h-full ${props.expandable ? 'sm:h-full' : 'sm:h-auto'} max-h-dvh sm:max-h-[85vh] rounded-none sm:rounded-xl border-0 sm:border border-slate-200 dark:border-theme-border`
})

const panelTransition = computed(() => {
  if (props.variant === 'right') {
    return {
      enterActive: 'transform transition ease-out duration-300',
      enterFrom: 'translate-x-full',
      enterTo: 'translate-x-0',
      leaveActive: 'transform transition ease-in duration-300',
      leaveFrom: 'translate-x-0',
      leaveTo: 'translate-x-full'
    }
  }
  return {
    enterActive: 'transition ease-out duration-150',
    enterFrom: 'opacity-0 scale-95',
    enterTo: 'opacity-100 scale-100',
    leaveActive: 'transition ease-in duration-150',
    leaveFrom: 'opacity-100 scale-100',
    leaveTo: 'opacity-0 scale-95'
  }
})

const sizeClasses = computed(() => {
  if (isExpanded.value) {
    return 'max-w-[100vw] rounded-none'
  }
  const sizeMap: Record<NonNullable<Props['size']>, string> = {
    sm: props.fullscreenOnMobile ? 'max-w-none sm:max-w-sm' : 'max-w-sm',
    lg: props.fullscreenOnMobile ? 'max-w-none sm:max-w-2xl' : 'max-w-2xl',
    xl: props.fullscreenOnMobile ? 'max-w-none sm:max-w-4xl' : 'max-w-4xl',
    full: props.fullscreenOnMobile ? 'max-w-none sm:max-w-[95vw]' : 'max-w-[95vw]',
    md: props.fullscreenOnMobile ? 'max-w-none sm:max-w-md' : 'max-w-md'
  }
  return sizeMap[props.size || 'md'] || sizeMap.md
})

const close = () => {
  let defaultPrevented = false
  const eventPayload = {
    preventDefault: () => {
      defaultPrevented = true
    }
  }
  emit('close', eventPayload)
  if (!defaultPrevented) {
    open.value = false
  }
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    if (slots.stack) {
      emit('close-stack')
      return
    }
    close()
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && open.value && props.closeOnEsc) {
    if (slots.stack) {
      event.stopPropagation()
      emit('close-stack')
      return
    }
    close()
  }
}
const getActiveModalsCount = () => {
  if (typeof window === 'undefined') return 0
  if ((window as any).__activeModalsCount === undefined) {
    (window as any).__activeModalsCount = 0
  }
  return (window as any).__activeModalsCount
}

const incrementActiveModals = () => {
  if (typeof window !== 'undefined') {
    (window as any).__activeModalsCount = getActiveModalsCount() + 1
  }
}

const decrementActiveModals = () => {
  if (typeof window !== 'undefined') {
    (window as any).__activeModalsCount = Math.max(0, getActiveModalsCount() - 1)
  }
}

const lockScroll = () => {
  if (typeof window === 'undefined') return
  const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft || 0
  ;(window as any).__modalSavedScrollX = scrollX
  ;(window as any).__modalSavedScrollY = scrollY
  document.documentElement.style.setProperty('--locked-scroll-top', `-${scrollY}px`)
  document.documentElement.classList.add('modal-open')
}

const unlockScroll = () => {
  if (typeof window === 'undefined') return
  document.documentElement.classList.remove('modal-open')
  document.documentElement.style.removeProperty('--locked-scroll-top')
  const scrollX = (window as any).__modalSavedScrollX ?? 0
  const scrollY = (window as any).__modalSavedScrollY ?? 0
  window.scrollTo(scrollX, scrollY)
}

// Freeze body scroll while the modal is open without hiding scrollbar or breaking sticky elements, and manage Esc key listener
watch(
  open,
  (isOpen, oldVal) => {
    if (typeof document === 'undefined') return

    if (isOpen) {
      isExpanded.value = false
      document.addEventListener('keydown', handleKeydown)

      const activeCount = getActiveModalsCount()
      if (activeCount === 0) {
        lockScroll()
      }
      incrementActiveModals()

      nextTick(() => panelRef.value?.focus())
    } else if (oldVal) {
      document.removeEventListener('keydown', handleKeydown)
      // unlockScroll is deferred to handleAfterLeave so page scrollbar doesn't pop in while modal is animating out
    }
  }
)

const handleAfterLeave = () => {
  if (!open.value) {
    decrementActiveModals()
    if (getActiveModalsCount() === 0) {
      unlockScroll()
    }
  }
}

onMounted(() => {
  if (open.value && typeof document !== 'undefined') {
    isExpanded.value = false
    document.addEventListener('keydown', handleKeydown)
    const activeCount = getActiveModalsCount()
    if (activeCount === 0) {
      lockScroll()
    }
    incrementActiveModals()
  }
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('keydown', handleKeydown)
  }
  if (open.value) {
    decrementActiveModals()
    if (getActiveModalsCount() === 0) {
      unlockScroll()
    }
  }
})

defineExpose({
  bodyRef,
  scrollToTop
})
</script>