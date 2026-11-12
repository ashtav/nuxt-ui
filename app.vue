<template>
  <div class="min-h-screen bg-slate-50 dark:bg-theme-app text-slate-900 dark:text-slate-100 transition-colors duration-200">
    <!-- Sidebar Component (Similar to Portal Sidebar) -->
    <Sidebar
      :isOpen="isSidebarOpen"
      :currentPath="currentPath"
      @close="isSidebarOpen = false"
      @select="handleMenuSelect"
    />

    <!-- Main Content Wrapper (shifts when sidebar is expanded/minimized) -->
    <div
      class="flex flex-col min-h-screen transition-all duration-300"
      :class="isMinimized ? 'md:pl-[4.7rem]' : 'md:pl-64'"
    >
      <!-- Top Navbar -->
      <header class="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-theme-border bg-white/80 dark:bg-theme-card/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Mobile Menu Toggle Button -->
          <button
            @click="isSidebarOpen = true"
            class="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-theme-hover cursor-pointer"
            aria-label="Open Sidebar"
          >
            <Icon name="menu-02" class="text-xl" />
          </button>

          <!-- Current Breadcrumb -->
          <div class="flex items-center gap-2 text-sm font-medium">
            <span class="text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200" @click="handleMenuSelect('#dashboard')">Nuxt UI</span>
            <span class="text-slate-300 dark:text-slate-600">/</span>
            <span class="text-slate-800 dark:text-white">
              {{ currentPageTitle }}
            </span>
          </div>
        </div>

        <!-- Right Action Controls -->
        <div class="flex items-center gap-2.5">
          <!-- Centralized Master Radius Switcher -->
          <div class="hidden sm:flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-theme-input border border-slate-200/80 dark:border-theme-border text-[11px]">
            <span class="px-1.5 text-slate-400 font-semibold">Radius:</span>
            <button
              v-for="r in radiusPresets"
              :key="r.value"
              type="button"
              @click="setRadius(r.value)"
              class="px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer"
              :class="radius === r.value
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-theme-hover'"
            >
              {{ r.label }}
            </button>
          </div>

          <a
            href="https://github.com/ashta-jb/nuxt-ui"
            target="_blank"
            rel="noopener noreferrer"
            class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-theme-input text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-theme-hover border border-slate-200/80 dark:border-theme-border transition-colors"
          >
            <Icon name="github" class="text-sm" />
            <span>GitHub</span>
          </a>

          <UiButton
            variant="ghost"
            size="sm"
            :icon="isDark ? 'sun-01' : 'moon-02'"
            @click="toggleTheme"
            tooltip="Toggle Light / Dark Mode"
          >
            {{ isDark ? 'Light' : 'Dark' }}
          </UiButton>
        </div>
      </header>

      <!-- Main Body Content Area -->
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- ─── VIEW 1: FormInput Showcase & Documentation ────────── -->
        <FormInputDoc v-if="currentPath === '#form-input'" />

        <!-- ─── VIEW 2: FormSearch Showcase & Documentation ───────── -->
        <FormSearchDoc v-else-if="currentPath === '#form-search'" />

        <!-- ─── VIEW 3: FormSelect Showcase & Documentation ───────── -->
        <FormSelectDoc v-else-if="currentPath === '#form-select'" />

        <!-- ─── VIEW 4: Dashboard Overview ────────────────────────── -->
        <div v-else class="space-y-12">
          <!-- Hero Section -->
          <section class="rounded-2xl p-6 sm:p-10 border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card shadow-xs">
            <div class="max-w-3xl space-y-4">
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                  Nuxt Layer v1.0.0
                </span>
                <span class="text-xs text-slate-400">Production-ready Components</span>
              </div>

              <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Universal Nuxt UI Layer
              </h1>
              <p class="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                A reusable library of form controls, Cupertino modal depth layers (<code class="text-xs bg-slate-100 dark:bg-theme-input px-1.5 py-0.5 rounded">#stack</code>), Hugeicons, and responsive design tokens ready for all Nuxt 3 &amp; 4 projects.
              </p>

              <div class="pt-2 flex flex-wrap items-center gap-3">
                <div class="flex items-center gap-2 bg-slate-100 dark:bg-theme-input px-3.5 py-2 rounded-lg text-xs font-mono border border-slate-200/80 dark:border-theme-border text-slate-700 dark:text-slate-200">
                  <span>extends: ['nuxt-ui']</span>
                </div>
                <UiButton
                  size="sm"
                  icon="copy-01"
                  variant="secondary"
                  @click="copySnippet"
                >
                  {{ copied ? 'Copied!' : 'Copy Configuration' }}
                </UiButton>
                <UiButton
                  size="sm"
                  icon="pencil-edit-02"
                  variant="primary"
                  @click="handleMenuSelect('#form-input')"
                >
                  Explore FormInput Showcase
                </UiButton>
              </div>
            </div>
          </section>

          <!-- Component Highlights Grid -->
          <section class="space-y-6">
            <div>
              <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Icon name="grid-view" class="text-emerald-500" />
                <span>Component Navigation</span>
              </h2>
              <p class="text-sm text-slate-500 dark:text-slate-400">
                Select any component from the sidebar menu to view its interactive showcase and full documentation.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Active Highlight: FormInput -->
              <div
                @click="handleMenuSelect('#form-input')"
                class="group p-6 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20 hover:border-emerald-500 transition-all duration-200 cursor-pointer shadow-xs"
              >
                <div class="flex items-center justify-between mb-3">
                  <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 flex items-center justify-center text-xl">
                    <Icon name="pencil-edit-02" />
                  </div>
                  <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    Active Showcase
                  </span>
                </div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  FormInput
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Full API reference, real-time playground, validation states, automatic formatters (currency, phone, code), character counter, and code generator.
                </p>
              </div>

              <!-- Active Highlight: FormSearch -->
              <div
                @click="handleMenuSelect('#form-search')"
                class="group p-6 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20 hover:border-emerald-500 transition-all duration-200 cursor-pointer shadow-xs"
              >
                <div class="flex items-center justify-between mb-3">
                  <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 flex items-center justify-center text-xl">
                    <Icon name="search-01" />
                  </div>
                  <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    Active Showcase
                  </span>
                </div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  FormSearch
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Debounced search emission, Enter-only search trigger mode, integrated loading spinner, instant clear action, and live event inspector.
                </p>
              </div>

              <!-- Active Highlight: FormSelect -->
              <div
                @click="handleMenuSelect('#form-select')"
                class="group p-6 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20 hover:border-emerald-500 transition-all duration-200 cursor-pointer shadow-xs"
              >
                <div class="flex items-center justify-between mb-3">
                  <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 flex items-center justify-center text-xl">
                    <Icon name="menu-square" />
                  </div>
                  <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    Active Showcase
                  </span>
                </div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  FormSelect
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Teleported combobox select with local &amp; server-side search, custom option creation (allowCustom), scoped slots, and primitive/object normalization.
                </p>
              </div>
            </div>
          </section>

          <!-- Utilities & Formatters Quick Overview -->
          <section class="space-y-6">
            <div>
              <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Icon name="code-circle" class="text-emerald-500" />
                <span>Built-in Formatters &amp; Utilities</span>
              </h2>
              <p class="text-sm text-slate-500 dark:text-slate-400">Available globally across all components and pages via Nuxt auto-imports.</p>
            </div>

            <div class="p-5 rounded-xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card">
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span class="text-xs text-slate-400 block">formatIDR(1250000)</span>
                  <span class="font-semibold text-emerald-600 dark:text-emerald-400">{{ formatIDR(1250000) }}</span>
                </div>
                <div>
                  <span class="text-xs text-slate-400 block">thousandFormat(2500000)</span>
                  <span class="font-semibold text-slate-700 dark:text-slate-200">{{ thousandFormat(2500000) }}</span>
                </div>
                <div>
                  <span class="text-xs text-slate-400 block">getInitials('Ashta Developer')</span>
                  <span class="font-semibold text-slate-700 dark:text-slate-200">{{ getInitials('Ashta Developer') }}</span>
                </div>
                <div>
                  <span class="text-xs text-slate-400 block">ucwords('hello world nuxt')</span>
                  <span class="font-semibold text-slate-700 dark:text-slate-200">{{ ucwords('hello world nuxt') }}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>

    <!-- Global Floating Providers -->
    <UiToaster />
    <UiConfirmDialog />
    <UiLoadingOverlay />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import FormInputDoc from './components/docs/FormInputDoc.vue'
import FormSearchDoc from './components/docs/FormSearchDoc.vue'
import FormSelectDoc from './components/docs/FormSelectDoc.vue'
import Sidebar from './components/Sidebar.vue'
import { copyToClipboard } from './utils/utils'

const { isDark, radius, toggleTheme, setRadius, initTheme } = useTheme()
const { isMinimized, initSidebar } = useSidebar()

const radiusPresets = [
  { label: '0', value: '0px' },
  { label: 'SM', value: '0.35rem' },
  { label: 'MD', value: '0.55rem' },
  { label: 'LG', value: '0.85rem' }
]

const isSidebarOpen = ref(false)
const currentPath = ref('#dashboard')

const validPaths = ['#dashboard', '#form-input', '#form-search', '#form-select']

const currentPageTitle = computed(() => {
  switch (currentPath.value) {
    case '#form-input':
      return 'FormInput Showcase'
    case '#form-search':
      return 'FormSearch Showcase'
    case '#form-select':
      return 'FormSelect Showcase'
    default:
      return 'Dashboard'
  }
})

const syncHash = () => {
  const hash = window.location.hash
  if (validPaths.includes(hash)) {
    currentPath.value = hash
  } else {
    currentPath.value = '#dashboard'
  }
}

onMounted(() => {
  initTheme()
  initSidebar()
  syncHash()
  window.addEventListener('hashchange', syncHash)
})

const handleMenuSelect = (path: string) => {
  currentPath.value = path
  window.location.hash = path
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const copied = ref(false)
const copySnippet = async () => {
  await copyToClipboard("export default defineNuxtConfig({\n  extends: ['nuxt-ui']\n})")
  copied.value = true
  toast.success('Configuration copied to clipboard!')
  setTimeout(() => { copied.value = false }, 2000)
}
</script>
