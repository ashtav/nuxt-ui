<template>
  <div class="space-y-12">
    <!-- Header Section -->
    <div class="border-b border-slate-200 dark:border-theme-border pb-6">
      <div class="flex items-center gap-3 mb-2">
        <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          FormSelect
        </h1>
        <span class="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 font-mono">
          &lt;FormSelect /&gt;
        </span>
      </div>
      <p class="text-base text-slate-600 dark:text-slate-300 max-w-4xl leading-relaxed">
        An accessible combobox and dropdown select component featuring teleported auto-flipping viewport positioning, built-in local &amp; server-side search filtering, custom option creation (<code class="text-xs bg-slate-100 dark:bg-theme-input px-1.5 py-0.5 rounded">allowCustom</code>), keyboard navigation, and flexible option normalization.
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
          <div class="space-y-3">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Component Preview</span>
            <div class="p-6 rounded-xl bg-slate-50 dark:bg-theme-app border border-slate-200/80 dark:border-theme-border flex flex-col items-center justify-center min-h-[160px]">
              <div class="w-full max-w-md">
                <FormSelect
                  v-model="playground.value"
                  :label="playground.label"
                  :placeholder="playground.placeholder"
                  :searchPlaceholder="playground.searchPlaceholder"
                  :options="playgroundOptions"
                  :size="playground.size"
                  :searchable="playground.searchable"
                  :clearable="playground.clearable"
                  :allowCustom="playground.allowCustom"
                  :required="playground.required"
                  :disabled="playground.disabled"
                  :readonly="playground.readonly"
                  :loading="playground.loading"
                  :error="playground.hasError ? playground.errorMessage : false"
                  :hint="playground.hint"
                  @change="handlePlaygroundChange"
                />
              </div>
            </div>

            <!-- Live State & Event Inspector -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div class="p-3 rounded-lg bg-slate-50 dark:bg-theme-app border border-slate-200/80 dark:border-theme-border flex items-center justify-between">
                <span class="text-slate-500">v-model value:</span>
                <code class="font-mono text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-[160px]">
                  {{ JSON.stringify(playground.value) }}
                </code>
              </div>
              <div class="p-3 rounded-lg bg-slate-50 dark:bg-theme-app border border-slate-200/80 dark:border-theme-border flex items-center justify-between">
                <span class="text-slate-500">@change option:</span>
                <code class="font-mono text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[160px]">
                  {{ lastChangedOption ? lastChangedOption.label : 'null' }}
                </code>
              </div>
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

            <div class="grid grid-cols-2 gap-3">
              <FormInput v-model="playground.placeholder" label="Placeholder" />
              <FormSelect
                v-model="playground.size"
                label="Size"
                :searchable="false"
                :options="[
                  { label: 'Medium (md)', value: 'md' },
                  { label: 'Small / Compact (sm)', value: 'sm' }
                ]"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <FormInput v-model="playground.searchPlaceholder" label="Search Placeholder" />
              <FormInput v-model="playground.hint" label="Hint Text" placeholder="Helper message" />
            </div>

            <!-- State Toggles -->
            <div class="pt-2 border-t border-slate-100 dark:border-theme-border/60">
              <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">State Toggles</span>
              <div class="grid grid-cols-2 gap-3">
                <FormSwitch v-model="playground.searchable" label="Searchable" />
                <FormSwitch v-model="playground.clearable" label="Clearable (X)" />
                <FormSwitch v-model="playground.allowCustom" label="Allow Custom" />
                <FormSwitch v-model="playground.required" label="Required (*)" />
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

    <!-- ─── 2. Usage Examples ─────────────────────────────────────────── -->
    <section class="space-y-6">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Icon name="grid-view" class="text-emerald-500" />
        <span>Usage Examples</span>
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Example 1: Object Options vs Plain String Array -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card space-y-4">
          <div>
            <h3 class="font-bold text-base text-slate-800 dark:text-white">1. Object Array vs String Array</h3>
            <p class="text-xs text-slate-500">Supports structured <code class="font-mono">{ label, value }</code> objects or plain string arrays automatically.</p>
          </div>
          <div class="space-y-3">
            <FormSelect
              v-model="examples.country"
              label="Country (Object Options)"
              placeholder="Choose a country..."
              :options="countryOptions"
              clearable
            />
            <FormSelect
              v-model="examples.status"
              label="Account Status (Plain String Array)"
              :searchable="false"
              :options="['Active', 'Pending Verification', 'Suspended', 'Archived']"
            />
          </div>
        </div>

        <!-- Example 2: Allow Custom Option Creation -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card space-y-4">
          <div>
            <h3 class="font-bold text-base text-slate-800 dark:text-white">2. Allow Custom Value (<code class="text-xs">allowCustom</code>)</h3>
            <p class="text-xs text-slate-500">Type a new category not in the list to dynamically create and select it on the fly.</p>
          </div>
          <div class="space-y-3">
            <FormSelect
              v-model="examples.category"
              label="Article Category"
              placeholder="Select or type a new category..."
              :options="categoryOptions"
              allowCustom
              clearable
              hint="Try typing 'Artificial Intelligence' inside the search box."
            />
            <div class="text-xs text-slate-500">
              Selected category:
              <code class="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                {{ examples.category || '(none)' }}
              </code>
            </div>
          </div>
        </div>

        <!-- Example 3: Custom Option & Selected Slots -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card space-y-4">
          <div>
            <h3 class="font-bold text-base text-slate-800 dark:text-white">3. Custom Option &amp; Selected Slots</h3>
            <p class="text-xs text-slate-500">Customize option rows with icons, badges, or secondary metadata using <code class="font-mono">#option</code>.</p>
          </div>
          <div class="space-y-3">
            <FormSelect
              v-model="examples.plan"
              label="Subscription Plan"
              :options="planOptions"
            >
              <template #option="{ option }">
                <div class="flex items-center justify-between w-full min-w-0 pr-1">
                  <div class="truncate">
                    <span class="font-medium block truncate">{{ option.label }}</span>
                    <span class="text-[11px] text-slate-400 block truncate">{{ option.subtext }}</span>
                  </div>
                  <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">
                    {{ option.price }}
                  </span>
                </div>
              </template>
            </FormSelect>

            <FormSelect
              v-model="examples.compactVal"
              label="Compact Size Variant (size='sm')"
              size="sm"
              :options="['10 items / page', '25 items / page', '50 items / page', '100 items / page']"
              :searchable="false"
            />
          </div>
        </div>

        <!-- Example 4: Server-Side Remote Search -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card space-y-4">
          <div>
            <h3 class="font-bold text-base text-slate-800 dark:text-white">4. Server-Side Search &amp; Validation Error</h3>
            <p class="text-xs text-slate-500">Delegates filtering to an external API with debounced <code class="font-mono">@search</code> emission.</p>
          </div>
          <div class="space-y-3">
            <FormSelect
              v-model="examples.remoteUser"
              label="Assign Team Member (Server-Side)"
              placeholder="Search user from server..."
              :options="remoteUserOptions"
              :loading="isSearchingRemote"
              serverSide
              clearable
              @search="handleRemoteSearch"
            />
            <FormSelect
              v-model="examples.errorSelect"
              label="Payment Method"
              placeholder="Select payment method..."
              :options="['Bank Transfer', 'Credit Card', 'QRIS', 'Virtual Account']"
              error="Please select a valid payment method to proceed."
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ─── 3. Props, Events & Slots Reference Table ───────────────────── -->
    <section class="space-y-6">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Icon name="code-circle" class="text-emerald-500" />
        <span>Props, Events &amp; Slots Reference</span>
      </h2>

      <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card">
        <table class="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead class="bg-slate-50 dark:bg-theme-app border-b border-slate-200 dark:border-theme-border text-slate-700 dark:text-slate-200 uppercase font-semibold">
            <tr>
              <th class="px-4 py-3">Name</th>
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
              <td class="px-4 py-3">Two-way reactive binding for the selected option value.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">options</td>
              <td class="px-4 py-3 font-mono">(ComboboxOption | string | number)[]</td>
              <td class="px-4 py-3 font-mono">required</td>
              <td class="px-4 py-3">Array of options. Accepts objects <code>{ label, value, disabled?, subtext?, code? }</code> or primitives.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">searchable</td>
              <td class="px-4 py-3 font-mono">boolean</td>
              <td class="px-4 py-3 font-mono">true</td>
              <td class="px-4 py-3">Displays a search filter input inside the dropdown header.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">clearable</td>
              <td class="px-4 py-3 font-mono">boolean</td>
              <td class="px-4 py-3 font-mono">false</td>
              <td class="px-4 py-3">Displays a clear button (X) on the right when a value is selected.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">allowCustom</td>
              <td class="px-4 py-3 font-mono">boolean</td>
              <td class="px-4 py-3 font-mono">false</td>
              <td class="px-4 py-3">Allows users to add a custom option when their search query matches no existing options.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">serverSide</td>
              <td class="px-4 py-3 font-mono">boolean</td>
              <td class="px-4 py-3 font-mono">false</td>
              <td class="px-4 py-3">Disables local filtering and emits debounced <code>@search</code> events for remote fetching.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">size</td>
              <td class="px-4 py-3 font-mono">'sm' | 'md' | 'normal'</td>
              <td class="px-4 py-3 font-mono">'md'</td>
              <td class="px-4 py-3">Controls trigger height and font sizing (<code>sm</code> = h-8, <code>md</code> = h-9).</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">dropdownMinWidth</td>
              <td class="px-4 py-3 font-mono">string</td>
              <td class="px-4 py-3 font-mono">''</td>
              <td class="px-4 py-3">Custom minimum width in pixels for the teleported dropdown panel (e.g. <code>'280px'</code>).</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">@change</td>
              <td class="px-4 py-3 font-mono">(option: ComboboxOption | null) =&gt; void</td>
              <td class="px-4 py-3 font-mono">-</td>
              <td class="px-4 py-3">Emitted when the user selects an option or clears the selection.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">#option / #selected</td>
              <td class="px-4 py-3 font-mono">Scoped Slots</td>
              <td class="px-4 py-3 font-mono">-</td>
              <td class="px-4 py-3">Custom templates for dropdown option items (<code>{ option, selected }</code>) and trigger label (<code>{ option }</code>).</td>
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
import type { ComboboxOption } from '~/components/form/Select.vue'

const copied = ref(false)

const playgroundOptions: ComboboxOption[] = [
  { label: 'Frontend Engineer', value: 'frontend' },
  { label: 'Backend Engineer', value: 'backend' },
  { label: 'Fullstack Developer', value: 'fullstack' },
  { label: 'UI/UX Designer', value: 'designer' },
  { label: 'DevOps Architect', value: 'devops' },
  { label: 'Product Manager', value: 'pm' },
  { label: 'Quality Assurance (Disabled)', value: 'qa', disabled: true }
]

const playground = reactive({
  value: 'fullstack',
  label: 'Role Assignment',
  placeholder: 'Select a role...',
  searchPlaceholder: 'Filter roles...',
  size: 'md' as 'sm' | 'md',
  hint: 'Choose the primary responsibility for this member.',
  searchable: true,
  clearable: true,
  allowCustom: false,
  required: true,
  disabled: false,
  readonly: false,
  loading: false,
  hasError: false,
  errorMessage: 'Please select a valid role!'
})

const lastChangedOption = ref<ComboboxOption | null>({
  label: 'Fullstack Developer',
  value: 'fullstack'
})

const handlePlaygroundChange = (opt: ComboboxOption | null) => {
  lastChangedOption.value = opt
}

const countryOptions: ComboboxOption[] = [
  { label: 'Indonesia', value: 'ID', code: 'IDN' },
  { label: 'Singapore', value: 'SG', code: 'SGP' },
  { label: 'Japan', value: 'JP', code: 'JPN' },
  { label: 'Australia', value: 'AU', code: 'AUS' },
  { label: 'United States', value: 'US', code: 'USA' },
  { label: 'United Kingdom', value: 'GB', code: 'GBR' }
]

const categoryOptions: ComboboxOption[] = [
  { label: 'Web Development', value: 'Web Development' },
  { label: 'Design Systems', value: 'Design Systems' },
  { label: 'Cloud Infrastructure', value: 'Cloud Infrastructure' },
  { label: 'Cybersecurity', value: 'Cybersecurity' }
]

const planOptions: ComboboxOption[] = [
  { label: 'Starter Plan', value: 'starter', subtext: 'Up to 3 projects & basic analytics', price: '$9/mo' },
  { label: 'Professional Plan', value: 'pro', subtext: 'Unlimited projects & priority support', price: '$29/mo' },
  { label: 'Enterprise Plan', value: 'enterprise', subtext: 'Dedicated cluster & custom SLA', price: '$99/mo' }
]

const allUsersDatabase: ComboboxOption[] = [
  { label: 'Ashta Dev (ashta@example.com)', value: 'usr_1' },
  { label: 'Sarah Connor (sarah@example.com)', value: 'usr_2' },
  { label: 'Alex Rivera (alex@example.com)', value: 'usr_3' },
  { label: 'Elena Rostova (elena@example.com)', value: 'usr_4' },
  { label: 'Marcus Vance (marcus@example.com)', value: 'usr_5' }
]

const remoteUserOptions = ref<ComboboxOption[]>(allUsersDatabase)
const isSearchingRemote = ref(false)

const examples = reactive({
  country: 'ID',
  status: 'Active',
  category: 'Design Systems',
  plan: 'pro',
  compactVal: '25 items / page',
  remoteUser: 'usr_1',
  errorSelect: ''
})

const handleRemoteSearch = (query: string) => {
  isSearchingRemote.value = true
  setTimeout(() => {
    const q = query.trim().toLowerCase()
    remoteUserOptions.value = q
      ? allUsersDatabase.filter(u => u.label.toLowerCase().includes(q))
      : allUsersDatabase
    isSearchingRemote.value = false
  }, 500)
}

const copyCode = async (code: string) => {
  await copyToClipboard(code)
  copied.value = true
  toast.success('Component code copied!')
  setTimeout(() => { copied.value = false }, 2000)
}

const generatedCode = computed(() => {
  const parts: string[] = ['<FormSelect']
  parts.push('  v-model="selectedRole"')
  if (playground.label) parts.push(`  label="${playground.label}"`)
  if (playground.placeholder && playground.placeholder !== 'Select option...') {
    parts.push(`  placeholder="${playground.placeholder}"`)
  }
  if (playground.searchPlaceholder && playground.searchPlaceholder !== 'Search...') {
    parts.push(`  searchPlaceholder="${playground.searchPlaceholder}"`)
  }
  parts.push('  :options="roleOptions"')
  if (playground.size !== 'md') parts.push(`  size="${playground.size}"`)
  if (!playground.searchable) parts.push('  :searchable="false"')
  if (playground.clearable) parts.push('  clearable')
  if (playground.allowCustom) parts.push('  allowCustom')
  if (playground.required) parts.push('  required')
  if (playground.disabled) parts.push('  disabled')
  if (playground.readonly) parts.push('  readonly')
  if (playground.loading) parts.push('  loading')
  if (playground.hasError) parts.push(`  error="${playground.errorMessage}"`)
  if (playground.hint) parts.push(`  hint="${playground.hint}"`)
  parts.push('/>')
  return parts.join('\n')
})
</script>
