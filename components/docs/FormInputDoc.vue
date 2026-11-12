<template>
  <div class="space-y-12">
    <!-- Header Section -->
    <div class="border-b border-slate-200 dark:border-theme-border pb-6">
      <div class="flex items-center gap-3 mb-2">
        <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          FormInput
        </h1>
        <span class="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 font-mono">
          &lt;FormInput /&gt;
        </span>
      </div>
      <p class="text-base text-slate-600 dark:text-slate-300 max-w-4xl leading-relaxed">
        Komponen input teks utama yang kaya fitur: dilengkapi validasi error, prefix/suffix dinamis dengan auto-padding, formatter teks otomatis (currency, phone, ucwords, dll), character counter, loading spinner, dan integrasi clipboard paste.
      </p>
    </div>

    <!-- ─── 1. Interactive Playground ──────────────────────────────────── -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Icon name="sliders-horizontal" class="text-emerald-500" />
          <span>Interactive Playground</span>
        </h2>
        <span class="text-xs text-slate-400">Ubah kontrol di samping untuk melihat perubahan real-time</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-2xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card p-6 shadow-xs">
        <!-- Live Preview Area -->
        <div class="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div class="space-y-2">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Preview Komponen</span>
            <div class="p-6 rounded-xl bg-slate-50 dark:bg-theme-app border border-slate-200/80 dark:border-theme-border flex flex-col items-center justify-center min-h-[160px]">
              <div class="w-full max-w-md">
                <FormInput
                  v-model="playground.value"
                  :label="playground.label"
                  :placeholder="playground.placeholder"
                  :prefixIcon="playground.prefixIcon || undefined"
                  :required="playground.required"
                  :disabled="playground.disabled"
                  :readonly="playground.readonly"
                  :clearable="playground.clearable"
                  :loading="playground.loading"
                  :error="playground.hasError ? playground.errorMessage : false"
                  :hint="playground.hint"
                  :maxLength="playground.maxLength ? Number(playground.maxLength) : undefined"
                  :formatters="playground.formatter !== 'none' ? playground.formatter : undefined"
                />
              </div>
            </div>
            <div class="text-xs text-slate-500 flex items-center justify-between px-1">
              <span>Nilai v-model:</span>
              <code class="font-mono text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-[280px]">
                {{ JSON.stringify(playground.value) }}
              </code>
            </div>
          </div>

          <!-- Dynamic Generated Code Snippet -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Generated Code</span>
              <UiButton
                variant="ghost"
                size="xs"
                icon="copy-01"
                @click="copyCode(generatedCode)"
              >
                {{ copied ? 'Tersalin!' : 'Salin Kode' }}
              </UiButton>
            </div>
            <pre class="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800"><code>{{ generatedCode }}</code></pre>
          </div>
        </div>

        <!-- Controls Area -->
        <div class="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-theme-border pt-6 lg:pt-0 lg:pl-6 space-y-4">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Konfigurasi Props</span>

          <div class="space-y-3">
            <FormInput v-model="playground.label" label="Label" />
            <FormInput v-model="playground.placeholder" label="Placeholder" />

            <div class="grid grid-cols-2 gap-3">
              <FormSelect
                v-model="playground.prefixIcon"
                label="Prefix Icon"
                :options="['user', 'mail-01', 'lock', 'search-01', 'call', 'link-01', 'calendar-03', 'globe', 'none']"
              />
              <FormSelect
                v-model="playground.formatter"
                label="Formatter"
                :options="['none', 'ucwords', 'ucfirst', 'currency', 'phone', 'letters', 'numeric', 'upper', 'code']"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <FormInput v-model="playground.maxLength" label="Max Length" type="number" placeholder="e.g. 20" />
              <FormInput v-model="playground.hint" label="Hint Text" placeholder="Helper message" />
            </div>

            <div class="grid grid-cols-2 gap-2 pt-1 text-xs">
              <FormSwitch v-model="playground.required" label="Required (*)" />
              <FormSwitch v-model="playground.clearable" label="Clearable" />
              <FormSwitch v-model="playground.disabled" label="Disabled" />
              <FormSwitch v-model="playground.readonly" label="Readonly" />
              <FormSwitch v-model="playground.loading" label="Loading" />
              <FormSwitch v-model="playground.hasError" label="Error State" />
            </div>

            <FormInput
              v-if="playground.hasError"
              v-model="playground.errorMessage"
              label="Error Message"
              placeholder="Pesan error validasi"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ─── 2. Showcase Examples ────────────────────────────────────────── -->
    <section class="space-y-6">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Icon name="grid-view" class="text-emerald-500" />
        <span>Koleksi Contoh Penggunaan</span>
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Example 1: Basic & Icons -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card space-y-4">
          <div>
            <h3 class="font-bold text-base text-slate-800 dark:text-white">1. Basic & Prefix Icons</h3>
            <p class="text-xs text-slate-500">Input standar dengan ikon pendukung di sebelah kiri.</p>
          </div>
          <div class="space-y-3">
            <FormInput
              v-model="examples.name"
              label="Nama Lengkap"
              placeholder="e.g. Ashta Dev"
              prefixIcon="user"
              required
              clearable
            />
            <FormInput
              v-model="examples.email"
              label="Email Address"
              placeholder="user@example.com"
              type="email"
              prefixIcon="mail-01"
              hint="Kami tidak akan membagikan email Anda ke pihak ketiga."
            />
          </div>
        </div>

        <!-- Example 2: Formatters in Action -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card space-y-4">
          <div>
            <h3 class="font-bold text-base text-slate-800 dark:text-white">2. Automatic Formatters</h3>
            <p class="text-xs text-slate-500">Format data secara otomatis saat pengguna mengetik.</p>
          </div>
          <div class="space-y-3">
            <FormInput
              v-model="examples.currency"
              label="Nominal Donasi (Currency)"
              placeholder="100.000"
              formatters="currency"
              prefixIcon="wallet-02"
              hint="Otomatis diformat dengan pemisah ribuan titik."
            />
            <FormInput
              v-model="examples.phone"
              label="Nomor HP (Phone Formatting)"
              placeholder="0812 3456 7890"
              formatters="phone"
              prefixIcon="call"
              hint="Otomatis menyisipkan spasi ITU-T E.164."
            />
          </div>
        </div>

        <!-- Example 3: Character Counter & Uppercase Code -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card space-y-4">
          <div>
            <h3 class="font-bold text-base text-slate-800 dark:text-white">3. Max Length & Uppercase Code</h3>
            <p class="text-xs text-slate-500">Menampilkan counter badge dan otomatis kapitalisasi kode.</p>
          </div>
          <div class="space-y-3">
            <FormInput
              v-model="examples.code"
              label="Kode Voucher (Code Format)"
              placeholder="VOUCHER-2026"
              formatters="code"
              maxLength="16"
              prefixIcon="tag-01"
              hint="Karakter otomatis menjadi huruf besar dan dibatasi 16 huruf."
            />
            <FormInput
              v-model="examples.bio"
              label="Headline Profil"
              placeholder="Tulis ringkasan singkat..."
              maxLength="30"
              clearable
            />
          </div>
        </div>

        <!-- Example 4: Validation Error & Suffix Actions -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card space-y-4">
          <div>
            <h3 class="font-bold text-base text-slate-800 dark:text-white">4. Validation Error & Suffix Buttons</h3>
            <p class="text-xs text-slate-500">Status error dan tombol aksi di ujung kanan input.</p>
          </div>
          <div class="space-y-3">
            <FormInput
              v-model="examples.errorInput"
              label="Username"
              error="Username ini sudah dipakai oleh pengguna lain!"
              prefixIcon="user-id-verification"
            />
            <FormInput
              v-model="examples.apiKey"
              label="API Key (With Suffix Action)"
              readonly
              :suffixes="[
                {
                  icon: 'copy-01',
                  title: 'Salin API Key',
                  click: () => copyApiKey()
                }
              ]"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ─── 3. Props & API Reference Table ──────────────────────────────── -->
    <section class="space-y-6">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Icon name="code-circle" class="text-emerald-500" />
        <span>Props & API Reference</span>
      </h2>

      <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card">
        <table class="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead class="bg-slate-50 dark:bg-theme-app border-b border-slate-200 dark:border-theme-border text-slate-700 dark:text-slate-200 uppercase font-semibold">
            <tr>
              <th class="px-4 py-3">Prop</th>
              <th class="px-4 py-3">Tipe</th>
              <th class="px-4 py-3">Default</th>
              <th class="px-4 py-3">Keterangan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-theme-border">
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">v-model</td>
              <td class="px-4 py-3 font-mono">string | number | null</td>
              <td class="px-4 py-3 font-mono">''</td>
              <td class="px-4 py-3">Nilai binding input dua arah.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">label</td>
              <td class="px-4 py-3 font-mono">string</td>
              <td class="px-4 py-3 font-mono">''</td>
              <td class="px-4 py-3">Label teks di atas input.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">prefixIcon</td>
              <td class="px-4 py-3 font-mono">string</td>
              <td class="px-4 py-3 font-mono">''</td>
              <td class="px-4 py-3">Nama ikon Hugeicons untuk ditampilkan di sisi kiri input (misal: 'user', 'mail-01').</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">formatters</td>
              <td class="px-4 py-3 font-mono">FormatterType | FormatterType[]</td>
              <td class="px-4 py-3 font-mono">[]</td>
              <td class="px-4 py-3">
                Aturan formatter otomatis: <code>'currency'</code>, <code>'phone'</code>, <code>'ucwords'</code>, <code>'ucfirst'</code>, <code>'letters'</code>, <code>'numeric'</code>, <code>'upper'</code>, <code>'lower'</code>, <code>'code'</code>.
              </td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">maxLength</td>
              <td class="px-4 py-3 font-mono">string | number</td>
              <td class="px-4 py-3 font-mono">undefined</td>
              <td class="px-4 py-3">Batas maksimal karakter. Otomatis menampilkan counter badge interaktif di kanan.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">required</td>
              <td class="px-4 py-3 font-mono">boolean</td>
              <td class="px-4 py-3 font-mono">false</td>
              <td class="px-4 py-3">Menandai input wajib dengan tanda bintang merah (*) di label.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">error</td>
              <td class="px-4 py-3 font-mono">string | boolean</td>
              <td class="px-4 py-3 font-mono">false</td>
              <td class="px-4 py-3">Memberi warna merah error pada input. Jika diisi teks, teks tersebut akan tampil di bawah input.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">clearable</td>
              <td class="px-4 py-3 font-mono">boolean</td>
              <td class="px-4 py-3 font-mono">false</td>
              <td class="px-4 py-3">Menampilkan tombol silang untuk menghapus isi teks secara instan saat input terisi.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">loading</td>
              <td class="px-4 py-3 font-mono">boolean</td>
              <td class="px-4 py-3 font-mono">false</td>
              <td class="px-4 py-3">Mengunci input dan menampilkan spinner loading teks secara elegan.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">suffixes</td>
              <td class="px-4 py-3 font-mono">Suffix[]</td>
              <td class="px-4 py-3 font-mono">[]</td>
              <td class="px-4 py-3">Array tombol/ikon kustom di sisi kanan input: <code>{ label, icon, click, title, disabled }</code>.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { toast } from 'vue-sonner'
import { copyToClipboard } from '~/utils/utils'

const copied = ref(false)

const playground = reactive({
  value: 'Ashta Developer',
  label: 'Nama Pengguna',
  placeholder: 'Masukkan nama Anda...',
  prefixIcon: 'user',
  formatter: 'none',
  maxLength: '25',
  hint: 'Gunakan nama lengkap yang valid.',
  required: true,
  disabled: false,
  readonly: false,
  clearable: true,
  loading: false,
  hasError: false,
  errorMessage: 'Nama tidak boleh kosong!'
})

const examples = reactive({
  name: '',
  email: '',
  currency: '1250000',
  phone: '081234567890',
  code: 'DISCOUNT-50',
  bio: 'Fullstack Vue & Nuxt Engineer',
  errorInput: 'admin',
  apiKey: 'nx_live_948f9328a9b34891b29a'
})

const copyApiKey = () => {
  copyToClipboard(examples.apiKey)
  toast.success('API Key berhasil disalin!')
}

const copyCode = async (code: string) => {
  await copyToClipboard(code)
  copied.value = true
  toast.success('Kode komponen tersalin!')
  setTimeout(() => { copied.value = false }, 2000)
}

const generatedCode = computed(() => {
  const parts: string[] = ['<FormInput']
  parts.push('  v-model="name"')
  if (playground.label) parts.push(`  label="${playground.label}"`)
  if (playground.placeholder) parts.push(`  placeholder="${playground.placeholder}"`)
  if (playground.prefixIcon && playground.prefixIcon !== 'none') parts.push(`  prefixIcon="${playground.prefixIcon}"`)
  if (playground.formatter && playground.formatter !== 'none') parts.push(`  formatters="${playground.formatter}"`)
  if (playground.maxLength) parts.push(`  :maxLength="${playground.maxLength}"`)
  if (playground.required) parts.push('  required')
  if (playground.clearable) parts.push('  clearable')
  if (playground.disabled) parts.push('  disabled')
  if (playground.readonly) parts.push('  readonly')
  if (playground.loading) parts.push('  loading')
  if (playground.hasError) parts.push(`  error="${playground.errorMessage}"`)
  if (playground.hint) parts.push(`  hint="${playground.hint}"`)
  parts.push('/>')
  return parts.join('\n')
})
</script>

