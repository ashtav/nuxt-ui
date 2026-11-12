<template>
  <div ref="containerRef" class="relative inline-block text-left">
    <!-- Trigger Slot -->
    <div @click="toggleOpen" class="h-full">
      <slot :open="isOpen" />
    </div>

    <!-- Dropdown Menu Content -->
    <Teleport to="body" :disabled="!teleport">
      <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
        <div v-if="isOpen" ref="menuRef" :class="[
          menuContainerClass,
          computedWidthClass,
          teleport ? '' : props.zIndex + ' absolute ' + positionClasses
        ]" :style="[teleport ? teleportStyle : {}, computedWidthStyle]">
          <div class="flex flex-col gap-0.5">
            <!-- Header Slot (Custom free div content) -->
            <div v-if="$slots.header" class="px-2 py-1.5">
              <slot name="header" :close="close" />
            </div>
            <div v-if="$slots.header" :class="dividerClass" />

            <template v-for="(item, index) in visibleOptions" :key="index">
              <!-- Separator: if the object is empty -->
              <div v-if="isSeparator(item)" :class="separatorClass" />

              <!-- Message Item -->
              <div v-else-if="item.message" :class="messageClass">
                {{ item.message }}
              </div>

              <!-- Dropdown Item with Submenu -->
              <div v-else-if="item.children && item.children.length > 0" class="relative group/submenu"
                @mouseenter="handleSubmenuEnter($event, index)">
                <button type="button" :class="getSubmenuParentButtonClass(item)" @click="handleItemClick($event, item)">
                  <div class="flex items-center gap-2">
                    <Icon v-if="item.icon" :name="item.icon" :class="getItemIconClass(item)" />
                    <span>{{ item.label }}</span>
                  </div>
                  <Icon name="arrow-right-01" :class="submenuChevronClass" />
                </button>

                <!-- Submenu Container -->
                <div data-submenu :class="[
                  submenuContainerClass,
                  submenuDirection === 'right' ? 'left-full ml-2.5' : 'right-full mr-2.5'
                ]" :style="[submenuStyle, getSubmenuVerticalStyle(index)]">
                  <!-- Invisible hover bridge to prevent menu from closing when moving mouse slowly -->
                  <div class="absolute -top-3 -bottom-3 w-4 bg-transparent pointer-events-auto"
                    :class="submenuDirection === 'right' ? 'right-full' : 'left-full'" />

                  <div
                    class="-mx-1.5 px-1.5 flex flex-col gap-0.5 max-h-[min(380px,calc(100vh-2rem))] overflow-y-auto overflow-x-hidden scrollbar-thin">
                    <template v-for="(child, childIndex) in item.children" :key="childIndex">
                      <!-- Separator inside Submenu -->
                      <div v-if="isSeparator(child)" :class="[separatorClass, 'shrink-0']" />

                      <!-- Message Item inside Submenu -->
                      <div v-else-if="child.message" :class="messageClass">
                        {{ child.message }}
                      </div>

                      <!-- Child Option Button -->
                      <button v-else type="button" :disabled="child.disabled" :class="getItemButtonClass(child)"
                        @click="handleItemClick($event, child)">
                        <img v-if="child.flagUrl" :src="child.flagUrl" :class="flagImageClass" />
                        <Icon v-else-if="child.icon" :name="child.icon" :class="getItemIconClass(child)" />
                        <span class="flex-1 truncate">{{ child.label }}</span>
                        <!-- Child Shortcut Text -->
                        <span v-if="child.shortcut && child.shortcut.length > 0" :class="[shortcutClass, 'ml-auto']">
                          {{ formatShortcutText(child.shortcut) }}
                        </span>
                      </button>
                    </template>
                  </div>
                </div>
              </div>

              <!-- Standard Dropdown Item (No children) -->
              <button v-else type="button" :disabled="item.disabled || item.loading" :class="getItemButtonClass(item)"
                @click="handleItemClick($event, item)">
                <!-- Loading Spinner -->
                <svg v-if="item.loading" class="animate-spin h-3.5 w-3.5 text-current flex-shrink-0" fill="none"
                  viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <img v-else-if="item.flagUrl" :src="item.flagUrl" :class="flagImageClass" />
                <Icon v-else-if="item.icon" :name="item.icon" :class="getItemIconClass(item)" />
                <span class="flex-1 truncate">{{ item.label }}</span>
                <span v-if="item.badge !== undefined && Number(item.badge) > 0"
                  class="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-extrabold text-white animate-pulse flex-shrink-0">
                  {{ item.badge }}
                </span>
                <!-- Shortcut Text -->
                <span v-if="item.shortcut && item.shortcut.length > 0"
                  :class="[shortcutClass, item.badge ? 'ml-2' : 'ml-auto']">
                  {{ formatShortcutText(item.shortcut) }}
                </span>
              </button>
            </template>

            <!-- Footer Slot (Optional custom free div content) -->
            <div v-if="$slots.footer" :class="dividerClass" />
            <div v-if="$slots.footer" class="px-2 py-1.5">
              <slot name="footer" :close="close" />
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue'
import type { CSSProperties } from 'vue'
import { useKeys } from '~/composables/useKeys'

export interface DropdownItem {
  icon?: string
  label?: string
  danger?: boolean
  onClick?: (event?: MouseEvent) => void
  action?: (event?: MouseEvent) => void
  children?: DropdownItem[]
  message?: string
  disabled?: boolean
  loading?: boolean
  badge?: number | string
  show?: boolean
  hidden?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'warning'
  flagUrl?: string
  selected?: boolean
  active?: boolean
  shortcut?: string[]
}

const props = withDefaults(defineProps<{
  options: DropdownItem[]
  align?: 'left' | 'right'
  zIndex?: string
  width?: string
  teleport?: boolean
  enableShortcuts?: boolean
  theme?: 'auto' | 'light' | 'dark'
}>(), {
  align: 'right',
  zIndex: 'z-40',
  width: 'w-56',
  teleport: false,
  enableShortcuts: true,
  theme: 'auto'
})

const isLight = computed(() => props.theme === 'light')
const isDark = computed(() => props.theme === 'dark')

const menuContainerClass = computed(() => {
  if (isLight.value) {
    return 'ui-dropdown-theme-light rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 focus:outline-none'
  }
  if (isDark.value) {
    return 'dark ui-dropdown-theme-dark rounded-xl border border-theme-border bg-theme-card p-1.5 shadow-xl shadow-black/50 focus:outline-none'
  }
  return 'rounded-xl border border-theme-border bg-white dark:bg-theme-card p-1.5 shadow-xl shadow-slate-900/10 dark:shadow-black/50 focus:outline-none'
})

const submenuContainerClass = computed(() => {
  const common = 'absolute invisible opacity-0 group-hover/submenu:visible group-hover/submenu:opacity-100 transition-all duration-150 rounded-xl p-1.5 w-52 z-50'
  if (isLight.value) {
    return `${common} ui-dropdown-theme-light border border-slate-200 bg-white shadow-xl shadow-slate-900/10`
  }
  if (isDark.value) {
    return `${common} dark ui-dropdown-theme-dark border border-theme-border bg-theme-card shadow-xl shadow-black/50`
  }
  return `${common} border border-theme-border bg-white dark:bg-theme-card shadow-xl shadow-slate-900/10 dark:shadow-black/50`
})

const dividerClass = computed(() => {
  return isLight.value ? '-mx-1.5 my-1 h-px bg-slate-200' : '-mx-1.5 my-1 h-px bg-theme-border'
})

const separatorClass = computed(() => {
  return isLight.value ? '-mx-1.5 my-1.5 h-px bg-slate-200' : '-mx-1.5 my-1.5 h-px bg-theme-border'
})

const messageClass = computed(() => {
  if (isLight.value) {
    return 'px-2.5 py-1.5 text-[11px] text-slate-400 break-words whitespace-normal leading-relaxed italic select-none'
  }
  return 'px-2.5 py-1.5 text-[11px] text-slate-400 dark:text-slate-500 break-words whitespace-normal leading-relaxed italic select-none'
})

const shortcutClass = computed(() => {
  if (isLight.value) {
    return 'pl-3 text-[11px] tracking-wide text-slate-400 font-normal select-none transition-colors group-hover:text-slate-600 shrink-0'
  }
  return 'pl-3 text-[11px] tracking-wide text-slate-400 dark:text-slate-500 font-normal select-none transition-colors group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0'
})

const flagImageClass = computed(() => {
  if (isLight.value) {
    return 'w-[16px] h-[11px] rounded-sm object-cover border border-slate-200 shadow-sm shrink-0'
  }
  return 'w-[16px] h-[11px] rounded-sm object-cover border border-theme-border dark:border-theme-input shadow-sm shrink-0'
})

const submenuChevronClass = computed(() => {
  if (isLight.value) {
    return 'text-[10px] text-slate-400 transition-transform duration-200'
  }
  return 'text-[10px] text-slate-400 dark:text-slate-500 transition-transform duration-200'
})

const getItemIconClass = (item: DropdownItem) => {
  const isDanger = (item.danger || item.variant === 'danger') && !item.disabled
  if (isLight.value) {
    return [
      'hgi hgi-stroke text-sm transition-colors',
      isDanger ? 'text-red-600 group-hover:text-red-700' : 'text-slate-400'
    ]
  }
  return [
    'hgi hgi-stroke text-sm transition-colors',
    isDanger
      ? 'text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300'
      : 'text-slate-400 dark:text-slate-500'
  ]
}

const getSubmenuParentButtonClass = (item: DropdownItem) => {
  const base = 'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[13px] font-medium text-left transition-all duration-200 cursor-pointer focus:outline-none'
  if (item.danger || item.variant === 'danger') {
    return isLight.value
      ? `${base} text-red-600 hover:bg-red-50 hover:text-red-700`
      : `${base} text-red-600 dark:text-red-400 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/15 dark:hover:text-red-300`
  }
  return isLight.value
    ? `${base} text-slate-700 hover:bg-slate-50 hover:text-slate-900`
    : `${base} text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-theme-hover dark:hover:text-white`
}

const getItemButtonClass = (item: DropdownItem) => {
  const base = 'group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium text-left transition-all duration-200 focus:outline-none border'

  if (item.disabled || item.loading) {
    return [
      base,
      'opacity-40 cursor-not-allowed select-none border-transparent',
      isLight.value ? 'text-slate-400' : 'text-slate-400 dark:text-slate-650'
    ]
  }

  if (item.danger || item.variant === 'danger') {
    return [
      base,
      'cursor-pointer border-transparent',
      isLight.value
        ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
        : 'text-red-600 dark:text-red-400 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/15 dark:hover:text-red-300'
    ]
  }

  if (item.selected || item.active) {
    return [
      base,
      'cursor-pointer',
      isLight.value
        ? 'bg-slate-50 text-slate-900 border-slate-200'
        : 'bg-slate-50 text-slate-900 dark:bg-theme-hover dark:text-white border-theme-border dark:border-theme-input'
    ]
  }

  return [
    base,
    'cursor-pointer border-transparent',
    isLight.value
      ? 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-theme-hover dark:hover:text-white'
  ]
}

const keys = useKeys()

const isOpen = ref(false)
const containerRef = ref<HTMLDivElement | null>(null)
const menuRef = ref<HTMLDivElement | null>(null)

const isCustomWidth = computed(() => {
  if (!props.width) return false
  const trimmed = props.width.trim()
  return /^\d+(\.\d+)?(px|rem|em|%|vw)?$/.test(trimmed) && !trimmed.startsWith('w-')
})

const computedWidthClass = computed(() => {
  if (!props.width) return 'w-56'
  if (isCustomWidth.value) return ''
  return props.width
})

const computedWidthStyle = computed<CSSProperties>(() => {
  if (isCustomWidth.value) {
    const val = props.width.trim()
    const widthVal = /^\d+$/.test(val) ? `${val}px` : val
    return { width: widthVal, minWidth: widthVal }
  }
  return {}
})

const verticalPosition = ref<'top' | 'bottom'>('bottom')
const horizontalPosition = ref<'left' | 'right'>('right')
const submenuDirection = ref<'left' | 'right'>('right')

const teleportStyle = ref<CSSProperties>({})
const submenuStyle = ref<CSSProperties>({})
const submenuVerticalStyles = ref<Record<number, CSSProperties>>({})

const handleSubmenuEnter = (e: MouseEvent, index: number) => {
  const target = e.currentTarget as HTMLElement
  if (!target) return

  const itemRect = target.getBoundingClientRect()
  const submenuEl = target.querySelector('[data-submenu]') as HTMLElement
  const submenuHeight = submenuEl ? (submenuEl.offsetHeight || submenuEl.scrollHeight) : 320

  const viewportHeight = window.innerHeight
  const margin = 12

  // Space available below the item's top edge
  const spaceBelow = viewportHeight - itemRect.top - margin
  // Space available above the item's bottom edge
  const spaceAbove = itemRect.bottom - margin

  if (spaceBelow < submenuHeight) {
    if (spaceAbove >= submenuHeight || spaceAbove > spaceBelow) {
      // Open upwards: align bottom of submenu with bottom of parent item
      submenuVerticalStyles.value[index] = {
        top: 'auto',
        bottom: '0px'
      }
    } else {
      // Shift upward so the bottom of submenu remains within viewport margin
      const overflow = submenuHeight - spaceBelow
      const shiftedTop = -Math.max(0, overflow)
      const clampedTop = Math.max(shiftedTop, -(itemRect.top - margin))
      submenuVerticalStyles.value[index] = {
        top: `${clampedTop}px`,
        bottom: 'auto'
      }
    }
  } else {
    // Fits downwards normally
    submenuVerticalStyles.value[index] = {
      top: '0px',
      bottom: 'auto'
    }
  }
}

const getSubmenuVerticalStyle = (index: number): CSSProperties => {
  if (submenuVerticalStyles.value[index]) {
    return submenuVerticalStyles.value[index]
  }
  // Initial fallback before hover based on main menu's vertical orientation
  if (verticalPosition.value === 'top') {
    return { top: 'auto', bottom: '0px' }
  }
  return { top: '0px', bottom: 'auto' }
}

const toggleOpen = (e: MouseEvent) => {
  e.stopPropagation()
  isOpen.value = !isOpen.value
}

const isSeparator = (item: DropdownItem | undefined) => {
  return item ? Object.keys(item).length === 0 : false
}

const formatShortcutKey = (k: string) => {
  if (!k) return ''
  const lower = k.toLowerCase().trim()
  if (lower === 'ctrl' || lower === 'control') return 'Ctrl'
  if (lower === 'alt' || lower === 'option') return 'Alt'
  if (lower === 'shift') return 'Shift'
  if (lower === 'cmd' || lower === 'command' || lower === 'meta') return 'Cmd'
  if (lower === 'enter') return 'Enter'
  if (lower === 'esc' || lower === 'escape') return 'Esc'
  if (lower === 'space') return 'Space'
  if (lower === 'tab') return 'Tab'
  if (lower === 'backspace') return 'Backspace'
  if (lower === 'delete' || lower === 'del') return 'Del'
  return k.toUpperCase()
}

const formatShortcutText = (shortcut: string[]) => {
  if (!shortcut || shortcut.length === 0) return ''
  return shortcut.map(k => formatShortcutKey(k)).join(' + ')
}

const visibleOptions = computed(() => {
  // First, filter items that have show !== false and !hidden
  const list = props.options.filter(item => item.show !== false && !item.hidden).map(item => {
    // If the item has children, clean them up as well!
    if (item.children && item.children.length > 0) {
      const childList = item.children.filter(c => c.show !== false && !c.hidden)
      while (childList.length > 0 && isSeparator(childList[childList.length - 1])) {
        childList.pop()
      }

      const cleanedChildren: DropdownItem[] = []
      for (let i = 0; i < childList.length; i++) {
        const current = childList[i]
        if (!current) continue
        if (isSeparator(current)) {
          if (cleanedChildren.length === 0 || isSeparator(cleanedChildren[cleanedChildren.length - 1])) {
            continue
          }
        }
        cleanedChildren.push(current)
      }
      return { ...item, children: cleanedChildren }
    }
    return item
  })

  // If the last item in this list is a separator, remove it!
  while (list.length > 0 && isSeparator(list[list.length - 1])) {
    list.pop()
  }

  // Collapse consecutive separators and remove leading separators
  const cleaned: DropdownItem[] = []
  for (let i = 0; i < list.length; i++) {
    const current = list[i]
    if (!current) continue
    if (isSeparator(current)) {
      if (cleaned.length === 0 || isSeparator(cleaned[cleaned.length - 1])) {
        continue
      }
    }
    cleaned.push(current)
  }

  return cleaned
})

const handleItemClick = (e: MouseEvent | KeyboardEvent, item: DropdownItem) => {
  e.stopPropagation?.()
  if (item.disabled || item.loading) return
  if (item.onClick) {
    item.onClick(e as MouseEvent)
  } else if (item.action) {
    item.action(e as MouseEvent)
  }
  if (item.children && item.children.length > 0) {
    return
  }
  isOpen.value = false
}

// Keyboard shortcuts (scoped strictly to this dropdown component instance & page lifecycle)
const registeredCombos = new Set<string>()

const normalizeComboKey = (combo: string[]) => {
  return combo.map(k => k.toLowerCase().trim()).sort().join('+')
}

const findShortcutItem = (comboKey: string): DropdownItem | undefined => {
  let found: DropdownItem | undefined
  const search = (items: DropdownItem[]) => {
    for (const item of items) {
      if (found) return
      if (item.children && item.children.length > 0) {
        search(item.children)
      } else if (item.shortcut && item.shortcut.length > 0) {
        if (normalizeComboKey(item.shortcut) === comboKey) {
          found = item
          return
        }
      }
    }
  }
  search(visibleOptions.value)
  return found
}

const registerShortcuts = () => {
  if (!props.enableShortcuts) return

  const collectItems = (items: DropdownItem[]) => {
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        collectItems(item.children)
      } else if (item.shortcut && item.shortcut.length > 0) {
        const comboKey = normalizeComboKey(item.shortcut)
        if (!registeredCombos.has(comboKey)) {
          registeredCombos.add(comboKey)
          keys.apply(item.shortcut, (e) => {
            if (!props.enableShortcuts) return
            const target = findShortcutItem(comboKey)
            if (target && !target.disabled && !target.loading) {
              handleItemClick(e, target)
            }
          })
        }
      }
    }
  }

  collectItems(visibleOptions.value)
}

watch(visibleOptions, () => {
  registerShortcuts()
}, { immediate: true })

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  const clickedInsideTrigger = containerRef.value?.contains(target)
  const clickedInsideMenu = menuRef.value?.contains(target)

  if (!clickedInsideTrigger && !clickedInsideMenu) {
    isOpen.value = false
  }
}

const calculatePosition = () => {
  if (!isOpen.value || !containerRef.value) return

  const compute = () => {
    if (!containerRef.value) return

    const rect = containerRef.value.getBoundingClientRect()
    const menuWidth = menuRef.value?.getBoundingClientRect().width || (props.width ? parseInt(props.width.replace(/\D/g, '')) * 4 : 224) || 224
    const menuHeight = menuRef.value?.getBoundingClientRect().height || 180

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Check vertical overflow (top vs bottom)
    const spaceBelow = viewportHeight - rect.bottom
    const spaceAbove = rect.top

    if (spaceBelow < menuHeight + 10 && spaceAbove > spaceBelow) {
      verticalPosition.value = 'top'
    } else {
      verticalPosition.value = 'bottom'
    }

    // Check horizontal overflow (left vs right)
    if (props.align === 'right') {
      const leftEdge = rect.right - menuWidth
      if (leftEdge < 10 && (viewportWidth - rect.left) > menuWidth) {
        horizontalPosition.value = 'left'
      } else {
        horizontalPosition.value = 'right'
      }
    } else {
      const rightEdge = rect.left + menuWidth
      if (rightEdge > viewportWidth - 10 && rect.right > menuWidth) {
        horizontalPosition.value = 'right'
      } else {
        horizontalPosition.value = 'left'
      }
    }

    // Calculate submenu direction (should it open to the right or left?)
    const submenuWidth = 208 // w-52 is 208px
    const margin = 10

    if (horizontalPosition.value === 'right') {
      const spaceRight = viewportWidth - rect.right
      if (spaceRight > submenuWidth + margin) {
        submenuDirection.value = 'right'
      } else {
        submenuDirection.value = 'left'
      }
    } else {
      const spaceRight = viewportWidth - (rect.left + menuWidth)
      if (spaceRight > submenuWidth + margin) {
        submenuDirection.value = 'right'
      } else {
        submenuDirection.value = 'left'
      }
    }

    // Boundary correction: if both directions overflow the screen bounds, shift the submenu by the difference
    const parentLeft = horizontalPosition.value === 'right' ? rect.right - menuWidth : rect.left
    const parentRight = horizontalPosition.value === 'right' ? rect.right : rect.left + menuWidth

    const spaceRight = viewportWidth - parentRight
    const spaceLeft = parentLeft

    const rightOut = spaceRight < submenuWidth + margin
    const leftOut = spaceLeft < submenuWidth + margin

    if (rightOut && leftOut) {
      const gap = 10 // gap between menu and submenu (approx 10px)
      if (submenuDirection.value === 'right') {
        const overflow = (parentRight + gap + submenuWidth) - (viewportWidth - margin)
        submenuStyle.value = {
          transform: `translateX(${-overflow}px)`
        }
      } else {
        const overflow = margin - (parentLeft - gap - submenuWidth)
        submenuStyle.value = {
          transform: `translateX(${overflow}px)`
        }
      }
    } else {
      submenuStyle.value = {}
    }

    // If teleported, compute fixed position properties relative to viewport
    if (props.teleport) {
      let top = 0
      if (verticalPosition.value === 'top') {
        top = rect.top - menuHeight - 6
      } else {
        top = rect.bottom + 6
      }

      let left = 0
      if (horizontalPosition.value === 'right') {
        left = rect.right - menuWidth
      } else {
        left = rect.left
      }

      // Clamp left position to stay inside viewport bounds
      left = Math.max(8, Math.min(left, viewportWidth - menuWidth - 8))

      teleportStyle.value = {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: '9999'
      }
    }
  }

  // Synchronous compute first to set initial position before render/mount
  compute()

  // Re-compute after DOM nextTick to account for actual rendered dimensions
  nextTick(compute)
}

const originClass = computed(() => {
  const v = verticalPosition.value === 'top' ? 'bottom' : 'top'
  const h = horizontalPosition.value === 'left' ? 'left' : 'right'
  return `origin-${v}-${h}`
})

const positionClasses = computed(() => {
  const vClass = verticalPosition.value === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
  const hClass = horizontalPosition.value === 'left' ? 'left-0' : 'right-0'
  return `${vClass} ${hClass} ${originClass.value}`
})

let clickOutsideTimeout: any = null

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

watch(isOpen, (newVal) => {
  if (newVal) {
    calculatePosition()
    if (clickOutsideTimeout) clearTimeout(clickOutsideTimeout)
    clickOutsideTimeout = setTimeout(() => {
      if (isOpen.value) {
        document.addEventListener('pointerdown', handleClickOutside)
        document.addEventListener('mousedown', handleClickOutside)
      }
    }, 0)
    window.addEventListener('scroll', calculatePosition, { capture: true, passive: true })
    window.addEventListener('resize', calculatePosition)
  } else {
    submenuVerticalStyles.value = {}
    if (clickOutsideTimeout) clearTimeout(clickOutsideTimeout)
    document.removeEventListener('pointerdown', handleClickOutside)
    document.removeEventListener('mousedown', handleClickOutside)
    window.removeEventListener('scroll', calculatePosition, { capture: true })
    window.removeEventListener('resize', calculatePosition)
  }
})

onUnmounted(() => {
  if (clickOutsideTimeout) clearTimeout(clickOutsideTimeout)
  document.removeEventListener('pointerdown', handleClickOutside)
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('scroll', calculatePosition, { capture: true })
  window.removeEventListener('resize', calculatePosition)
})

defineExpose({ isOpen, open, close })
</script>

<style scoped>
.ui-dropdown-theme-light {
  color-scheme: light;
  --bg-app: #f8fafc;
  --bg-card: #ffffff;
  --bg-hover: #f1f5f9;
  --bg-input: #ffffff;
  --border-default: #e2e8f0;
  --border-card: #e2e8f0;
  --border-input: #d1d5db;
  --text-primary: #0f172a;
  --text-body: #334155;
  --text-muted: #64748b;
  --text-subtle: #94a3b8;
}

.ui-dropdown-theme-dark {
  color-scheme: dark;
  --bg-app: #1e2128;
  --bg-card: #22252e;
  --bg-hover: #262b37;
  --bg-input: #1e2128;
  --border-default: #272b34;
  --border-card: #272b34;
  --border-input: #313742;
  --text-primary: #ffffff;
  --text-body: #cbd5e1;
  --text-muted: #94a3b8;
  --text-subtle: #64748b;
}
</style>
