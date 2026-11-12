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
            <span class="text-slate-400">Nuxt UI</span>
            <span class="text-slate-300 dark:text-slate-600">/</span>
            <span class="text-slate-800 dark:text-white capitalize">
              {{ currentPath === '#form-input' ? 'FormInput Showcase' : 'Dashboard' }}
            </span>
          </div>
        </div>

        <!-- Right Action Controls -->
        <div class="flex items-center gap-2.5">
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
        <DocsFormInputDoc v-if="currentPath === '#form-input'" />

        <!-- ─── VIEW 2: Dashboard Overview ────────────────────────── -->
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
                Kumpulan komponen form, dialog modal cupertino depth layer (<code class="text-xs bg-slate-100 dark:bg-theme-input px-1.5 py-0.5 rounded">#stack</code>), icon Hugeicons, serta design tokens siap pakai untuk semua project Nuxt 3 & 4.
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
                  {{ copied ? 'Tersalin!' : 'Salin Konfigurasi' }}
                </UiButton>
                <UiButton
                  size="sm"
                  icon="pencil-edit-02"
                  variant="primary"
                  @click="handleMenuSelect('#form-input')"
                >
                  Buka FormInput Showcase
                </UiButton>
              </div>
            </div>
          </section>

          <!-- Component Highlights Grid -->
          <section class="space-y-6">
            <div>
              <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Icon name="grid-view" class="text-emerald-500" />
                <span>Navigasi Komponen</span>
              </h2>
              <p class="text-sm text-slate-500 dark:text-slate-400">
                Pilih menu di sidebar sebelah kiri untuk melihat showcase dan dokumentasi masing-masing komponen.
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
                    Showcase Aktif
                  </span>
                </div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  FormInput
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Dokumentasi lengkap, interactive playground real-time, contoh validasi, formatters (currency, phone, code), character counter, dan API props.
                </p>
              </div>

              <!-- Locked: UiModal -->
              <div class="p-6 rounded-2xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card opacity-70">
                <div class="flex items-center justify-between mb-3">
                  <div class="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 dark:bg-theme-input dark:text-slate-400 flex items-center justify-center text-xl">
                    <Icon name="modal" />
                  </div>
                  <span class="text-xs text-slate-400 flex items-center gap-1">
                    <Icon name="lock" class="text-xs" />
                    <span>Locked</span>
                  </span>
                </div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">UiModal</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Modal dialog & drawer dengan transisi cupertino stack depth (#stack) slot.
                </p>
              </div>

              <!-- Locked: UiButton -->
              <div class="p-6 rounded-2xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card opacity-70">
                <div class="flex items-center justify-between mb-3">
                  <div class="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 dark:bg-theme-input dark:text-slate-400 flex items-center justify-center text-xl">
                    <Icon name="cursor-pointer" />
                  </div>
                  <span class="text-xs text-slate-400 flex items-center gap-1">
                    <Icon name="lock" class="text-xs" />
                    <span>Locked</span>
                  </span>
                </div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">UiButton</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tombol multi-variant dengan built-in loading spinner, tooltip wrapper, dan icons.
                </p>
              </div>
            </div>
          </section>

          <!-- Utilities & Formatters Quick Overview -->
          <section class="space-y-6">
            <div>
              <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Icon name="code-circle" class="text-emerald-500" />
                <span>Formatters & Helpers Bawaan</span>
              </h2>
              <p class="text-sm text-slate-500 dark:text-slate-400">Tersedia otomatis di semua komponen dan halaman via Nuxt auto-import.</p>
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
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'

const { isDark, toggleTheme, initTheme } = useTheme()
const { isMinimized, initSidebar } = useSidebar()

const isSidebarOpen = ref(false)
const currentPath = ref('#dashboard')

onMounted(() => {
  initTheme()
  initSidebar()

  // Sync initial hash if present
  if (window.location.hash) {
    if (window.location.hash === '#form-input') {
      currentPath.value = '#form-input'
    } else {
      currentPath.value = '#dashboard'
    }
  }

  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#form-input') {
      currentPath.value = '#form-input'
    } else {
      currentPath.value = '#dashboard'
    }
  })
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
  toast.success('Konfigurasi berhasil disalin!')
  setTimeout(() => { copied.value = false }, 2000)
}
</script>
