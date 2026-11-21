<template>
  <div>
    <!-- Backdrop for Mobile -->
    <div
      v-if="isOpen"
      @click="$emit('close')"
      class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
    />

    <aside
      class="sidebar-root fixed top-0 left-0 z-50 h-screen flex flex-col border-r border-theme-border bg-theme-card"
      :class="[
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        isMinimized ? 'sidebar-minimized' : ''
      ]"
      aria-label="Sidebar"
    >
      <!-- ─── Header ────────────────────────────────────────────── -->
      <div class="h-16 shrink-0 flex items-center px-4 border-b border-theme-border bg-theme-card overflow-hidden">
        <!-- Logo Icon — click to expand when minimized -->
        <div
          class="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-600 text-white font-bold text-lg shadow-sm shrink-0 transition-transform duration-200 hover:scale-105"
          :class="isMinimized ? 'cursor-pointer' : ''"
          @click="isMinimized ? toggleMinimize() : null"
          :title="isMinimized ? 'Expand Sidebar' : ''"
        >
          N
        </div>

        <!-- Brand Name — fades + slides out when minimized -->
        <span class="sidebar-text font-extrabold text-[18px] tracking-tight text-slate-800 dark:text-white">
          Nuxt UI
        </span>

        <!-- Collapse / Expand Toggle — always visible, pushed to the right -->
        <button
          @click="toggleMinimize"
          class="hidden md:flex ml-auto shrink-0 relative items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-theme-hover transition duration-200 cursor-pointer"
          :class="{ 'left-10': isMinimized }"
          :title="isMinimized ? 'Expand Sidebar' : 'Collapse Sidebar'"
        >
          <Icon name="sidebar-left-01" />
        </button>
      </div>

      <!-- ─── Navigation ────────────────────────────────────────── -->
      <nav
        ref="navContainerRef"
        class="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-5 scrollbar-thin pb-24"
      >
        <div v-for="(group, gIdx) in menuGroups" :key="gIdx">
          <!-- Group label -->
          <p
            class="sidebar-group-text mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 select-none whitespace-nowrap"
          >
            {{ group.label }}
          </p>

          <!-- Menu items -->
          <div class="space-y-0.5">
            <template v-for="(menu, mIdx) in group.menus" :key="mIdx">
              <UiTooltip
                :content="(!menu.path || menu.path === '#') ? `${menu.label} (Coming Soon)` : menu.label"
                position="right"
                :disabled="!isMinimized"
                block
                teleport
              >
                <div
                  class="menu-item group relative flex items-center px-2 py-2 rounded-xl text-sm transition-colors duration-200 cursor-pointer"
                  :class="[
                    (!menu.path || menu.path === '#')
                      ? 'menu-disabled cursor-not-allowed opacity-75 dark:opacity-40 select-none'
                      : (currentPath === menu.path ? 'menu-active' : 'menu-inactive')
                  ]"
                  :title="!isMinimized ? ((!menu.path || menu.path === '#') ? `${menu.label} (Coming Soon)` : menu.label) : undefined"
                  @click="handleMenuClick($event, menu)"
                >
                  <!-- Icon -->
                  <div class="shrink-0 flex items-center justify-center w-6 h-6 relative">
                    <Icon :name="menu.icon" class="text-base" />
                  </div>

                  <!-- Label — fades out when minimized -->
                  <span
                    class="sidebar-text flex-1 truncate font-medium text-left"
                    :class="isMinimized ? 'minimize' : ''"
                  >
                    {{ menu.label }}
                  </span>

                  <!-- Lock icon (if path is #) -->
                  <span
                    v-if="(!menu.path || menu.path === '#') && !isMinimized"
                    class="shrink-0 text-slate-400 dark:text-slate-500 ml-auto flex items-center justify-center text-xs"
                  >
                    <Icon name="lock" class="text-xs" />
                  </span>

                  <!-- Active indicator dot -->
                  <span
                    v-else-if="currentPath === menu.path"
                    class="sidebar-dot shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 ml-auto"
                  />
                </div>
              </UiTooltip>
            </template>
          </div>
        </div>
      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export interface MenuItem {
  label: string
  icon: string
  path?: string
}

export interface MenuGroup {
  label: string
  menus: MenuItem[]
}

const props = withDefaults(defineProps<{
  isOpen?: boolean
  currentPath?: string
}>(), {
  isOpen: false,
  currentPath: '#dashboard'
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', path: string): void
}>()

const { isMinimized, toggleMinimize } = useSidebar()
const navContainerRef = ref<HTMLElement | null>(null)

const handleMenuClick = (e: MouseEvent, menu: MenuItem) => {
  e.preventDefault()
  if (!menu.path || menu.path === '#') return

  emit('select', menu.path)
  emit('close')
}

const menuGroups: MenuGroup[] = [
  {
    label: 'Overview',
    menus: [
      { label: 'Dashboard', icon: 'dashboard-square-01', path: '#dashboard' }
    ]
  },
  {
    label: 'Form Components',
    menus: [
      { label: 'FormInput', icon: 'pencil-edit-02', path: '#form-input' },
      { label: 'FormSearch', icon: 'search-01', path: '#form-search' },
      { label: 'FormSelect', icon: 'menu-square', path: '#form-select' },
      { label: 'FormPhoneInput', icon: 'call', path: '#' },
      { label: 'FormDatePicker', icon: 'calendar-03', path: '#' },
      { label: 'FormDateRange', icon: 'calendar-favorite-01', path: '#' },
      { label: 'FormDayScrollPicker', icon: 'calendar-check-in-01', path: '#' },
      { label: 'FormTextarea', icon: 'note', path: '#' },
      { label: 'FormRichTextarea', icon: 'quill-write-02', path: '#' },
      { label: 'FormCheckbox', icon: 'check-square', path: '#' },
      { label: 'FormCheckboxPill', icon: 'checkmark-badge-01', path: '#' },
      { label: 'FormCheckboxSingle', icon: 'tick-01', path: '#' },
      { label: 'FormRadio', icon: 'record', path: '#' },
      { label: 'FormRadioPill', icon: 'tag-01', path: '#' },
      { label: 'FormSwitch', icon: 'toggle-on', path: '#' },
      { label: 'FormSlider', icon: 'sliders-horizontal', path: '#' },
      { label: 'FormNumber', icon: 'calculate', path: '#' },
      { label: 'FormPassword', icon: 'lock-password', path: '#' },
      { label: 'FormFile', icon: 'attachment', path: '#' },
      { label: 'FormAudio', icon: 'mic-01', path: '#' },
      { label: 'FormCombobox', icon: 'filter-mail', path: '#' },
      { label: 'FormChipInput', icon: 'tags', path: '#' },
      { label: 'FormChips', icon: 'tag-02', path: '#' },
      { label: 'FormExportOptions', icon: 'file-export', path: '#' },
      { label: 'FormLocationPicker', icon: 'maps-location-01', path: '#' }
    ]
  },
  {
    label: 'UI Components',
    menus: [
      { label: 'UiModal', icon: 'modal', path: '#' },
      { label: 'UiButton', icon: 'cursor-pointer', path: '#' },
      { label: 'UiTooltip', icon: 'bubble-chat-notification', path: '#' },
      { label: 'UiDropdownMenu', icon: 'menu-02', path: '#' },
      { label: 'UiConfirmDialog', icon: 'alert-02', path: '#' },
      { label: 'UiLoadingOverlay', icon: 'loading-01', path: '#' },
      { label: 'UiAvatar', icon: 'user', path: '#' },
      { label: 'UiToaster', icon: 'toast', path: '#' },
      { label: 'UiActiveFilters', icon: 'filter', path: '#' },
      { label: 'UiSearchFilterPanel', icon: 'filter-edit', path: '#' },
      { label: 'UiPageContainer', icon: 'layout-03', path: '#' },
      { label: 'UiPageHeader', icon: 'layout-01', path: '#' },
      { label: 'UiResponsiveTabs', icon: 'tab', path: '#' },
      { label: 'UiStackView', icon: 'layers-01', path: '#' },
      { label: 'UiAnimatedCounter', icon: 'chart-increase', path: '#' },
      { label: 'UiAudioPlayer', icon: 'volume-high', path: '#' },
      { label: 'UiChartArea', icon: 'chart-line', path: '#' },
      { label: 'UiChartBar', icon: 'chart-column', path: '#' }
    ]
  },
  {
    label: 'Core & Utilities',
    menus: [
      { label: 'Table', icon: 'layout-table-02', path: '#' },
      { label: 'Icon (Hugeicons)', icon: 'star', path: '#' },
      { label: 'Label', icon: 'text', path: '#' },
      { label: 'Formatters', icon: 'code-circle', path: '#' }
    ]
  }
]
</script>

<style scoped lang="scss">
/* ── Sidebar width transition ─────────────────────────── */
.sidebar-root {
  width: 16rem;
  /* 256px / w-64 */
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-group-text {
  opacity: 1;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-minimized {
  width: 4.7rem;
  /* 72px */

  .sidebar-group-text {
    opacity: 0;
  }
}

/* ── Text / labels that disappear when minimized ─────── */
.sidebar-text {
  display: block;
  max-width: 200px;
  opacity: 1;
  overflow: hidden;
  white-space: nowrap;
  transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-left: 12px;

  &.minimize {
    max-width: 0px;
    margin-left: 0px;
    opacity: 0;
  }
}

.sidebar-minimized .sidebar-dot {
  display: none;
}

/* ── Menu item states ────────────────────────────────── */
.menu-item {
  overflow: hidden;
}

.menu-active {
  background-color: rgb(236 253 245);
  color: rgb(5 150 105);
}

.menu-active:hover {
  background-color: rgb(209 250 229);
}

:is(.dark) .menu-active {
  background-color: rgb(6 78 59 / 0.4);
  color: rgb(52 211 153);
}

:is(.dark) .menu-active:hover {
  background-color: rgb(6 78 59 / 0.6);
}

.menu-inactive {
  color: rgb(71 85 105);
}

.menu-inactive:hover {
  background-color: rgb(248 250 252);
  color: rgb(15 23 42);
}

.menu-disabled {
  color: rgb(148 163 184 / 0.7);
}

:is(.dark) .menu-disabled {
  color: rgb(71 85 105 / 0.7);
}

:is(.dark) .menu-inactive {
  color: rgb(148 163 184);
}

:is(.dark) .menu-inactive:hover {
  background-color: var(--bg-hover);
  color: rgb(241 245 249);
}

/* ── Minimized: center icon in menu item ─────────────── */
.sidebar-minimized .menu-item {
  justify-content: center;
}
</style>

