<template>
  <div class="min-h-screen bg-slate-50 dark:bg-theme-app text-slate-900 dark:text-slate-100 transition-colors duration-200">
    <!-- Navbar -->
    <header class="sticky top-0 z-40 border-b border-slate-200 dark:border-theme-border bg-white/80 dark:bg-theme-card/80 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            N
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-base tracking-tight">Nuxt UI</span>
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                Layer v1.0.0
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">Universal Form & Component Layer</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <UiButton
            variant="ghost"
            size="sm"
            :icon="isDark ? 'sun-01' : 'moon-02'"
            @click="toggleTheme"
            tooltip="Toggle Light / Dark Mode"
          >
            {{ isDark ? 'Light Mode' : 'Dark Mode' }}
          </UiButton>
        </div>
      </div>
    </header>

    <!-- Main Container -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <!-- Hero Section -->
      <section class="rounded-2xl p-6 sm:p-10 border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card shadow-xs">
        <div class="max-w-3xl space-y-4">
          <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Custom, Universal Nuxt UI Layer
          </h1>
          <p class="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Kumpulan komponen form battle-tested, modal cupertino depth layer (<code class="text-xs bg-slate-100 dark:bg-theme-input px-1.5 py-0.5 rounded">#stack</code>), icon system Hugeicons, serta design tokens siap pakai untuk semua project Nuxt 3 & 4.
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
          </div>
        </div>
      </section>

      <!-- Interactive Playground: Form Showcase -->
      <section class="space-y-6">
        <div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon name="pencil-edit-02" class="text-emerald-500" />
            <span>Form Components Showcase</span>
          </h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">Uji coba interaktif komponen form bawaan.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Text Input -->
          <div class="p-5 rounded-xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card space-y-3">
            <div class="text-xs font-semibold uppercase tracking-wider text-slate-400">FormInput</div>
            <FormInput
              v-model="formState.name"
              label="Full Name"
              placeholder="e.g. Ashta Dev"
              prefixIcon="user"
              required
              clearable
            />
            <p class="text-xs text-slate-500">Value: <code class="font-mono text-emerald-600 dark:text-emerald-400">{{ formState.name || '(empty)' }}</code></p>
          </div>

          <!-- Search Input -->
          <div class="p-5 rounded-xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card space-y-3">
            <div class="text-xs font-semibold uppercase tracking-wider text-slate-400">FormSearch</div>
            <FormSearch
              v-model="formState.search"
              placeholder="Search components, users..."
            />
            <p class="text-xs text-slate-500">Search value: <code class="font-mono text-emerald-600 dark:text-emerald-400">{{ formState.search || '(empty)' }}</code></p>
          </div>

          <!-- Select -->
          <div class="p-5 rounded-xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card space-y-3">
            <div class="text-xs font-semibold uppercase tracking-wider text-slate-400">FormSelect</div>
            <FormSelect
              v-model="formState.role"
              label="Select Role"
              :options="roleOptions"
              placeholder="Pilih Role"
            />
            <p class="text-xs text-slate-500">Selected: <code class="font-mono text-emerald-600 dark:text-emerald-400">{{ formState.role || '(none)' }}</code></p>
          </div>

          <!-- Phone Input -->
          <div class="p-5 rounded-xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card space-y-3">
            <div class="text-xs font-semibold uppercase tracking-wider text-slate-400">FormPhoneInput</div>
            <FormPhoneInput
              v-model="formState.phone"
              label="WhatsApp / Phone"
              placeholder="812 3456 7890"
            />
            <p class="text-xs text-slate-500">Phone value: <code class="font-mono text-emerald-600 dark:text-emerald-400">{{ formState.phone || '(empty)' }}</code></p>
          </div>

          <!-- Date Picker -->
          <div class="p-5 rounded-xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card space-y-3">
            <div class="text-xs font-semibold uppercase tracking-wider text-slate-400">FormDatePicker</div>
            <FormDatePicker
              v-model="formState.date"
              label="Birth Date"
              placeholder="Pilih Tanggal"
            />
            <p class="text-xs text-slate-500">Date value: <code class="font-mono text-emerald-600 dark:text-emerald-400">{{ formState.date || '(empty)' }}</code></p>
          </div>

          <!-- Switch & Slider -->
          <div class="p-5 rounded-xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card space-y-4">
            <div class="text-xs font-semibold uppercase tracking-wider text-slate-400">Switch & Slider</div>
            <FormSwitch
              v-model="formState.notify"
              label="Enable Email Notifications"
            />
            <FormSlider
              v-model="formState.volume"
              label="Volume / Progress"
              :min="0"
              :max="100"
            />
          </div>
        </div>
      </section>

      <!-- Interactive Playground: UI Components -->
      <section class="space-y-6">
        <div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon name="layers-01" class="text-emerald-500" />
            <span>UI Components & Feedback</span>
          </h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">Modal Cupertino Depth Stack, Global Confirm, Alert, dan Toaster.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Button Variants -->
          <div class="p-5 rounded-xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card space-y-3">
            <div class="text-xs font-semibold uppercase tracking-wider text-slate-400">UiButton Variants</div>
            <div class="flex flex-wrap gap-2">
              <UiButton variant="primary" icon="check-circle">Primary</UiButton>
              <UiButton variant="secondary" icon="settings-01">Secondary</UiButton>
              <UiButton variant="danger" icon="delete-02">Danger</UiButton>
              <UiButton variant="primary" :loading="buttonLoading" @click="testLoadingBtn">
                {{ buttonLoading ? 'Memproses...' : 'Klik Loading' }}
              </UiButton>
            </div>
          </div>

          <!-- Global Confirm & Alert -->
          <div class="p-5 rounded-xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card space-y-3">
            <div class="text-xs font-semibold uppercase tracking-wider text-slate-400">Global Feedback (ui.*)</div>
            <div class="flex flex-wrap gap-2">
              <UiButton variant="secondary" icon="alert-02" @click="triggerConfirm">
                ui.confirm()
              </UiButton>
              <UiButton variant="secondary" icon="notification-01" @click="triggerAlert">
                ui.alert()
              </UiButton>
              <UiButton variant="secondary" icon="toast" @click="triggerToast">
                toast.success()
              </UiButton>
            </div>
          </div>

          <!-- Cupertino Stack Modal Trigger -->
          <div class="p-5 rounded-xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card space-y-3">
            <div class="text-xs font-semibold uppercase tracking-wider text-slate-400">Cupertino Depth Modal</div>
            <p class="text-xs text-slate-500">Coba buka modal dengan fitur stacked sub-layer.</p>
            <UiButton variant="primary" icon="modal" @click="isModalOpen = true">
              Buka Modal (#stack)
            </UiButton>
          </div>
        </div>
      </section>

      <!-- Utilities & Formatters -->
      <section class="space-y-6">
        <div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon name="code-circle" class="text-emerald-500" />
            <span>Formatters & Helpers</span>
          </h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">Standard utility functions yang otomatis tersedia.</p>
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
    </main>

    <!-- Demo Modal with Cupertino Stack -->
    <UiModal
      v-model="isModalOpen"
      title="User Detail & Settings"
      description="Contoh implementasi UiModal dengan header actions dan stack view."
      size="lg"
      :actions="modalActions"
    >
      <div class="p-6 space-y-4">
        <p class="text-sm text-slate-600 dark:text-slate-300">
          Ini adalah konten dasar (Base Content Layer). Ketika tombol di bawah ditekan, layer sub-form akan meluncur di atasnya dengan efek kedalaman Cupertino (background layer mundur & meredup).
        </p>

        <div class="flex items-center gap-3 pt-2">
          <UiButton variant="secondary" icon="add-01" @click="isStackOpen = true">
            Buka Slide-over Sub Layer (#stack)
          </UiButton>
        </div>
      </div>

      <!-- Slide-over Stack Slot -->
      <template #stack v-if="isStackOpen">
        <div class="h-full flex flex-col bg-white dark:bg-theme-card">
          <div class="px-6 py-4 border-b border-slate-200 dark:border-theme-border flex items-center justify-between">
            <h3 class="font-semibold text-base">Sub-layer Form Editor</h3>
            <UiButton variant="ghost" size="xs" icon="cancel-01" @click="isStackOpen = false" />
          </div>
          <div class="p-6 space-y-4 flex-1 overflow-y-auto">
            <FormInput label="Sub Property Name" placeholder="e.g. Custom config" />
            <FormSelect label="Status" :options="['Active', 'Draft', 'Archived']" />
          </div>
          <div class="px-6 py-3 border-t border-slate-200 dark:border-theme-border flex justify-end gap-2 bg-slate-50 dark:bg-theme-input/40">
            <UiButton variant="secondary" size="sm" @click="isStackOpen = false">Batal</UiButton>
            <UiButton variant="primary" size="sm" @click="saveStack">Simpan Sub-layer</UiButton>
          </div>
        </div>
      </template>
    </UiModal>

    <!-- Global Floating Providers -->
    <UiToaster />
    <UiConfirmDialog />
    <UiLoadingOverlay />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { toast } from 'vue-sonner'

const { isDark, toggleTheme, initTheme } = useTheme()

onMounted(() => {
  initTheme()
})

const copied = ref(false)
const copySnippet = async () => {
  await copyToClipboard("export default defineNuxtConfig({\n  extends: ['nuxt-ui']\n})")
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

const formState = reactive({
  name: '',
  search: '',
  role: 'Developer',
  phone: '',
  date: '',
  notify: true,
  volume: 70
})

const roleOptions = ['Developer', 'Designer', 'Product Manager', 'QA Specialist']

const buttonLoading = ref(false)
const testLoadingBtn = () => {
  buttonLoading.value = true
  setTimeout(() => {
    buttonLoading.value = false
  }, 2000)
}

const triggerConfirm = async () => {
  const confirmed = await ui.confirm({
    title: 'Hapus Item Ini?',
    message: 'Apakah Anda yakin ingin menghapus data testing ini?',
    type: 'danger',
    textConfirm: 'Ya, Hapus'
  })
  if (confirmed) {
    toast.success('Item berhasil dihapus!')
  }
}

const triggerAlert = () => {
  ui.alert({
    title: 'Pemberitahuan Sistem',
    message: 'Ini adalah notifikasi dari helper ui.alert().',
    type: 'primary'
  })
}

const triggerToast = () => {
  toast.success('Pesan Toast Berhasil Muncul!')
}

const isModalOpen = ref(false)
const isStackOpen = ref(false)

const modalActions = [
  {
    label: 'Export',
    variant: 'secondary',
    onClick: () => toast.info('Export clicked!')
  }
]

const saveStack = () => {
  isStackOpen.value = false
  toast.success('Sub-layer tersimpan!')
}
</script>

