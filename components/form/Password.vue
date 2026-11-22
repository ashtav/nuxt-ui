<template>
  <div class="flex flex-col gap-1 w-full">
    <!-- Label -->
    <label v-if="label" :for="inputId"
      class="text-sm font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-0.5 self-start">
      <span>{{ label }}</span>
      <span v-if="required" class="text-red-500 font-bold" aria-hidden="true">*</span>
    </label>

    <!-- Input wrapper -->
    <div class="relative w-full flex items-center">
      <input :id="inputId" ref="inputRef" autocomplete="new-password" v-bind="$attrs" :type="showPassword ? 'text' : 'password'" :value="modelValue"
        :required="required" :maxlength="maxLength" @input="modelValue = ($event.target as HTMLInputElement).value"
        class="flex h-9 w-full rounded-lg border py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
        :class="[
          error
            ? 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/10 dark:bg-red-950/10'
            : 'border-theme-input bg-theme-input focus:ring-theme-primary focus:border-theme-primary',
          prefixIcon ? 'pl-9' : 'pl-3',
          generator ? 'pr-16' : 'pr-9'
        ]" />

      <!-- Prefix Icon -->
      <div v-if="prefixIcon" class="absolute left-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-400">
        <Icon :name="prefixIcon" size="sm" />
      </div>

      <!-- Suffix actions (Generator & Visibility) -->
      <div class="absolute right-2 flex items-center gap-1 z-10">
        <!-- Generator button (Access icon) -->
        <button v-if="generator" ref="accessButtonRef" type="button" @click="toggleGeneratorOptions"
          class="flex items-center justify-center h-6 w-6 rounded text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-theme-hover transition-colors focus:outline-none cursor-pointer"
          :class="{ '!text-emerald-500 dark:!text-emerald-400': showGeneratorOptions }" tabindex="-1"
          title="Generate Password">
          <Icon name="access" size="xs" />
        </button>

        <!-- Toggle visibility button -->
        <button type="button" @click="showPassword = !showPassword"
          class="flex items-center justify-center h-6 w-6 rounded text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-theme-hover transition-colors focus:outline-none cursor-pointer"
          tabindex="-1">
          <Icon :name="showPassword ? 'view-off' : 'view'" size="xs" />
        </button>
      </div>

      <!-- Generator Options Popover -->
      <div v-if="generator && showGeneratorOptions" ref="popoverRef"
        class="absolute z-50 right-0 top-full mt-1.5 w-64 p-4 bg-theme-card border border-theme-border rounded-xl shadow-xl flex flex-col gap-3 text-left animate-in fade-in slide-in-from-top-1 duration-150">
        <div class="flex items-center justify-between border-b border-theme-border pb-1.5">
          <span class="text-xs text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <Icon name="access" size="xs" class="text-emerald-500" />
            <div class="font-bold">Password Generator</div>
          </span>
          <button type="button" @click="showGeneratorOptions = false"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <i class="hgi hgi-stroke hgi-cancel-01"></i>
          </button>
        </div>

        <!-- Length field -->
        <div class="flex flex-col gap-1">
          <label
            class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Length</label>
          <div class="flex items-center gap-2">
            <input type="range" v-model.number="genOptions.length" min="6" max="32"
              class="flex-1 h-1.5 bg-slate-100 dark:bg-theme-hover rounded-lg appearance-none cursor-pointer accent-emerald-500" />
            <input type="number" v-model.number="genOptions.length" min="6" max="32"
              class="w-12 text-center text-xs font-semibold py-0.5 border border-theme-border rounded bg-theme-input text-slate-800 dark:text-slate-200 focus:outline-none" />
          </div>
        </div>

        <!-- Toggles with local component style -->
        <div class="flex flex-col gap-2.5 pt-2.5 border-t border-theme-border">
          <label class="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-200">
            <span class="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
              <input type="checkbox" v-model="genOptions.includeSymbols"
                class="peer absolute inset-0 h-4 w-4 shrink-0 appearance-none rounded-[4px] border border-theme-input bg-theme-input transition-all checked:border-emerald-500 checked:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950" />
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
                class="pointer-events-none h-3 w-3 text-white scale-0 peer-checked:scale-100 transition-transform">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <span class="select-none leading-none font-medium">Include Symbols</span>
          </label>

          <label class="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-200">
            <span class="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
              <input type="checkbox" v-model="genOptions.autoCopy"
                class="peer absolute inset-0 h-4 w-4 shrink-0 appearance-none rounded-[4px] border border-theme-input bg-theme-input transition-all checked:border-emerald-500 checked:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950" />
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
                class="pointer-events-none h-3 w-3 text-white scale-0 peer-checked:scale-100 transition-transform">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <span class="select-none leading-none font-medium">Auto Copy to Clipboard</span>
          </label>
        </div>

        <!-- Action Row -->
        <div class="flex items-center gap-2 pt-1">
          <!-- Generate Button -->
          <button type="button" @click="generatePassword"
            class="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10">
            <i class="hgi hgi-stroke hgi-flash text-xs"></i>
            <span class="font-bold">Generate</span>
          </button>

          <!-- Copy Button -->
          <button type="button" @click="copyPassword"
            class="h-8 w-8 shrink-0 flex items-center justify-center bg-theme-card hover:bg-theme-hover border border-theme-border rounded-lg transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
            title="Copy Password" :disabled="!modelValue">
            <Icon :name="copiedState ? 'tick-02' : 'copy-02'" size="xs"
              :class="copiedState ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'" />
          </button>
        </div>
      </div>
    </div>

    <!-- Error message display -->
    <span v-if="typeof error === 'string' && error" class="text-xs text-red-500 dark:text-red-400 mt-0.5 font-normal">
      {{ error }}
    </span>

    <!-- Hint / Help Text -->
    <span v-if="hint" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
      {{ hint }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, useId, onMounted, onUnmounted, useAttrs, watch } from 'vue'

defineOptions({
  inheritAttrs: false
})

const attrs = useAttrs()

interface Props {
  label?: string
  hint?: string
  maxLength?: string | number
  required?: boolean
  error?: string | boolean
  prefixIcon?: string
  generator?: boolean | {
    length?: number
    includeSymbols?: boolean
    autoCopy?: boolean
  }
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  hint: '',
  required: false,
  error: false,
  prefixIcon: '',
  generator: false
})

const modelValue = defineModel<string>({ default: '' })

const inputRef = ref<HTMLInputElement | null>(null)
const inputId = useId()
const showPassword = ref(false)

const showGeneratorOptions = ref(false)
const copiedState = ref(false)
const popoverRef = ref<HTMLElement | null>(null)
const accessButtonRef = ref<HTMLElement | null>(null)

const genOptions = ref({
  length: 10,
  includeSymbols: true,
  autoCopy: true
})

// Initialize option values from the generator prop if it's an object
const initGenOptions = () => {
  if (props.generator && typeof props.generator === 'object') {
    if (typeof props.generator.length === 'number') {
      genOptions.value.length = props.generator.length
    }
    if (typeof props.generator.includeSymbols === 'boolean') {
      genOptions.value.includeSymbols = props.generator.includeSymbols
    }
    if (typeof props.generator.autoCopy === 'boolean') {
      genOptions.value.autoCopy = props.generator.autoCopy
    }
  } else {
    // If it's boolean true, reset to default requirements
    genOptions.value = {
      length: 10,
      includeSymbols: true,
      autoCopy: true
    }
  }
}

watch(() => props.generator, () => {
  initGenOptions()
}, { immediate: true, deep: true })

const toggleGeneratorOptions = () => {
  showGeneratorOptions.value = !showGeneratorOptions.value
}

const generatePassword = () => {
  const length = genOptions.value.length
  const includeSymbols = genOptions.value.includeSymbols

  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  let charset = uppercase + lowercase + numbers
  if (includeSymbols) {
    charset += symbols
  }

  let password = ''
  // Ensure at least one character from each required category is selected
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length))
  password += numbers.charAt(Math.floor(Math.random() * numbers.length))
  if (includeSymbols) {
    password += symbols.charAt(Math.floor(Math.random() * symbols.length))
  }

  // Fill the rest of the password
  const remainingLength = length - password.length
  for (let i = 0; i < remainingLength; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }

  // Shuffle the password
  password = password.split('').sort(() => 0.5 - Math.random()).join('')

  // Update modelValue
  modelValue.value = password

  // Handle auto-copy
  if (genOptions.value.autoCopy) {
    if (import.meta.client && navigator.clipboard) {
      navigator.clipboard.writeText(password).then(() => {
        copiedState.value = true
        setTimeout(() => {
          copiedState.value = false
        }, 2000)
      }).catch(() => { })
    }
  }

  // Open the view eye so they can see the generated password
  showPassword.value = true
}

const copyPassword = () => {
  if (!modelValue.value) return

  if (import.meta.client && navigator.clipboard) {
    navigator.clipboard.writeText(modelValue.value).then(() => {
      copiedState.value = true
      setTimeout(() => {
        copiedState.value = false
      }, 2000)
    }).catch(() => { })
  }
}

const handleDocumentClick = (e: MouseEvent) => {
  if (!showGeneratorOptions.value) return

  const target = e.target as HTMLElement
  const clickedInsidePopover = popoverRef.value?.contains(target)
  const clickedAccessButton = accessButtonRef.value?.contains(target)

  if (!clickedInsidePopover && !clickedAccessButton) {
    showGeneratorOptions.value = false
  }
}

onMounted(() => {
  const hasAutofocus = attrs.autofocus === '' || attrs.autofocus === true || attrs.autoFocus === '' || attrs.autoFocus === true
  if (hasAutofocus) {
    setTimeout(() => {
      inputRef.value?.focus()
    }, 150)
  }

  if (import.meta.client) {
    document.addEventListener('click', handleDocumentClick)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    document.removeEventListener('click', handleDocumentClick)
  }
})
</script>
