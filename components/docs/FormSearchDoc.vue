<template>
  <div class="space-y-12">
    <!-- Header Section -->
    <div class="border-b border-slate-200 dark:border-theme-border pb-6">
      <div class="flex items-center gap-3 mb-2">
        <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          FormSearch
        </h1>
        <span class="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 font-mono">
          &lt;FormSearch /&gt;
        </span>
      </div>
      <p class="text-base text-slate-600 dark:text-slate-300 max-w-4xl leading-relaxed">
        A dedicated search input component featuring built-in debounced <code class="text-xs bg-slate-100 dark:bg-theme-input px-1.5 py-0.5 rounded">@search</code> emission, optional Enter-only trigger mode, automatic clear button, and an integrated loading spinner that replaces the prefix icon during async queries.
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
                <FormSearch
                  v-model="playground.value"
                  :label="playground.label"
                  :placeholder="playground.placeholder"
                  :prefixIcon="playground.prefixIcon !== 'none' ? playground.prefixIcon : ''"
                  :debounce="Number(playground.debounce) || 300"
                  :searchOnEnter="playground.searchOnEnter"
                  :loading="playground.loading"
                  :required="playground.required"
                  :disabled="playground.disabled"
                  :error="playground.hasError ? playground.errorMessage : false"
                  :hint="playground.hint"
                  @search="handlePlaygroundSearch"
                />
              </div>
            </div>

            <!-- Live State & Event Inspector -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div class="p-3 rounded-lg bg-slate-50 dark:bg-theme-app border border-slate-200/80 dark:border-theme-border flex items-center justify-between">
                <span class="text-slate-500">v-model (immediate):</span>
                <code class="font-mono text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[160px]">
                  {{ JSON.stringify(playground.value) }}
                </code>
              </div>
              <div class="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40 flex items-center justify-between">
                <span class="text-slate-500">@search (emitted):</span>
                <code class="font-mono text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-[160px]">
                  {{ JSON.stringify(lastSearchEmitted) }} ({{ searchCount }}x)
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
            <FormInput v-model="playground.placeholder" label="Placeholder" />

            <div class="grid grid-cols-2 gap-3">
              <FormSelect
                v-model="playground.prefixIcon"
                label="Prefix Icon"
                :options="iconOptions"
              />
              <FormInput
                v-model="playground.debounce"
                label="Debounce (ms)"
                type="number"
                placeholder="300"
              />
            </div>

            <FormInput v-model="playground.hint" label="Hint Text" placeholder="Helper message" />

            <!-- State Toggles -->
            <div class="pt-2 border-t border-slate-100 dark:border-theme-border/60">
              <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">State Toggles</span>
              <div class="grid grid-cols-2 gap-3">
                <FormSwitch v-model="playground.searchOnEnter" label="Search on Enter" />
                <FormSwitch v-model="playground.loading" label="Loading Spinner" />
                <FormSwitch v-model="playground.required" label="Required (*)" />
                <FormSwitch v-model="playground.disabled" label="Disabled" />
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
        <!-- Example 1: Debounced Live Filtering -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card space-y-4">
          <div>
            <h3 class="font-bold text-base text-slate-800 dark:text-white">1. Debounced Live Filtering (300ms)</h3>
            <p class="text-xs text-slate-500">Automatically emits <code class="font-mono">@search</code> after the user stops typing for 300ms.</p>
          </div>
          <div class="space-y-3">
            <FormSearch
              v-model="examples.liveQuery"
              placeholder="Search frameworks (e.g. Nuxt, Vue, Tailwind)..."
              @search="onLiveSearch"
            />
            <div class="flex flex-wrap gap-1.5 pt-1">
              <span
                v-for="item in filteredFrameworks"
                :key="item"
                class="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-theme-input text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-theme-border"
              >
                {{ item }}
              </span>
              <span v-if="filteredFrameworks.length === 0" class="text-xs text-slate-400 italic">
                No matching frameworks found for "{{ debouncedLiveQuery }}"
              </span>
            </div>
          </div>
        </div>

        <!-- Example 2: Search on Enter Mode -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card space-y-4">
          <div>
            <h3 class="font-bold text-base text-slate-800 dark:text-white">2. Search on Enter Mode</h3>
            <p class="text-xs text-slate-500">Disables debounce while typing and only triggers <code class="font-mono">@search</code> when pressing Enter.</p>
          </div>
          <div class="space-y-3">
            <FormSearch
              v-model="examples.enterQuery"
              label="Global Keyword Search"
              placeholder="Type keyword and press Enter..."
              searchOnEnter
              hint="Press Enter to execute search or click X to clear."
              @search="onEnterSearch"
            />
            <div class="text-xs text-slate-500">
              Last submitted query:
              <code class="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                {{ submittedEnterQuery || '(waiting for Enter)' }}
              </code>
            </div>
          </div>
        </div>

        <!-- Example 3: Async Loading State -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card space-y-4">
          <div>
            <h3 class="font-bold text-base text-slate-800 dark:text-white">3. Async Remote Search with Loading</h3>
            <p class="text-xs text-slate-500">Replaces the search icon with an animated spinner while fetching remote API results.</p>
          </div>
          <div class="space-y-3">
            <FormSearch
              v-model="examples.asyncQuery"
              label="Search Remote Users"
              placeholder="Type to simulate API call..."
              :loading="isSimulatingApi"
              hint="Simulates a 800ms network request on every search."
              @search="simulateApiSearch"
            />
          </div>
        </div>

        <!-- Example 4: Validation Error & Custom Prefix Icon -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card space-y-4">
          <div>
            <h3 class="font-bold text-base text-slate-800 dark:text-white">4. Custom Icon &amp; Error State</h3>
            <p class="text-xs text-slate-500">Custom prefix icon and validation error message display.</p>
          </div>
          <div class="space-y-3">
            <FormSearch
              v-model="examples.errorQuery"
              label="Filter by Invoice Number"
              prefixIcon="invoice-01"
              placeholder="INV-2026-..."
              error="Minimum 3 characters required to search invoices."
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ─── 3. Props & API Reference Table ──────────────────────────────── -->
    <section class="space-y-6">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Icon name="code-circle" class="text-emerald-500" />
        <span>Props &amp; Events Reference</span>
      </h2>

      <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-card">
        <table class="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead class="bg-slate-50 dark:bg-theme-app border-b border-slate-200 dark:border-theme-border text-slate-700 dark:text-slate-200 uppercase font-semibold">
            <tr>
              <th class="px-4 py-3">Prop / Event</th>
              <th class="px-4 py-3">Type</th>
              <th class="px-4 py-3">Default</th>
              <th class="px-4 py-3">Description</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-theme-border">
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">v-model</td>
              <td class="px-4 py-3 font-mono">string</td>
              <td class="px-4 py-3 font-mono">''</td>
              <td class="px-4 py-3">Two-way reactive search query string.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">debounce</td>
              <td class="px-4 py-3 font-mono">number</td>
              <td class="px-4 py-3 font-mono">300</td>
              <td class="px-4 py-3">Delay in milliseconds before emitting the <code>@search</code> event after typing stops.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">searchOnEnter</td>
              <td class="px-4 py-3 font-mono">boolean</td>
              <td class="px-4 py-3 font-mono">false</td>
              <td class="px-4 py-3">When true, suppresses debounced emission while typing and only emits <code>@search</code> on Enter key or clear.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">loading</td>
              <td class="px-4 py-3 font-mono">boolean</td>
              <td class="px-4 py-3 font-mono">false</td>
              <td class="px-4 py-3">Replaces the left prefix icon with an animated circular loading spinner.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">prefixIcon</td>
              <td class="px-4 py-3 font-mono">string</td>
              <td class="px-4 py-3 font-mono">'search-01'</td>
              <td class="px-4 py-3">Hugeicons icon name displayed on the left side of the search box.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">label</td>
              <td class="px-4 py-3 font-mono">string</td>
              <td class="px-4 py-3 font-mono">''</td>
              <td class="px-4 py-3">Optional label text rendered above the search input.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">hint</td>
              <td class="px-4 py-3 font-mono">string</td>
              <td class="px-4 py-3 font-mono">''</td>
              <td class="px-4 py-3">Helper text rendered below the search input.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">error</td>
              <td class="px-4 py-3 font-mono">string | boolean</td>
              <td class="px-4 py-3 font-mono">false</td>
              <td class="px-4 py-3">Applies error border styling and displays the error message string if provided.</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">@search</td>
              <td class="px-4 py-3 font-mono">(val: string) =&gt; void</td>
              <td class="px-4 py-3 font-mono">-</td>
              <td class="px-4 py-3">Emitted after debounce timer completes, when pressing Enter (if <code>searchOnEnter</code>), or when clicking the clear button.</td>
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
  { label: 'Search (search-01)', value: 'search-01' },
  { label: 'Filter (filter)', value: 'filter' },
  { label: 'User (user)', value: 'user' },
  { label: 'Globe (globe)', value: 'globe' },
  { label: 'Invoice (invoice-01)', value: 'invoice-01' },
  { label: 'None', value: 'none' }
]

const playground = reactive({
  value: '',
  label: 'Search Records',
  placeholder: 'Type to search...',
  prefixIcon: 'search-01',
  debounce: '300',
  hint: 'Results update automatically as you type.',
  searchOnEnter: false,
  loading: false,
  required: false,
  disabled: false,
  hasError: false,
  errorMessage: 'Invalid search keyword!'
})

const lastSearchEmitted = ref('')
const searchCount = ref(0)

const handlePlaygroundSearch = (val: string) => {
  lastSearchEmitted.value = val
  searchCount.value++
}

const allFrameworks = ['Nuxt 4', 'Vue 3', 'Tailwind CSS', 'TypeScript', 'Pinia', 'Vite', 'Nitro', 'Unovis']
const debouncedLiveQuery = ref('')
const submittedEnterQuery = ref('')
const isSimulatingApi = ref(false)

const examples = reactive({
  liveQuery: '',
  enterQuery: '',
  asyncQuery: '',
  errorQuery: 'IN'
})

const onLiveSearch = (val: string) => {
  debouncedLiveQuery.value = val
}

const filteredFrameworks = computed(() => {
  const q = debouncedLiveQuery.value.trim().toLowerCase()
  if (!q) return allFrameworks
  return allFrameworks.filter(item => item.toLowerCase().includes(q))
})

const onEnterSearch = (val: string) => {
  submittedEnterQuery.value = val
  if (val) {
    toast.info(`Executed search for: "${val}"`)
  }
}

const simulateApiSearch = (val: string) => {
  if (!val) {
    isSimulatingApi.value = false
    return
  }
  isSimulatingApi.value = true
  setTimeout(() => {
    isSimulatingApi.value = false
  }, 800)
}

const copyCode = async (code: string) => {
  await copyToClipboard(code)
  copied.value = true
  toast.success('Component code copied!')
  setTimeout(() => { copied.value = false }, 2000)
}

const generatedCode = computed(() => {
  const parts: string[] = ['<FormSearch']
  parts.push('  v-model="searchQuery"')
  if (playground.label) parts.push(`  label="${playground.label}"`)
  if (playground.placeholder) parts.push(`  placeholder="${playground.placeholder}"`)
  if (playground.prefixIcon && playground.prefixIcon !== 'search-01') {
    parts.push(`  prefixIcon="${playground.prefixIcon === 'none' ? '' : playground.prefixIcon}"`)
  }
  if (playground.debounce && Number(playground.debounce) !== 300) {
    parts.push(`  :debounce="${playground.debounce}"`)
  }
  if (playground.searchOnEnter) parts.push('  searchOnEnter')
  if (playground.loading) parts.push('  loading')
  if (playground.required) parts.push('  required')
  if (playground.disabled) parts.push('  disabled')
  if (playground.hasError) parts.push(`  error="${playground.errorMessage}"`)
  if (playground.hint) parts.push(`  hint="${playground.hint}"`)
  parts.push('  @search="handleSearch"')
  parts.push('/>')
  return parts.join('\n')
})
</script>
