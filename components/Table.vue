<template>
    <!-- .dtable-wrapper: neutral root with no overflow so position:sticky works against the window.
         .dtable inside has overflow-x: auto, and pagination/selection live as siblings
         so they are NOT inside the horizontal scroll zone. -->
    <div class="dtable-wrapper rounded-xl">
        <div ref="dtableRef" class="dtable rounded-xl"
            :class="{
                'dtable--loading': props.loading,
                'dtable--responsive': props.responsive,
                'dtable--sticky-header': props.stickyHeader,
                'dtable--fixed': props.fixed,
                'dtable--is-dragging': isRightDragging
            }"
            :style="props.stickyHeader ? { '--dt-max-height': props.maxHeight } as any : {}"
            @mousedown="onTableMouseDown"
            @contextmenu="onTableContextMenu">
            <div class="dtable__inner" role="table" :aria-label="props.ariaLabel" :aria-rowcount="props.data.length + 1"
                :class="{ 'dtable__inner--scrollable': !props.fixed || isAnyColumnFrozen }" :style="gridStyle">
                <!-- Header row (kept in DOM for a11y; visually hidden on mobile, cards use data-label instead) -->
                <div class="dtable__row dtable__row--head border-b border-theme-border" role="row" aria-rowindex="1">
                    <!-- Checkbox Column Header -->
                    <div v-if="isSelectable" role="columnheader"
                        class="dtable__cell dtable__cell--selection border-theme-border md:border-r flex items-center justify-center cursor-pointer select-none"
                        :style="checkboxStickyStyle"
                        @click="toggleSelectAll">
                        <span class="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
                            <input type="checkbox" :checked="isAllSelected"
                                @click.stop
                                @change="toggleSelectAll"
                                class="peer absolute inset-0 h-4 w-4 shrink-0 appearance-none rounded-[4px] border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 cursor-pointer"
                                :class="isAllSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 dark:border-theme-border bg-theme-input'" />
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
                                class="pointer-events-none h-3 w-3 text-white transition-all duration-150 relative z-10"
                                :class="isAllSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'">
                                <path d="M20 6 9 17l-5-5" />
                            </svg>
                        </span>
                    </div>
                    <div v-for="col in columns" :key="String(col.key)" role="columnheader"
                        :data-col-key="String(col.key)"
                        :title="getHeaderLabel(col)"
                        class="dtable__cell dtable__cell--head border-theme-border md:border-r last:border-r-0" :class="[
                            `dtable__cell--${col.align || 'left'}`,
                            { 'dtable__cell--sortable hover:bg-slate-100/70 dark:hover:bg-theme-card transition-colors cursor-pointer': canSort(col) },
                            { 'dtable__cell--hidden-mobile': hideOnMobile?.includes(String(col.key)) },
                            getHideClass(col)
                        ]" :aria-sort="canSort(col) ? ariaSortFor(col) : undefined"
                        :tabindex="canSort(col) ? 0 : undefined" :style="getFrozenStyle(col)"
                        @click="canSort(col) && emitSort(col)" @keydown.enter="canSort(col) && emitSort(col)"
                        @keydown.space.prevent="canSort(col) && emitSort(col)">
                        <div class="dtable__head-inner" :class="`dtable__head-inner--${col.align || 'left'}`">
                            <span class="dtable__head-label"
                                :class="{ 'dtable__head-label--wrap': props.wrapHeader || col.wrapHeader }"
                                :title="getHeaderLabel(col)">{{ getHeaderLabel(col) }}</span>

                            <!-- Active sort indicator when column has headerActions dropdown and is currently sorted -->
                            <Icon v-if="hasHeaderMenu(col) && props.sortBy === col.key"
                                :name="props.sortDirection === 'asc' ? 'sort-by-up-02' : 'sort-by-down-02'"
                                class="dtable__sort-icon dtable__sort-icon--active" />

                            <!-- Caret dropdown menu for columns with explicit headerActions / tools (e.g. freeze) -->
                            <UiDropdownMenu v-if="hasHeaderMenu(col)" :options="getHeaderOptions(col)" align="right"
                                width="w-48" teleport @click.stop>
                                <button type="button"
                                    class="dtable__sort-trigger flex items-center justify-center h-5 w-5 rounded hover:bg-slate-100 dark:hover:bg-theme-hover text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-all select-none cursor-pointer"
                                    title="Column options">
                                    <Icon name="arrow-down-01" class="text-xs" />
                                </button>
                            </UiDropdownMenu>

                            <!-- Direct sort icon if only sortable (no dropdown) -->
                            <Icon v-else-if="canSort(col)"
                                :name="props.sortBy === col.key ? (props.sortDirection === 'asc' ? 'sort-by-up-02' : 'sort-by-down-02') : 'sort-by-up-02'"
                                class="dtable__sort-icon" :class="{ 'dtable__sort-icon--active': props.sortBy === col.key }" />
                        </div>
                    </div>
                </div>

                <!-- Loading skeleton -->
                <template v-if="props.loading">
                    <div v-for="n in props.skeletonRows" :key="`sk-${n}`"
                        class="dtable__row dtable__row--skeleton border-b border-theme-border" role="row">
                        <!-- Universal Responsive Mobile Card Skeleton -->
                        <div v-if="props.responsive" class="dtable__responsive-slot w-full">
                            <slot name="skeleton" :index="n">
                                <div class="space-y-3 w-full py-0.5">
                                    <!-- Top Row: Thumbnail (optional) + Title / Subtitle + Action Placeholder -->
                                    <div class="flex items-start justify-between gap-3">
                                        <div class="flex items-start gap-3 min-w-0 flex-1">
                                            <!-- Optional Square Thumbnail -->
                                            <div v-if="props.skeletonThumbnail"
                                                class="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700/70 animate-pulse shrink-0" />
                                            <div class="space-y-1.5 min-w-0 flex-1">
                                                <!-- Title -->
                                                <div class="h-4 rounded bg-slate-200 dark:bg-slate-700/70 animate-pulse"
                                                    :style="{ width: n % 2 === 0 ? '60%' : '78%' }" />
                                                <!-- Subtitle -->
                                                <div class="h-3 rounded bg-slate-200/80 dark:bg-slate-700/50 animate-pulse"
                                                    :style="{ width: n % 2 === 0 ? '38%' : '48%' }" />
                                            </div>
                                        </div>
                                        <!-- Action Placeholder -->
                                        <div class="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700/70 animate-pulse shrink-0" />
                                    </div>

                                    <!-- Content / Badges Chips Row -->
                                    <div class="flex items-center gap-1.5 flex-wrap">
                                        <div class="h-5 w-20 rounded-md bg-slate-200 dark:bg-slate-700/60 animate-pulse" />
                                        <div class="h-5 w-16 rounded-md bg-slate-200 dark:bg-slate-700/60 animate-pulse" />
                                        <div class="h-5 w-24 rounded-md bg-slate-200 dark:bg-slate-700/60 animate-pulse" />
                                    </div>

                                    <!-- Bottom Row: Metadata & Timestamp Line -->
                                    <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-theme-border">
                                        <div class="h-3 w-28 rounded bg-slate-200/90 dark:bg-slate-700/60 animate-pulse" />
                                        <div class="h-3 w-14 rounded bg-slate-200/90 dark:bg-slate-700/60 animate-pulse" />
                                    </div>
                                </div>
                            </slot>
                        </div>

                        <!-- Checkbox Column Skeleton (Desktop only when responsive) -->
                        <div v-if="isSelectable" role="cell"
                            class="dtable__cell dtable__cell--selection border-theme-border md:border-r flex items-center justify-center"
                            :class="{ 'dtable__cell--desktop-only': props.responsive }"
                            :style="checkboxStickyStyle">
                            <span
                                class="w-4 h-4 rounded-[4px] bg-slate-200 dark:bg-slate-700/70 animate-pulse block shrink-0" />
                        </div>

                        <!-- Desktop Columns Skeleton (Desktop only when responsive) -->
                        <div v-for="col in columns" :key="`sk-${n}-${String(col.key)}`" role="cell"
                            class="dtable__cell border-theme-border md:border-r last:border-r-0" :class="[
                                `dtable__cell--${col.align || 'left'}`,
                                { 'dtable__cell--hidden-mobile': hideOnMobile?.includes(String(col.key)) },
                                { 'dtable__cell--desktop-only': props.responsive },
                                getHideClass(col)
                            ]" :data-label="col.label" :style="getFrozenStyle(col)">
                            <span
                                class="h-3.5 w-[70%] rounded-[4px] bg-slate-200 dark:bg-slate-700/70 animate-pulse block" />
                        </div>
                    </div>
                </template>

                <!-- Empty state -->
                <template v-else-if="props.data.length === 0">
                    <div class="dtable__row dtable__row--empty" role="row">
                        <div role="cell" class="dtable__cell dtable__cell--empty">
                            <slot name="empty">
                                <div class="dtable__empty">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                                        class="dtable__empty-icon">
                                        <rect x="3" y="4" width="18" height="16" rx="2" />
                                        <path d="M3 10h18M9 10v10" />
                                    </svg>
                                    <p class="dtable__empty-title">{{ props.emptyTitle }}</p>
                                    <p class="dtable__empty-subtitle">{{ props.emptySubtitle }}</p>
                                </div>
                            </slot>
                        </div>
                    </div>
                </template>

                <!-- Data rows -->
                <template v-else>
                    <component
                        :is="props.animated ? TransitionGroup : 'div'"
                        :tag="props.animated ? 'div' : undefined"
                        :name="props.animated ? 'dtable-row' : undefined"
                        class="dtable__rows-container"
                    >
                        <div v-for="(item, index) in props.data" :key="props.rowKey ? String(item[props.rowKey]) : index"
                            class="dtable__row border-b border-theme-border last:border-b-0 hover:bg-slate-100/70 dark:hover:bg-theme-card transition-colors"
                            :class="[
                                { '!bg-slate-100/80 dark:!bg-theme-card': contextMenuItem === item || isSelected(item), 'cursor-pointer': hasRowClickListener },
                                props.rowClass ? props.rowClass(item) : ''
                            ]"
                            :data-row-index="index"
                            role="row" :aria-rowindex="index + 2" @click="handleRowClick($event, item)"
                            @contextmenu="handleRowContextMenu($event, item)">
                            <!-- 1. Custom Responsive Mobile Card Slot -->
                            <div v-if="$slots.responsive" class="dtable__responsive-slot w-full">
                                <slot name="responsive" :item="item" :index="index" :actions="props.rowActions ? props.rowActions(item) : []"
                                    :isSelected="isSelected(item)" :toggleSelect="() => toggleSelectRow(item)">
                                </slot>
                            </div>

                            <!-- Checkbox Column Data Cell -->
                            <div v-if="isSelectable" role="cell"
                                class="dtable__cell dtable__cell--selection border-theme-border md:border-r flex items-center justify-center cursor-pointer select-none"
                                :class="{ 'dtable__cell--desktop-only': !!$slots.responsive }"
                                :style="checkboxStickyStyle"
                                @click.stop="toggleSelectRow(item)">
                                <span class="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
                                    <input type="checkbox" :checked="isSelected(item)"
                                        @click.stop
                                        @change="toggleSelectRow(item)"
                                        class="peer absolute inset-0 h-4 w-4 shrink-0 appearance-none rounded-[4px] border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 cursor-pointer"
                                        :class="isSelected(item) ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 dark:border-theme-border bg-theme-input'" />
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" stroke-width="3" stroke-linecap="round"
                                        stroke-linejoin="round"
                                        class="pointer-events-none h-3 w-3 text-white transition-all duration-150 relative z-10"
                                        :class="isSelected(item) ? 'scale-100 opacity-100' : 'scale-0 opacity-0'">
                                        <path d="M20 6 9 17l-5-5" />
                                    </svg>
                                </span>
                            </div>
                            <div v-for="col in columns" :key="String(col.key)" role="cell"
                                class="dtable__cell border-theme-border md:border-r last:border-r-0" :class="[
                                    `dtable__cell--${col.align || 'left'}`,
                                    { 'dtable__cell--actions': col.key === 'actions' },
                                    { 'dtable__cell--hidden-mobile': hideOnMobile?.includes(String(col.key)) },
                                    { 'dtable__cell--desktop-only': !!$slots.responsive },
                                    getHideClass(col)
                                ]" :data-label="col.label" :style="getFrozenStyle(col)">
                                <slot :name="`cell-${String(col.key)}`" :item="item" :value="getCellValue(item, col)"
                                    :index="index" :open-context-menu="($e: MouseEvent) => handleRowContextMenu($e, item)"
                                    :row-actions="props.rowActions ? props.rowActions(item) : []">
                                    <div v-if="col.key === 'actions' && props.rowActions" class="flex items-center justify-center">
                                        <button type="button"
                                            class="p-1.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-theme-border hover:bg-slate-100 dark:hover:bg-theme-hover text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                            title="Actions"
                                            @click.stop="handleRowContextMenu($event, item)">
                                            <Icon name="menu-02" class="text-base" />
                                        </button>
                                    </div>
                                    <span v-else class="dtable__cell-text">{{ getCellValue(item, col) }}</span>
                                </slot>
                            </div>
                        </div>
                    </component>
                </template>
            </div><!-- end dtable__inner -->
        </div><!-- end .dtable (scrollbar sits here, above pagination) -->

        <!-- Floating Row Context Menu -->
        <Teleport to="body">
            <div v-if="contextMenuPos && activeContextMenuOptions.length > 0" class="fixed inset-0 z-[9999]"
                @click="closeContextMenu" @contextmenu.prevent="closeContextMenu">
                <div class="fixed rounded-xl border border-theme-border bg-theme-card p-1.5 shadow-2xl min-w-[170px] flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100"
                    :style="{ left: `${contextMenuPos.x}px`, top: `${contextMenuPos.y}px` }" @click.stop>
                    <template v-for="(act, i) in activeContextMenuOptions" :key="i">
                        <div v-if="!act.label && !act.message" class="-mx-1.5 my-1.5 h-px bg-theme-border" />
                        <button v-else type="button" :disabled="act.disabled"
                            class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-left transition-colors cursor-pointer border-transparent"
                            :class="[
                                act.disabled
                                    ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600'
                                    : act.danger
                                        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/15 dark:hover:text-red-300'
                                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-theme-hover dark:hover:text-white'
                            ]" @click="act.onClick && act.onClick(); closeContextMenu()">
                            <Icon v-if="act.icon" :name="act.icon" class="text-sm shrink-0 transition-colors"
                                :class="act.danger ? 'text-red-500/80 dark:text-red-400/90 group-hover:text-red-600 dark:group-hover:text-red-300' : 'text-slate-400 dark:text-slate-500'" />
                            <span>{{ act.label }}</span>
                        </button>
                    </template>
                </div>
            </div>
        </Teleport>

        <!-- Built-in Pagination Footer -->
        <div v-if="!props.loading && hasPaginateListener && props.totalPages > 1 && props.data.length > 0"
            class="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 bg-transparent px-4">
            <div class="text-xs text-slate-500 dark:text-slate-400 select-none order-2 sm:order-1">
                Page <span class="font-semibold text-slate-700 dark:text-slate-300">{{ props.currentPage }}</span> of
                <span class="font-semibold text-slate-700 dark:text-slate-300">{{ props.totalPages }}</span>
            </div>
            <div class="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto order-1 sm:order-2">
                <button @click="changePage(props.currentPage - 1)" :disabled="props.currentPage === 1"
                    class="h-8 px-3 text-xs font-semibold rounded-lg border border-theme-border text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-white/[0.04] disabled:opacity-50 disabled:hover:bg-transparent transition-all flex items-center gap-1.5 select-none cursor-pointer flex-1 sm:flex-none justify-center">
                    <Icon name="arrow-left-01" class="text-[12px]" />
                    Previous
                </button>

                <!-- Numbered pagination buttons with ellipsis (hidden on mobile) -->
                <div class="hidden sm:flex items-center gap-1">
                    <template v-for="(p, idx) in visiblePages" :key="idx">
                        <span v-if="p === '...'"
                            class="w-8 h-8 flex items-center justify-center text-xs font-semibold text-slate-400 dark:text-slate-500 select-none">
                            ...
                        </span>
                        <button v-else @click="changePage(Number(p))" :class="[
                            'w-8 h-8 flex items-center justify-center text-xs font-semibold rounded-lg transition-all select-none cursor-pointer',
                            props.currentPage === p
                                ? 'bg-emerald-600 text-white'
                                : 'border border-theme-border text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                        ]">
                            {{ p }}
                        </button>
                    </template>
                </div>

                <button @click="changePage(props.currentPage + 1)" :disabled="props.currentPage === props.totalPages"
                    class="h-8 px-3 text-xs font-semibold rounded-lg border border-theme-border text-slate-600 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-white/[0.04] disabled:opacity-50 disabled:hover:bg-transparent transition-all flex items-center gap-1.5 select-none cursor-pointer flex-1 sm:flex-none justify-center">
                    Next
                    <Icon name="arrow-right-01" class="text-[12px]" />
                </button>
            </div>
        </div>

        <!-- Floating Selection Actions Bar -->
        <div v-if="isSelectable && selectedRows.length > 0" class="dtable__selection-bar">
            <div class="dtable__selection-info">
                <span class="dtable__selection-label">{{ selectedRows.length }} selected</span>
            </div>
            <div class="dtable__selection-divider"></div>
            <div class="dtable__selection-actions">
                <button @click="clearSelection" class="dtable__selection-clear-btn" title="Clear selection">
                    <Icon name="cancel-01" class="text-[14px]" />
                </button>
                <slot name="selected-actions" :selected-items="selectedRows" :clear-selection="clearSelection">
                    <button @click="emitDeleteSelected"
                        class="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs transition-colors flex items-center gap-1 cursor-pointer">
                        <Icon name="delete-02" class="text-[12px]" />
                        <span class="font-semibold">Delete Selected</span>
                    </button>
                </slot>
            </div>
        </div><!-- end dtable__selection-bar -->
    </div><!-- end .dtable-wrapper -->
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { computed, getCurrentInstance, ref, onMounted, onBeforeUnmount, watch, nextTick, TransitionGroup, type Ref, type CSSProperties } from 'vue'
import dayjs from 'dayjs'
import { toast } from 'vue-sonner'

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export type ColumnHeaderAction = 'sort' | 'freeze'

export interface Column<T = any> {
    /** Property key in the data item this column reads from */
    key: keyof T | string
    /** Header label shown on desktop and as the mobile card data-label */
    label: string
    /** Text alignment for the cell content */
    align?: 'left' | 'center' | 'right'
    /** Column track size for CSS Grid on desktop, e.g. '1fr', '160px', 'minmax(120px, 1fr)' */
    width?: string
    /** Whether the column width should follow the length of the column header content */
    fitHeader?: boolean
    /** Whether the column header is clickable to trigger sorting */
    sortable?: boolean
    /** Features/options available in header dropdown menu e.g. ['sort', 'freeze'], ['sort'], or ['freeze'] */
    headerActions?: ColumnHeaderAction[]
    /** Alias for headerActions */
    tools?: ColumnHeaderAction[]
    /** Whether the column is frozen/sticky. Can be true, 'left', or 'right' */
    frozen?: boolean | 'left' | 'right'
    /** Alias for frozen */
    sticky?: boolean | 'left' | 'right'
    /** Alias for frozen */
    fixed?: boolean | 'left' | 'right'
    /** Limit for text truncation. Can be a number or false to disable. */
    truncateLimit?: number | boolean
    /** Date formatting string, e.g., 'yyyy-mm-dd hh:ii' or 'yyyy/mm/dd' */
    format?: string
    /** Breakpoint at which the column should be hidden */
    hideOn?: Breakpoint
    forcedDirection?: 'asc' | 'desc'
    /** Whether this column header label can wrap into multiple lines instead of being truncated */
    wrapHeader?: boolean
}

export type TableColumn<T = any> = Column<T>

const props = withDefaults(
    defineProps<{
        columns: Column<T>[]
        data: T[]
        /** Unique field used as :key for rows; falls back to array index */
        rowKey?: keyof T
        loading?: boolean
        skeletonRows?: number
        sortBy?: string
        sortDirection?: 'asc' | 'desc'
        ariaLabel?: string
        emptyTitle?: string
        emptySubtitle?: string
        /** Column keys that should be hidden on mobile card layout */
        hideOnMobile?: string[]
        /** Global character limit for cell text truncation. Set to 0 to disable. */
        truncateLimit?: number
        /** Current active page */
        currentPage?: number
        /** Total number of pages */
        totalPages?: number
        /** Whether to reflow rows into cards on mobile screen widths */
        responsive?: boolean
        /** Sticky table header */
        stickyHeader?: boolean
        /**
         * Max height of the table when stickyHeader is true.
         * The table scrolls vertically within this height — that's how sticky works reliably
         * alongside horizontal scroll. Defaults to calc(100vh - 10rem).
         * Example: maxHeight="600px" or maxHeight="calc(100vh - 14rem)"
         */
        maxHeight?: string
        /** Whether checkbox selection is enabled */
        selectable?: boolean
        /**
         * When true (default), columns divide available screen width equally (no horizontal scroll).
         * When false, flexible columns use a minimum 150px width, enabling a horizontal scrollbar
         * when total columns exceed the container width.
         */
        fixed?: boolean
        /**
         * Whether drag-to-scroll with right-click mouse drag is enabled.
         * Allows panning horizontally and vertically by holding right-click and dragging.
         */
        dragScroll?: boolean
        /** Function returning action items array for right-click context menu on a row */
        rowActions?: (item: T) => any[]
        /** Optional function returning class name(s) or object for a row */
        rowClass?: (item: T) => any
        /** Whether to show a square thumbnail / avatar placeholder in the mobile card skeleton */
        skeletonThumbnail?: boolean
        /** Whether column header names can wrap into multiple lines instead of being truncated with ellipsis. Defaults to false. */
        wrapHeader?: boolean
        /** Whether rows should animate with smooth gliding FLIP transitions when sorted or reordered */
        animated?: boolean
    }>(),
    {
        loading: false,
        skeletonRows: 3,
        sortBy: '',
        sortDirection: 'asc',
        ariaLabel: 'Data table',
        emptyTitle: 'No data',
        emptySubtitle: 'No data available to display at this time.',
        hideOnMobile: () => [],
        truncateLimit: 250,
        currentPage: 1,
        totalPages: 1,
        responsive: false,
        stickyHeader: false,
        maxHeight: 'calc(100vh - 10rem)',
        selectable: false,
        fixed: false,
        dragScroll: false,
        skeletonThumbnail: false,
        wrapHeader: false,
        animated: false
    }
)

const emit = defineEmits<{
    (e: 'sort', column: Column<T>): void
    (e: 'paginate', page: number): void
    (e: 'selection-change', selectedItems: T[]): void
    (e: 'delete-selected', selectedItems: T[]): void
    (e: 'row-contextmenu', payload: { event: MouseEvent; item: T }): void
    (e: 'row-click', item: T): void
    (e: 'rowClick', item: T): void
}>()

const instance = getCurrentInstance()
const hasPaginateListener = computed(() => {
    return !!(instance?.vnode.props && (instance.vnode.props.onPaginate || instance.vnode.props['onUpdate:currentPage']))
})

const hasSelectionListener = computed(() => {
    return !!(instance?.vnode.props && (instance.vnode.props.onSelectionChange || instance.vnode.props['onSelection-change']))
})

const hasRowContextMenuListener = computed(() => {
    return !!(instance?.vnode.props && (instance.vnode.props.onRowContextmenu || instance.vnode.props['onRow-contextmenu']))
})

const hasRowClickListener = computed(() => {
    return !!(instance?.vnode.props && (instance.vnode.props.onRowClick || instance.vnode.props['onRow-click']))
})

const handleRowClick = (event: MouseEvent, item: T) => {
    const target = event.target as HTMLElement | null
    if (target?.closest('button, input, a, label, .dtable__cell--actions, .dtable__cell--selection, [data-dropdown-trigger], [data-no-row-click]')) {
        return
    }
    emit('row-click', item)
    emit('rowClick', item)
}

const contextMenuPos = ref<{ x: number; y: number } | null>(null)
const contextMenuItem = ref<T | null>(null)

const activeContextMenuOptions = computed(() => {
    if (!contextMenuItem.value || !props.rowActions) return []
    return props.rowActions(contextMenuItem.value)
})

const dtableRef = ref<HTMLElement | null>(null)
const isRightDragging = ref(false)
let dragStartX = 0
let dragStartY = 0
let lastMouseX = 0
let lastMouseY = 0
let hasDragScrolled = false

const onTableMouseDown = (e: MouseEvent) => {
    if (!props.dragScroll || e.button !== 2 || !dtableRef.value) return

    const target = e.target as HTMLElement | null
    if (target?.closest('input, textarea, select, button, [contenteditable="true"]')) {
        return
    }

    isRightDragging.value = true
    hasDragScrolled = false
    dragStartX = e.clientX
    dragStartY = e.clientY
    lastMouseX = e.clientX
    lastMouseY = e.clientY

    if (import.meta.client) {
        window.addEventListener('mousemove', onTableMouseMove, { passive: false })
        window.addEventListener('mouseup', onTableMouseUp)
    }
}

const onTableMouseMove = (e: MouseEvent) => {
    if (!isRightDragging.value || !dtableRef.value) return

    const deltaX = e.clientX - lastMouseX
    const deltaY = e.clientY - lastMouseY

    // Determine if drag threshold is passed from original click position
    if (!hasDragScrolled) {
        if (Math.abs(e.clientX - dragStartX) > 4 || Math.abs(e.clientY - dragStartY) > 4) {
            hasDragScrolled = true
        }
    }



    if (hasDragScrolled) {
        e.preventDefault()
    }

    // Scroll by the step delta directly so there is zero deadzone / lag when reversing direction after hitting a boundary
    dtableRef.value.scrollLeft -= deltaX
    dtableRef.value.scrollTop -= deltaY

    lastMouseX = e.clientX
    lastMouseY = e.clientY
}

const onTableMouseUp = (e: MouseEvent) => {
    if (e.button === 2) {
        isRightDragging.value = false
        if (import.meta.client) {
            window.removeEventListener('mousemove', onTableMouseMove)
            window.removeEventListener('mouseup', onTableMouseUp)
            if (hasDragScrolled) {
                window.getSelection()?.removeAllRanges()
            }
        }
    }


}

const onTableContextMenu = (e: MouseEvent) => {
    if (props.dragScroll && hasDragScrolled) {
        e.preventDefault()
        e.stopPropagation()
        hasDragScrolled = false
        return
    }
}

onBeforeUnmount(() => {
    if (import.meta.client) {
        window.removeEventListener('mousemove', onTableMouseMove)
        window.removeEventListener('mouseup', onTableMouseUp)
    }
})

const handleRowContextMenu = (event: MouseEvent, item: T) => {
    if (props.dragScroll && hasDragScrolled) {
        event.preventDefault()
        event.stopPropagation()
        hasDragScrolled = false
        return
    }
    if (props.rowActions || hasRowContextMenuListener.value) {
        event.preventDefault()
        let x = event.clientX
        let y = event.clientY
        if (import.meta.client) {
            const menuWidth = 180
            const menuHeight = 150
            if (x + menuWidth > window.innerWidth) {
                x = Math.max(10, x - menuWidth)
            }
            if (y + menuHeight > window.innerHeight) {
                y = Math.max(10, y - menuHeight)
            }
        }
        contextMenuPos.value = { x, y }
        contextMenuItem.value = item as any
        emit('row-contextmenu', { event, item })
    }
}

const closeContextMenu = () => {
    contextMenuPos.value = null
    contextMenuItem.value = null
}

const isSelectable = computed(() => {
    return props.selectable
})

const selectedRows = ref<T[]>([]) as Ref<T[]>

const getItemKey = (item: any) => {
    if (!item || typeof item !== 'object') return null
    if (props.rowKey && item[props.rowKey] !== undefined) return item[props.rowKey]
    if (item.id !== undefined) return item.id
    return null
}

const isSelected = (item: T) => {
    if (!item) return false
    const key = getItemKey(item)
    if (key !== null) {
        return selectedRows.value.some(r => getItemKey(r) === key)
    }
    return selectedRows.value.includes(item)
}

const toggleSelectRow = (item: T) => {
    if (!item) return
    const key = getItemKey(item)
    const idx = key !== null
        ? selectedRows.value.findIndex(r => getItemKey(r) === key)
        : selectedRows.value.indexOf(item)

    if (idx > -1) {
        selectedRows.value.splice(idx, 1)
    } else {
        selectedRows.value.push(item)
    }
    emit('selection-change', [...selectedRows.value])
}

const isAllSelected = computed(() => {
    if (props.data.length === 0) return false
    return props.data.every(item => isSelected(item))
})

const toggleSelectAll = () => {
    if (isAllSelected.value) {
        // Deselect all on current page
        const pageKeys = new Set(props.data.map(d => getItemKey(d) ?? d))
        selectedRows.value = selectedRows.value.filter(item => !pageKeys.has(getItemKey(item) ?? item))
    } else {
        // Select all on current page
        props.data.forEach(item => {
            if (!isSelected(item)) {
                selectedRows.value.push(item)
            }
        })
    }
    emit('selection-change', [...selectedRows.value])
}

const emitDeleteSelected = () => {
    emit('delete-selected', [...selectedRows.value])
}

const clearSelection = () => {
    selectedRows.value = []
    emit('selection-change', [])
}

defineExpose({
    clearSelection,
    toggleSelectRow,
    isSelected,
    selectedRows,
    openContextMenu: handleRowContextMenu,
    closeContextMenu
})

const changePage = (page: number) => {
    if (page >= 1 && page <= props.totalPages) {
        emit('paginate', page)
    }
}

const visiblePages = computed(() => {
    const pages: (number | string)[] = []
    const maxVisible = 7
    const current = props.currentPage
    const total = props.totalPages || 1

    if (total <= maxVisible) {
        for (let i = 1; i <= total; i++) {
            pages.push(i)
        }
    }

 else {
        // Always include page 1
        pages.push(1)

        if (current <= 4) {
            pages.push(2, 3, 4, 5)
            pages.push('...')
            pages.push(total)
        } else if (current >= total - 3) {
            pages.push('...')
            for (let i = total - 4; i <= total; i++) {
                pages.push(i)
            }
        } else {
            pages.push('...')
            pages.push(current - 1, current, current + 1)
            pages.push('...')
            pages.push(total)
        }
    }



    return pages
})

const emitSort = (col: Column<T>) => emit('sort', col)

const translateDateFormat = (format: string): string => {
    let f = format
    f = f.replace(/yyyy/g, 'YYYY').replace(/yy/g, 'YY')
    f = f.replace(/dd/g, 'DD').replace(/d/g, 'D')
    f = f.replace(/hh/g, 'HH').replace(/h/g, 'H')
    f = f.replace(/ii/g, 'mm').replace(/i/g, 'm')
    f = f.replace(/mm/g, 'MM').replace(/m/g, 'M')
    return f
}

const getCellValue = (item: T, col: Column<T>) => {
    let val: any = item[col.key]
    if (val === null || val === undefined) return ''

    let dateFormat = col.format
    if (!dateFormat && col.key === 'created_at') {
        dateFormat = 'YYYY/MM/DD'
    }

    if (dateFormat) {
        const d = dayjs(val)
        if (d.isValid()) {
            val = d.format(translateDateFormat(dateFormat))
        }
    }



    let limit: number | undefined = props.truncateLimit
    if (col.truncateLimit !== undefined) {
        if (typeof col.truncateLimit === 'number') {
            limit = col.truncateLimit
        } else if (col.truncateLimit === false) {
            limit = undefined
        }
    }



    if (limit && limit > 0) {
        const str = String(val)
        if (str.length > limit) {
            return str.slice(0, limit) + '...'
        }
    }


    return val
}

const ariaSortFor = (col: Column<T>) => {
    if (props.sortBy !== col.key) return 'none'
    return props.sortDirection === 'asc' ? 'ascending' : 'descending'
}

const getHeaderLabel = (col: Column<T>) => {
    const label = col.label || ''
    if (label.length > 150) {
        return label.slice(0, 150) + '...'
    }
    return label
}

const DEFAULT_COL_MIN_WIDTH = 150

const getColWidth = (c: Column<T>) => {
    if (c.width) return c.width
    if (c.fitHeader) {
        const charCount = c.label ? c.label.length : 0
        const extraIconWidth = (hasHeaderMenu(c) || canSort(c)) ? 24 : 0
        const estimatedWidth = (charCount * 9) + extraIconWidth + 48
        return `${Math.max(64, Math.round(estimatedWidth))}px`
    }
    // fixed=false: use minmax so columns have a guaranteed minimum width,
    // causing the row to exceed 100% and trigger horizontal scrolling.
    if (!props.fixed || isAnyColumnFrozen.value) {
        return `minmax(${DEFAULT_COL_MIN_WIDTH}px, 1fr)`
    }
    return '1fr'
}

// Builds the shared grid-template-columns used by the header row and every
// body row so columns line up perfectly on desktop.
const gridStyle = computed(() => {
    const isVisibleAt = (col: Column<T>, bp: Breakpoint | null) => {
        if (!col.hideOn) return true
        if (bp === null) return false

        const bpLevels = { sm: 1, md: 2, lg: 3, xl: 4, '2xl': 5 }
        const colLevel = bpLevels[col.hideOn]
        const currentLevel = bpLevels[bp]
        return currentLevel >= colLevel
    }

    const buildColumnsStyle = (bp: Breakpoint | null) => {
        const cols = props.columns
            .filter(c => isVisibleAt(c, bp))
            .map(getColWidth)
            .join(' ')
        if (isSelectable.value) {
            return `48px ${cols}`
        }
        return cols || '1fr'
    }

    return {
        '--dtable-columns': buildColumnsStyle(null),
        '--dtable-columns-sm': buildColumnsStyle('sm'),
        '--dtable-columns-md': buildColumnsStyle('md'),
        '--dtable-columns-lg': buildColumnsStyle('lg'),
        '--dtable-columns-xl': buildColumnsStyle('xl'),
        '--dtable-columns-2xl': buildColumnsStyle('2xl')
    }
})

const getHideClass = (col: Column<T>) => {
    if (!col.hideOn) return ''
    return `hide-on-${col.hideOn}`
}

const getInitialFrozen = () => {
    return props.columns
        .filter(c => c.frozen || c.fixed === 'right' || c.fixed === 'left' || c.fixed === true || c.sticky)
        .map(c => String(c.key))
}

const frozenColumns = ref<string[]>(getInitialFrozen())
const isColumnFrozen = (key: string) => frozenColumns.value.includes(key)

const toggleFreezeColumn = (key: string) => {
    updateColumnWidths()
    const idx = frozenColumns.value.indexOf(key)
    if (idx > -1) {
        frozenColumns.value.splice(idx, 1)
    } else {
        frozenColumns.value.push(key)
    }
    nextTick(() => {
        updateColumnWidths()
    })
}

const isAnyColumnFrozen = computed(() => frozenColumns.value.length > 0)

const checkboxStickyStyle = computed((): CSSProperties => {
    if (!isAnyColumnFrozen.value) return {}
    return {
        position: 'sticky',
        left: 0,
        zIndex: 3,
        backgroundColor: 'var(--dt-sticky-head-bg, var(--bg-card))'
    }
})

const columnWidthsMap = ref<Record<string, number>>({})

const updateColumnWidths = () => {
    if (!import.meta.client) return
    const cells = document.querySelectorAll('.dtable__row--head .dtable__cell[data-col-key]')
    cells.forEach((cell) => {
        const key = cell.getAttribute('data-col-key')
        if (key) {
            columnWidthsMap.value[key] = (cell as HTMLElement).offsetWidth || 120
        }
    }

)
}

watch(() => props.loading, (isLoading) => {
    if (isLoading && dtableRef.value) {
        dtableRef.value.scrollLeft = 0
        dtableRef.value.scrollTop = 0
    }
})

onMounted(() => {
    updateColumnWidths()
    if (props.loading && dtableRef.value) {
        dtableRef.value.scrollLeft = 0
        dtableRef.value.scrollTop = 0
    }
})

const isRightFrozen = (col: Column<any>): boolean => {
    if (col.frozen === 'right' || col.fixed === 'right' || col.sticky === 'right') return true
    if (col.frozen === 'left' || col.fixed === 'left' || col.sticky === 'left') return false
    const index = props.columns.findIndex(c => c.key === col.key)
    if (index === -1) return false
    return index >= Math.floor(props.columns.length / 2)
}

const getFrozenStyle = (col: Column<any>): CSSProperties => {
    const colKey = String(col.key)
    if (!isColumnFrozen(colKey)) return {}

    const index = props.columns.findIndex(c => c.key === col.key)
    if (index === -1) return {}

    if (isRightFrozen(col)) {
        let rightOffset = 0
        const totalCols = props.columns.length
        for (let i = totalCols - 1; i > index; i--) {
            const nextCol = props.columns[i]
            if (!nextCol) continue
            const nextKey = String(nextCol.key)
            if (isColumnFrozen(nextKey)) {
                const measuredWidth = columnWidthsMap.value[nextKey]
                if (measuredWidth) {
                    rightOffset += measuredWidth
                } else {
                    const widthStr = nextCol.width ? String(nextCol.width) : '120px'
                    rightOffset += parseInt(widthStr) || 120
                }
            }
        }

        return {
            position: 'sticky',
            right: `${rightOffset}px`,
            zIndex: 3,
            backgroundColor: 'var(--dt-sticky-head-bg, var(--bg-card))'
        }
    }

 else {
        let leftOffset = 0
        if (isSelectable.value) {
            leftOffset += 48
        }

        for (let i = 0; i < index; i++) {
            const prevCol = props.columns[i]
            if (!prevCol) continue
            const prevKey = String(prevCol.key)
            if (isColumnFrozen(prevKey)) {
                const measuredWidth = columnWidthsMap.value[prevKey]
                if (measuredWidth) {
                    leftOffset += measuredWidth
                } else {
                    const widthStr = prevCol.width ? String(prevCol.width) : '120px'
                    leftOffset += parseInt(widthStr) || 120
                }
            }
        }

        return {
            position: 'sticky',
            left: `${leftOffset}px`,
            zIndex: 3,
            backgroundColor: 'var(--dt-sticky-head-bg, var(--bg-card))'
        }
    }


}

const getColumnHeaderActions = (col: Column<T>): ColumnHeaderAction[] => {
    if (col.headerActions && col.headerActions.length > 0) return col.headerActions
    if (col.tools && col.tools.length > 0) return col.tools
    return []
}

const canSort = (col: Column<T>) => !!(col.sortable || getColumnHeaderActions(col).includes('sort'))
const canFreeze = (col: Column<T>) => getColumnHeaderActions(col).includes('freeze')
const hasHeaderMenu = (col: Column<T>) => getColumnHeaderActions(col).length > 0

const getHeaderOptions = (col: Column<T>) => {
    const actions = getColumnHeaderActions(col)
    const isFrozen = isColumnFrozen(String(col.key))
    const options: any[] = []

    if (actions.includes('sort')) {
        options.push(
            {
                label: 'Sort Ascending',
                icon: 'sort-by-up-02',
                selected: props.sortBy === col.key && props.sortDirection === 'asc',
                onClick: () => {
                    emit('sort', { ...col, forcedDirection: 'asc' })
                }
            },
            {
                label: 'Sort Descending',
                icon: 'sort-by-down-02',
                selected: props.sortBy === col.key && props.sortDirection === 'desc',
                onClick: () => {
                    emit('sort', { ...col, forcedDirection: 'desc' })
                }
            }
        )
    }

    if (actions.includes('sort') && actions.includes('freeze')) {
        options.push({})
    }

    if (actions.includes('freeze')) {
        options.push({
            label: isFrozen ? 'Unfreeze Column' : 'Freeze Column',
            icon: 'pin',
            onClick: () => {
                toggleFreezeColumn(String(col.key))
            }
        })
    }

    return options
}
</script>

<style lang="scss" scoped>
$dt-breakpoint: 768px;

// Responsive hide helper classes
.hide-on-sm {
    @media (max-width: 639px) {
        display: none !important;
    }
}

.hide-on-md {
    @media (max-width: 767px) {
        display: none !important;
    }
}

.hide-on-lg {
    @media (max-width: 1023px) {
        display: none !important;
    }
}

.hide-on-xl {
    @media (max-width: 1279px) {
        display: none !important;
    }
}

.hide-on-2xl {
    @media (max-width: 1535px) {
        display: none !important;
    }
}

@mixin visually-hidden-on-mobile {
    @media (max-width: #{$dt-breakpoint - 1px}) {
        .dtable--responsive & {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
    }


}

// Neutral wrapper — no overflow, so position:sticky on the header row
// works against the window scroll, not a nested scroll container.
.dtable-wrapper {
    width: 100%;
    min-width: 0;
    border-radius: 0.75rem;
}

.dtable {
    width: 100%;
    // min-width: 0 prevents this flex item from expanding beyond its flex parent.
    // The parent layout (main.flex-1) must also have min-width: 0 for the chain to work.
    min-width: 0;
    font-size: 0.875rem;
    border-radius: 0.75rem;
    // overflow-x: auto lives here. Because .dtable has NO height constraint it grows to
    // full content height and never creates a vertical scrollbar — window handles vertical
    // scroll. position:sticky therefore sticks relative to the viewport, not .dtable.
    overflow-x: auto;

    &--loading {
        overflow: hidden !important;
        overflow-x: hidden !important;
        overflow-y: hidden !important;
        touch-action: none;
        overscroll-behavior: none;
    }

    &--fixed {
        overflow-x: hidden !important;

        .dtable__inner {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
        }

        .dtable__row {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
        }

        .dtable__cell {
            min-width: 0 !important;
        }
    }



    &--sticky-header {
        // container-scroll model: .dtable itself scrolls vertically within max-height.
        // This makes position:sticky reliable — the sticky element is scoped to THIS
        // container which actually scrolls vertically, so 'top: 0' works perfectly.
        // overflow-x: auto (already on .dtable) + overflow-y: auto = full scroll.
        overflow-y: auto;
        max-height: var(--dt-max-height, calc(100vh - 10rem));

        .dtable__row--head {
            position: sticky;
            top: 0; // top of THIS container, never hides data rows
            z-index: 10;
            background-color: var(--dt-sticky-head-bg, var(--bg-card)) !important;
            border-bottom: 1px solid var(--border-default);
        }
    }



    &--is-dragging {
        cursor: grabbing !important;
        user-select: none !important;

        * {
            cursor: grabbing !important;
            user-select: none !important;
        }
    }



    &__selection-bar {
        position: fixed;
        bottom: 2.5rem;
        left: 50%;
        transform: translateX(-50%);
        z-index: 50;
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.625rem 1.25rem;
        padding-right: 0.625rem;
        border-radius: 9999px;
        background-color: #161920 !important;
        border: 1px solid #272b34 !important;
        box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.06);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        color: #ffffff;
        animation: dtable-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        max-width: 90vw;
        width: max-content;
    }

    &__selection-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding-left: 0.25rem;
    }

    &__selection-count {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.25rem;
        height: 1.25rem;
        border-radius: 9999px;
        background-color: #10b981;
        font-size: 0.75rem;
        font-weight: 700;
        color: #ffffff;
    }

    &__selection-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: #cbd5e1;
    }

    &__selection-divider {
        width: 1px;
        height: 1rem;
        background-color: #272b34 !important;
    }

    &__selection-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    &__selection-clear-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.375rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        color: #94a3b8;
        background: transparent;
        border: none;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
            color: #ffffff;
            background-color: rgba(255, 255, 255, 0.1) !important;
        }
    }



    // Light mode design system
    --dt-text: #334155; // slate-700
    --dt-text-muted: #64748b; // slate-500 (slate-455)
    --dt-accent: #059669; // emerald-600
    --dt-sort-icon-inactive: #cbd5e1; // slate-300
    --dt-head-bg: transparent;
    --dt-sticky-head-bg: var(--bg-card);
    --dt-sk-from: rgba(15, 23, 42, 0.08);
    --dt-sk-to: rgba(15, 23, 42, 0.03);



    color: var(--dt-text);

    &__inner {
        display: flex;
        flex-direction: column;
        background: transparent;
        border: 0;
        border-radius: 0.75rem;
        overflow: visible; // Allow tooltips/hover cards to render correctly outside
        min-width: 100%;
        width: 100%;

        // Enabled when fixed=false or any column is frozen.
        // width: max-content expands the rows beyond the container, triggering
        // the parent .dtable's overflow-x: auto to show a horizontal scrollbar.
        &--scrollable {
            width: max-content;

            @media (max-width: #{$dt-breakpoint - 1px}) {
                .dtable--responsive & {
                    width: 100% !important;
                    max-width: 100% !important;
                }
            }
        }
    }



    // ---- ROW: table row on desktop, card on mobile ----
    &__row {
        display: grid;
        grid-template-columns: var(--dtable-columns);

        @media (min-width: 640px) {
            grid-template-columns: var(--dtable-columns-sm, var(--dtable-columns));
        }

        @media (min-width: 768px) {
            grid-template-columns: var(--dtable-columns-md, var(--dtable-columns-sm, var(--dtable-columns)));
        }

        @media (min-width: 1024px) {
            grid-template-columns: var(--dtable-columns-lg, var(--dtable-columns-md, var(--dtable-columns-sm, var(--dtable-columns))));
        }

        @media (min-width: 1280px) {
            grid-template-columns: var(--dtable-columns-xl, var(--dtable-columns-lg, var(--dtable-columns-md, var(--dtable-columns-sm, var(--dtable-columns)))));
        }

        @media (min-width: 1536px) {
            grid-template-columns: var(--dtable-columns-2xl, var(--dtable-columns-xl, var(--dtable-columns-lg, var(--dtable-columns-md, var(--dtable-columns-sm, var(--dtable-columns))))));
        }

        transition: background-color 0.15s ease;

        &--head {
            background-color: var(--dt-head-bg, transparent);
            border-top-left-radius: 0.75rem;
            border-top-right-radius: 0.75rem;

            @media (max-width: #{$dt-breakpoint - 1px}) {
                .dtable--responsive & {
                    display: none !important;
                }
            }

            .dtable__cell:first-child {
                border-top-left-radius: 0.75rem;
            }

            .dtable__cell:last-child {
                border-top-right-radius: 0.75rem;
            }
        }

        &:last-child:not(&--head) {
            border-bottom-left-radius: 0.75rem;
            border-bottom-right-radius: 0.75rem;

            .dtable__cell:first-child {
                border-bottom-left-radius: 0.75rem;
            }

            .dtable__cell:last-child {
                border-bottom-right-radius: 0.75rem;
            }
        }

        &--empty {
            grid-template-columns: 1fr;
        }

        // Mobile: reflow every row into a stacked card
        @media (max-width: #{$dt-breakpoint - 1px}) {
            .dtable--responsive & {
                grid-template-columns: 1fr;
                gap: 0.5rem;
                padding: 1rem 1.25rem;
                background-color: var(--bg-card);
                border: 1px solid var(--border-default);
                border-radius: 0.75rem;
                margin-bottom: 0.75rem;

                &--empty {
                    padding: 0;
                    background-color: transparent;
                    border: none;
                    border-radius: 0;
                    margin-bottom: 0;
                }
            }
        }
    }



    // ---- CELL ----
    &__cell {
        display: flex;
        align-items: center;
        padding: 1rem;
        min-width: 0;

        &--left {
            justify-content: flex-start;
            text-align: left;
        }

        &--center {
            justify-content: center;
            text-align: center;
        }

        &--right {
            justify-content: flex-end;
            text-align: right;
        }

        &--head {
            font-size: 0.75rem;
            font-weight: 500;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            color: var(--dt-text-muted);
            user-select: none;
        }

        &--sortable {
            &:focus-visible {
                background-color: rgba(248, 250, 252, 0.4);
                outline: 2px solid var(--dt-accent);
                outline-offset: -2px;
            }

            :global(.dark) & {
                &:focus-visible {
                    background-color: rgba(30, 41, 59, 0.35);
                }
            }

            &:hover .dtable__sort-icon:not(.dtable__sort-icon--active) {
                color: var(--dt-text-secondary);
            }
        }

        &--empty {
            padding: 3rem 1rem;
            border-right: 0;
        }

        &--selection {
            justify-content: center;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
            width: 48px;
            min-width: 48px;

            @media (max-width: #{$dt-breakpoint - 1px}) {
                .dtable--responsive & {
                    justify-content: flex-start !important;
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 0.75rem;
                    margin-bottom: 0.5rem;

                    :global(.dark) & {
                        border-bottom-color: #1e293b;
                    }

                    &::before {
                        content: "Select" !important;
                        font-size: 0.7rem;
                        font-weight: 600;
                        text-transform: uppercase;
                        color: var(--dt-text-muted);
                        margin-right: auto;
                    }
                }
            }
        }

        &--actions {
            padding-left: 0.5rem;
            padding-right: 0.5rem;

            @media (min-width: #{$dt-breakpoint}) {
                min-width: 80px;
            }

            @media (max-width: #{$dt-breakpoint - 1px}) {
                .dtable--responsive & {
                    border-top: 1px solid #e2e8f0;

                    :global(.dark) & {
                        border-top-color: #1e293b;
                    }

                    border-radius: 0;
                    padding-top: 0.75rem;
                    margin-top: 0.5rem;
                    background-color: transparent;
                }
            }
        }

        &--hidden-mobile {
            @media (max-width: #{$dt-breakpoint - 1px}) {
                .dtable--responsive & {
                    display: none !important;
                }
            }
        }

        &--desktop-only {
            @media (max-width: #{$dt-breakpoint - 1px}) {
                display: none !important;
            }
        }

        // Mobile: no borders, label + value stacked as a mini row, no head cells here
        @media (max-width: #{$dt-breakpoint - 1px}) {
            .dtable--responsive & {
                padding: 0;
                border-right: 0;
                justify-content: space-between;
                gap: 1rem;
                text-align: right;

                &::before {
                    content: attr(data-label);
                    flex-shrink: 0;
                    font-size: 0.7rem;
                    font-weight: 600;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                    color: var(--dt-text-muted);
                    text-align: left;
                }

                &--empty {
                    padding: 0;

                    &::before {
                        content: none;
                    }
                }
            }
        }
    }



    &__responsive-slot {
        width: 100%;
        min-width: 0;

        @media (min-width: #{$dt-breakpoint}) {
            display: none !important;
        }
    }



    &__head-inner {
        display: flex;
        align-items: center;
        width: 100%;
        gap: 0.375rem;
        min-width: 0;

        &--left {
            justify-content: space-between;
        }

        &--center {
            justify-content: center;
        }

        &--right {
            justify-content: flex-end;
        }
    }



    &__head-label {
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;

        &--wrap {
            white-space: normal !important;
            word-break: normal !important;
            overflow-wrap: break-word !important;
            text-overflow: clip !important;
        }
    }



    &__sort-icon {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
        font-size: 14px;
        color: var(--dt-sort-icon-inactive);
        transition: color 0.15s ease;

        &--active {
            color: var(--dt-accent);
        }
    }



    // ---- Skeleton loading ----
    &__skeleton-bar {
        display: block;
        height: 0.85rem;
        width: 70%;
        border-radius: 4px;
        background-color: var(--dt-sk-from, rgba(15, 23, 42, 0.08));
        animation: dtable-pulse 1.6s ease-in-out infinite;
    }

    // ---- Empty state ----
    &__empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 3rem 1rem;
        width: 100%;
    }

    &__empty-icon {
        width: 32px;
        height: 32px;
        color: var(--dt-text-muted);
        margin-bottom: 0.75rem;
        opacity: 0.6;
    }

    &__empty-title {
        font-weight: 600;
        color: var(--dt-text);
        margin: 0;
    }

    &__empty-subtitle {
        font-size: 0.75rem;
        color: var(--dt-text-muted);
        margin: 0.25rem 0 0;
        max-width: 22rem;
    }

    &__cell-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
        display: block;

        .dtable__cell--center & {
            text-align: center;
        }

        .dtable__cell--right & {
            text-align: right;
        }

        .dtable__cell--left & {
            text-align: left;
        }
    }


}

// Dark mode overrides (defined at top-level to compile correctly as .dark .dtable)
:global(.dark) .dtable {
    --dt-text: #cbd5e1; // slate-300
    --dt-text-muted: #64748b; // slate-500
    --dt-accent: #34d399; // emerald-400
    --dt-sort-icon-inactive: #334155; // slate-700
    --dt-head-bg: transparent;
    --dt-sticky-head-bg: var(--bg-card);
    --dt-sk-from: rgba(255, 255, 255, 0.08); // bright clean skeleton base
    --dt-sk-to: rgba(255, 255, 255, 0.18); // bright shimmer pulse
}

// Dark mode: floating selection bar
:global(.dark) .dtable__selection-bar {
    background-color: #161920 !important;
    border-color: #272b34 !important;
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.06);
}

:global(.dark) .dtable__selection-divider {
    background-color: #272b34 !important;
}

:global(.dark) .dtable__selection-clear-btn:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
}

// Dark mode: mobile card rows
@media (max-width: 767px) {
    :global(.dark) .dtable--responsive .dtable__row:not(.dtable__row--head):not(.dtable__row--empty):not(.dtable__row--skeleton) {
        background-color: var(--bg-card);
        border-color: var(--border-default);
    }
}

@keyframes dtable-pulse {

    0%,
    100% {
        background-color: var(--dt-sk-from, rgba(15, 23, 42, 0.08));
    }

    50% {
        background-color: var(--dt-sk-to, rgba(15, 23, 42, 0.03));
    }
}

@keyframes dtable-slide-up {
    from {
        transform: translate(-50%, 1rem);
        opacity: 0;
    }

    to {
        transform: translate(-50%, 0);
        opacity: 1;
    }
}

// Animated row transitions
.dtable__rows-container {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.dtable-row-move {
    transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1) !important;
}

.dtable-row-enter-active,
.dtable-row-leave-active {
    transition: opacity 0.25s ease, transform 0.25s ease;
}

.dtable-row-enter-from,
.dtable-row-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}
</style>