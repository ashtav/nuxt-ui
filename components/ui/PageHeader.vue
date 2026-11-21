<template>
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <!-- Left side: Icon, Title & Subtitle -->
    <div>
      <h1 class="text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
        <span v-if="icon" class="hidden md:inline-flex items-center shrink-0">
          <Icon :name="`hgi-${icon}`" />
        </span>
        <slot name="title">
          <span class="font-semibold">
            {{ title }}
          </span>
        </slot>
      </h1>
      <p v-if="subtitle" class="text-sm text-slate-500 dark:text-slate-400 mt-1">
        <slot name="subtitle">
          {{ subtitle }}
        </slot>
      </p>
    </div>

    <!-- Right side: Actions (FAB items hidden on mobile, shown via teleported FAB) -->
    <div class="flex items-center gap-3">
      <slot name="actions">
        <template v-for="(action, index) in actions" :key="index">
          <template v-if="action.show !== false">
            <!-- Dropdown Menu Action (if children exist) -->
            <UiDropdownMenu v-if="action.children && action.children.length > 0" :options="action.children"
              align="right" width="w-48" v-slot="{ open }">
              <button type="button" :disabled="action.disabled || action.loading" :class="[
                'h-9 rounded-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2',
                getPaddingClasses(action),
                getVariantClasses(action.variant),
                action.class || ''
              ]">
                <svg v-if="action.loading" class="animate-spin h-3.5 w-3.5 text-current flex-shrink-0" fill="none"
                  viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <Icon v-else-if="action.icon" :name="action.icon"
                  :class="['flex-shrink-0', action.variant === 'secondary' ? 'text-slate-500 dark:text-slate-455' : '']" />
                <span :class="[getLabelClasses(action), 'truncate max-w-[120px] py-1']">{{ action.label }}</span>
                <span v-if="action.badge !== undefined && Number(action.badge) > 0"
                  class="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-extrabold text-white animate-pulse flex-shrink-0">
                  {{ action.badge }}
                </span>
                <Icon name="arrow-down-01" class="text-xs transition-transform duration-200 shrink-0"
                  :class="open ? 'rotate-180' : ''" />
              </button>
            </UiDropdownMenu>

            <!-- Standard Single Button Action -->
            <!-- fab=true: hidden on mobile (rendered as FAB via Teleport), shown on md+ -->
            <button v-else type="button" :disabled="action.disabled || action.loading" @click="action.onClick" :class="[
              'h-9 rounded-lg transition-all items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2',
              action.fab ? 'hidden md:flex' : 'flex',
              getPaddingClasses(action),
              getVariantClasses(action.variant),
              action.class || ''
            ]">
              <svg v-if="action.loading" class="animate-spin h-3.5 w-3.5 text-current flex-shrink-0" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <Icon v-else-if="action.icon" :name="action.icon"
                :class="['flex-shrink-0', action.variant === 'secondary' ? 'text-slate-500 dark:text-slate-455' : '']" />
              <span :class="[getLabelClasses(action), 'truncate max-w-[120px] py-1']">{{ action.label }}</span>
              <span v-if="action.badge !== undefined && Number(action.badge) > 0"
                class="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-extrabold text-white animate-pulse flex-shrink-0">
                {{ action.badge }}
              </span>
            </button>
          </template>
        </template>
      </slot>
    </div>
  </div>

  <!-- FAB: Teleported to body, fixed bottom-right, mobile only (hidden md+) -->
  <Teleport to="body" v-if="isMounted">
    <template v-for="(action, index) in fabActions" :key="`fab-${index}`">
      <button v-if="action.show !== false" type="button" :disabled="action.disabled || action.loading"
        @click="action.onClick" :title="action.label" :class="[
          'md:hidden fixed right-5 z-30 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2',
          action.safeArea ? 'bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))]' : 'bottom-6',
          getVariantClasses(action.variant),
          action.class || ''
        ]">
        <svg v-if="action.loading" class="animate-spin h-5 w-5 text-current flex-shrink-0" fill="none"
          viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <Icon v-else-if="action.icon" :name="action.icon" class="text-xl flex-shrink-0" />
      </button>
    </template>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { PropType } from 'vue'

const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})

export interface HeaderAction {
  label: string
  icon?: string
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success'
  class?: string
  onClick?: (event?: MouseEvent) => void
  show?: boolean
  disabled?: boolean
  loading?: boolean
  badge?: number | string
  iconOnly?: boolean
  responsive?: boolean
  children?: any[]
  fab?: boolean
  safeArea?: boolean
}

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  actions: {
    type: Array as PropType<HeaderAction[]>,
    default: () => []
  }
})

const fabActions = computed(() => props.actions.filter(a => a.fab && a.show !== false))

const getPaddingClasses = (action: HeaderAction) => {
  const hasIcon = action.icon || action.loading
  if (!hasIcon) return 'px-4'
  if (action.iconOnly) return 'px-2.5'
  if (action.responsive === true) return 'px-2.5 md:px-4'
  return 'px-4'
}

const getLabelClasses = (action: HeaderAction) => {
  if (action.iconOnly) return 'hidden'
  if (action.responsive === true && (action.icon || action.loading)) return 'hidden md:inline-block'
  return 'inline-block'
}

const getVariantClasses = (variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success') => {
  const styles: Record<string, string> = {
    primary: 'bg-theme-primary hover:bg-theme-primary-hover focus:ring-theme-primary text-white shadow-sm',
    secondary: 'bg-white hover:bg-slate-50 dark:bg-theme-card dark:hover:bg-theme-hover border border-slate-200 dark:border-theme-border text-slate-700 dark:text-slate-200 shadow-sm',
    danger: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 focus:ring-red-500 text-white shadow-sm',
    warning: 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600 focus:ring-amber-500 text-white shadow-sm',
    success: 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 focus:ring-emerald-500 text-white shadow-sm'
  }
  return styles[variant || 'primary'] || styles.primary
}
</script>
