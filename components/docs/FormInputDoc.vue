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
        A versatile and feature-packed text input component supporting input validation, dynamic prefix/suffix slots with auto-padding, real-time formatters (currency, phone, ucwords, code), character counter, animated loading spinner, and clipboard paste integration.
      </p>
    </div>

    <!-- ─── 1. Interactive Playground ──────────────────────────────────── -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Icon name="sliders-horizontal" class="text-emerald-500" />
          <span>Interactive Playground</span>
        </h2>
        <span class="text-xs text-slate-400">Modify the controls on the right to see real-time updates</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-2xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card p-6 shadow-xs">
        <!-- Live Preview Area -->
        <div class="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div class="space-y-2">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Component Preview</span>
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
              <span>v-model value:</span>
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
                {{ copied ? 'Copied!' : 'Copy Code' }}
              </UiButton>
            </div>
            <pre class="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800"><code>{{ generatedCode }}</code></pre>
          </div>
        </div>

        <!-- Controls Area -->
        <div class="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-theme-border pt-6 lg:pt-0 lg:pl-6 space-y-4">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Props Configuration</span>

          <div class="space-y-3">
            <FormInput v-model="playground.label" label="Label" />
            <FormInput v-model="playground.placeholder" label="Placeholder" />

            <div class="grid grid-cols-2 gap-3">
              <FormSelect
                v-model="playground.prefixIcon"
                label="Prefix Icon"
                :options="iconOptions"
              />
              <FormSelect
                v-model="playground.formatter"
                label="Formatter"
                :options="formatterOptions"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <FormInput v-model="playground.maxLength" label="Max Length" type="number" placeholder="e.g. 20" />
              <FormInput v-model="playground.hint" label="Hint Text" placeholder="Helper message" />
            </div>

            <!-- Toggles with visible labels -->
            <div class="pt-2 border-t border-slate-100 dark:border-theme-border/60">
              <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">State Toggles</span>
              <div class="grid grid-cols-2 gap-3">
                <FormSwitch v-model="playground.required" label="Required (*)" />
                <FormSwitch v-model="playground.clearable" label="Clearable" />
                <FormSwitch v-model="playground.disabled" label="Disabled" />
                <FormSwitch v-model="playground.readonly" label="Readonly" />
                <FormSwitch v-model="playground.loading" label="Loading" />
                <FormSwitch v-model="playground.hasError" label="Error State" />
              </div>
            </div>

            <FormInput
              v-if="playground.hasError"
              v-model="playground.errorMessage"
              label="Error Message"
              placeholder="Validation error message"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ─── 2. Showcase Examples ────────────────────────────────────────── -->
    <section class="space-y-6">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Icon name="grid-view" class="text-emerald-500" />
        <span>Usage Examples</span>
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Example 1: Basic & Icons -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card space-y-4">
          <div>
            <h3 class="font-bold text-base text-slate-800 dark:text-white">1. Basic & Prefix Icons</h3>
            <p class="text-xs text-slate-500">Standard text inputs with decorative icons on the left.</p>
          </div>
          <div class="space-y-3">
            <FormInput
              v-model="examples.name"
              label="Full Name"
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
              hint="We'll never share your email address with anyone else."
            />
          </div>
        </div>

        <!-- Example 2: Formatters in Action -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card space-y-4">
          <div>
            <h3 class="font-bold text-base text-slate-800 dark:text-white">2. Automatic Formatters</h3>
            <p class="text-xs text-slate-500">Automatically sanitizes and formats inputs as the user types.</p>
          </div>
          <div class="space-y-3">
            <FormInput
              v-model="examples.currency"
              label="Donation Amount (Currency)"
              placeholder="100.000"
              formatters="currency"
              prefixIcon="wallet-02"
              hint="Automatically formats numbers with dot thousand separators."
            />
            <FormInput
              v-model="examples.phone"
              label="Phone Number (Phone Formatting)"
              placeholder="0812 3456 7890"
              formatters="phone"
              prefixIcon="call"
              hint="Auto-spaces digits following ITU-T E.164 guidelines."
            />
          </div>
        </div>

        <!-- Example 3: Character Counter & Uppercase Code -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card space-y-4">
          <div>
            <h3 class="font-bold text-base text-slate-800 dark:text-white">3. Max Length & Uppercase Code</h3>
            <p class="text-xs text-slate-500">Enforces uppercase alphanumeric code and shows character counter badge.</p>
          </div>
          <div class="space-y-3">
            <FormInput
              v-model="examples.code"
              label="Voucher Code (Code Format)"
              placeholder="VOUCHER-2026"
              formatters="code"
              maxLength="16"
              prefixIcon="tag-01"
              hint="Converts lowercase to uppercase and strictly restricts length to 16."
            />
            <FormInput
              v-model="examples.bio"
              label="Profile Headline"
              placeholder="Write a brief tagline..."
              maxLength="30"
              clearable
            />
          </div>
        </div>

        <!-- Example 4: Validation Error & Suffix Actions -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card space-y-4">
          <div>
            <h3 class="font-bold text-base text-slate-800 dark:text-white">4. Validation Error & Suffix Buttons</h3>
            <p class="text-xs text-slate-500">Error alert message and clickable suffix action button.</p>
          </div>
          <div class="space-y-3">
            <FormInput
              v-model="examples.errorInput"
              label="Username"
              error="This username is already taken by another account!"
              prefixIcon="user-id-verification"
            />
            <FormInput
              v-model="examples.apiKey"
              label="API Key (With Suffix Action)"
              readonly
              :suffixes="[
                {
                  icon: 'copy-01',
                  title: 'Copy API Key',
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
              <th class="px-4 py-3">Type</th>
              <th class="px-4 py-3">Default</th>
              <th class="px-4 py-3">Description</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-theme-border">
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">v-model</td>
              <td class="px-4 py-3 font-mono">string | number | null</td>
              <td class="px-4 py-3 font-mono">''</td>
              <td class="px-4 py-3">Two-way data binding for the input value.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">label</td>
              <td class="px-4 py-3 font-mono">string</td>
              <td class="px-4 py-3 font-mono">''</td>
              <td class="px-4 py-3">Label text rendered above the input element.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">prefixIcon</td>
              <td class="px-4 py-3 font-mono">string</td>
              <td class="px-4 py-3 font-mono">''</td>
              <td class="px-4 py-3">Hugeicons icon name rendered on the left side of the input (e.g., 'user', 'mail-01').</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">formatters</td>
              <td class="px-4 py-3 font-mono">FormatterType | FormatterType[]</td>
              <td class="px-4 py-3 font-mono">[]</td>
              <td class="px-4 py-3">
                Automatic formatting rules: <code>'currency'</code>, <code>'phone'</code>, <code>'ucwords'</code>, <code>'ucfirst'</code>, <code>'letters'</code>, <code>'numeric'</code>, <code>'upper'</code>, <code>'lower'</code>, <code>'code'</code>.
              </td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">maxLength</td>
              <td class="px-4 py-3 font-mono">string | number</td>
              <td class="px-4 py-3 font-mono">undefined</td>
              <td class="px-4 py-3">Maximum character limit. Automatically displays an interactive counter badge on the right.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">required</td>
              <td class="px-4 py-3 font-mono">boolean</td>
              <td class="px-4 py-3 font-mono">false</td>
              <td class="px-4 py-3">Marks the input as required and displays a red asterisk (*) next to the label.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">error</td>
              <td class="px-4 py-3 font-mono">string | boolean</td>
              <td class="px-4 py-3 font-mono">false</td>
              <td class="px-4 py-3">Applies error styling. When passed a string, renders the validation message below the input.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">clearable</td>
              <td class="px-4 py-3 font-mono">boolean</td>
              <td class="px-4 py-3 font-mono">false</td>
              <td class="px-4 py-3">Shows an instant clear icon button whenever the input contains text.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">loading</td>
              <td class="px-4 py-3 font-mono">boolean</td>
              <td class="px-4 py-3 font-mono">false</td>
              <td class="px-4 py-3">Disables the input and shows an animated loading spinner overlay.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">suffixes</td>
              <td class="px-4 py-3 font-mono">Suffix[]</td>
              <td class="px-4 py-3 font-mono">[]</td>
              <td class="px-4 py-3">Array of custom suffix action buttons: <code>{ label, icon, click, title, disabled }</code>.</td>
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

const iconOptions = [
  { label: 'None', value: 'none' },
  { label: 'User (user)', value: 'user' },
  { label: 'Mail (mail-01)', value: 'mail-01' },
  { label: 'Lock (lock)', value: 'lock' },
  { label: 'Search (search-01)', value: 'search-01' },
  { label: 'Phone (call)', value: 'call' },
  { label: 'Link (link-01)', value: 'link-01' },
  { label: 'Calendar (calendar-03)', value: 'calendar-03' },
  { label: 'Globe (globe)', value: 'globe' }
]

const formatterOptions = [
  { label: 'None', value: 'none' },
  { label: 'Currency (1.000.000)', value: 'currency' },
  { label: 'Phone (0812 3456)', value: 'phone' },
  { label: 'Title Case (ucwords)', value: 'ucwords' },
  { label: 'Sentence Case (ucfirst)', value: 'ucfirst' },
  { label: 'Letters Only (letters)', value: 'letters' },
  { label: 'Numeric Digits (numeric)', value: 'numeric' },
  { label: 'Uppercase Code (code)', value: 'code' },
  { label: 'Uppercase (upper)', value: 'upper' }
]

const playground = reactive({
  value: 'Ashta Developer',
  label: 'Username',
  placeholder: 'Enter your name...',
  prefixIcon: 'user',
  formatter: 'none',
  maxLength: '25',
  hint: 'Please provide your full legal name.',
  required: true,
  disabled: false,
  readonly: false,
  clearable: true,
  loading: false,
  hasError: false,
  errorMessage: 'Username cannot be blank!'
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
  toast.success('API Key copied to clipboard!')
}

const copyCode = async (code: string) => {
  await copyToClipboard(code)
  copied.value = true
  toast.success('Component code copied!')
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
