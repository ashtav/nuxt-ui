<template>
  <Modal v-model:open="confirmState.open" :title="confirmState.title" size="sm"
    :close-on-backdrop="!confirmState.loading" :close-on-esc="!confirmState.loading" :show-close-button="false"
    :backdrop-z-index="100000" :panel-z-index="100010" :fullscreen-on-mobile="false"
    @close="handleModalClose">
    <p v-if="confirmState.message" class="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
      {{ confirmState.message }}
    </p>

    <!-- Type-to-confirm input, hanya muncul kalau confirmValue di-set -->
    <div v-if="confirmState.confirmValue" class="mt-4 flex flex-col gap-1.5">
      <label class="text-xs font-medium text-gray-500 dark:text-gray-400">
        {{ confirmState.confirmValueLabel || `Type "${confirmState.confirmValue}" to continue` }}
      </label>
      <input v-model="confirmState.typedValue" type="text" autocomplete="off" spellcheck="false"
        :disabled="confirmState.loading"
        :placeholder="confirmState.confirmValuePlaceholder || 'Type matching text...'"
        class="flex h-10 w-full rounded-lg border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-input px-3 py-2 text-sm text-slate-900 dark:text-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50" />
    </div>

    <!-- Prompt input, hanya muncul kalau promptInput di-set true -->
    <div v-if="confirmState.promptInput" class="mt-4 flex flex-col gap-1.5">
      <label class="text-sm font-medium text-gray-500 dark:text-gray-400">
        {{ confirmState.promptInputLabel || 'Reason' }}
      </label>
      <textarea v-if="confirmState.inputMode === 'textarea'" v-model="confirmState.typedValue" rows="3"
        :placeholder="confirmState.promptInputPlaceholder || 'Type a reason...'" :disabled="confirmState.loading"
        class="flex w-full rounded-lg border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-input px-3 py-2 text-sm text-slate-900 dark:text-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 resize-y" />
      <input v-else v-model="confirmState.typedValue" type="text" autocomplete="off"
        :placeholder="confirmState.promptInputPlaceholder || 'Type a reason...'" :disabled="confirmState.loading"
        class="flex h-10 w-full rounded-lg border border-slate-200 dark:border-theme-border bg-white dark:bg-theme-input px-3 py-2 text-sm text-slate-900 dark:text-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50" />
    </div>

    <!-- Checkbox option, hanya muncul kalau checkbox di-set true -->
    <div v-if="confirmState.checkbox" class="mt-4">
      <label
        for="confirm-dialog-checkbox"
        class="inline-flex items-start gap-2.5 text-sm text-slate-800 dark:text-slate-200 py-0.5"
        :class="confirmState.loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'"
      >
        <span class="relative inline-flex h-4 w-4 shrink-0 items-center justify-center mt-0.5">
          <input
            id="confirm-dialog-checkbox"
            v-model="confirmState.checkboxValue"
            type="checkbox"
            :disabled="confirmState.loading"
            class="peer absolute inset-0 h-4 w-4 shrink-0 appearance-none rounded-[4px] border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed cursor-pointer"
            :class="[
              confirmState.checkboxValue
                ? 'border-emerald-500 bg-emerald-500'
                : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-theme-app hover:border-slate-400 dark:hover:border-slate-500'
            ]"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="pointer-events-none h-3 w-3 text-white transition-all duration-150 relative z-10"
            :class="[confirmState.checkboxValue ? 'scale-100 opacity-100' : 'scale-0 opacity-0']"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <span class="select-none leading-normal flex-1 text-xs sm:text-sm font-medium">
          {{ confirmState.checkboxLabel || 'Confirm option' }}
        </span>
      </label>
    </div>

    <template #footer>
      <Button v-if="!confirmState.isAlert" variant="secondary" :disabled="confirmState.loading" @click="handleCancel">
        {{ confirmState.textCancel }}
      </Button>
      <Button :variant="confirmState.type" :disabled="isConfirmDisabled" :loading="confirmState.loading"
        @click="handleConfirm">
        {{ confirmState.textConfirm }}
      </Button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Modal from './Modal.vue'
import Button from './Button.vue'
import { confirmState } from '../../composables/ui'

// Kalau confirmValue tidak di-set, dianggap selalu "match" (tidak ada syarat ketik)
const isValueMatched = computed(() => {
  if (!confirmState.confirmValue) return true

  const typed = confirmState.caseSensitiveConfirmValue
    ? confirmState.typedValue
    : confirmState.typedValue.toLowerCase()
  const target = confirmState.caseSensitiveConfirmValue
    ? confirmState.confirmValue
    : confirmState.confirmValue.toLowerCase()

  return typed === target
})

const isConfirmDisabled = computed(() => !isValueMatched.value || confirmState.loading)

// Menutup dialog & menyelesaikan promise, mencegah resolve dipanggil dua kali
const settle = (result: boolean) => {
  confirmState.resolve?.(result)
  confirmState.resolve = undefined
  confirmState.open = false
}

const handleConfirm = async () => {
  if (isConfirmDisabled.value) return
  const hasOnConfirm = !!confirmState.onConfirm
  if (hasOnConfirm) {
    confirmState.loading = true
  }
  try {
    await confirmState.onConfirm?.(confirmState.typedValue, confirmState.checkboxValue)
    settle(true)
  } finally {
    if (hasOnConfirm) {
      confirmState.loading = false
    }
  }
}

const handleCancel = () => {
  confirmState.onCancel?.()
  settle(false)
}

// Dipanggil saat modal ditutup lewat backdrop / Esc / tombol X
const handleModalClose = () => {
  if (confirmState.resolve) {
    handleCancel()
  }
}
</script>