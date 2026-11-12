import { reactive } from 'vue'

export type ConfirmType = 'primary' | 'secondary' | 'success' | 'warning' | 'danger'

export interface ConfirmOptions {
    title?: string
    message?: string
    textCancel?: string
    textConfirm?: string
    /** Warna tombol confirm. Default: 'danger' */
    type?: ConfirmType
    onConfirm?: (value: string, checked?: boolean) => void | Promise<void>
    onCancel?: () => void
    /**
     * Kalau diisi, user WAJIB mengetik teks ini persis sama sebelum tombol
     * confirm aktif. Contoh: minta user mengetik nama resource sebelum hapus.
     */
    confirmValue?: string
    /** Label/instruksi di atas input type-to-confirm. Kalau kosong, dibuat otomatis. */
    confirmValueLabel?: string
    /** Placeholder input type-to-confirm. */
    confirmValuePlaceholder?: string
    /** Default true (huruf besar/kecil harus sama persis) */
    caseSensitiveConfirmValue?: boolean
    /** Tampilkan text input bebas (misal untuk isi alasan) */
    promptInput?: boolean
    /** Mode input untuk promptInput: 'input' (default) atau 'textarea' */
    inputMode?: 'input' | 'textarea'
    /** Label di atas input bebas */
    promptInputLabel?: string
    /** Placeholder input bebas */
    promptInputPlaceholder?: string
    isAlert?: boolean
    /** Tampilkan checkbox opsional */
    checkbox?: boolean
    checkboxLabel?: string
    checkboxDefault?: boolean
}

interface ConfirmState {
    open: boolean
    title: string
    message: string
    textCancel: string
    textConfirm: string
    type: ConfirmType
    confirmValue?: string
    confirmValueLabel?: string
    confirmValuePlaceholder?: string
    caseSensitiveConfirmValue: boolean
    typedValue: string
    loading: boolean
    onConfirm?: (value: string, checked?: boolean) => void | Promise<void>
    onCancel?: () => void
    resolve?: (value: boolean) => void
    promptInput: boolean
    inputMode: 'input' | 'textarea'
    promptInputLabel?: string
    promptInputPlaceholder?: string
    isAlert: boolean
    checkbox: boolean
    checkboxLabel?: string
    checkboxValue: boolean
}

export const confirmState = reactive<ConfirmState>({
    open: false,
    title: 'Are you sure?',
    message: '',
    textCancel: 'Cancel',
    textConfirm: 'Confirm',
    type: 'danger',
    confirmValue: undefined,
    confirmValueLabel: undefined,
    confirmValuePlaceholder: undefined,
    caseSensitiveConfirmValue: true,
    typedValue: '',
    loading: false,
    onConfirm: undefined,
    onCancel: undefined,
    resolve: undefined,
    promptInput: false,
    inputMode: 'input',
    promptInputLabel: undefined,
    promptInputPlaceholder: undefined,
    isAlert: false,
    checkbox: false,
    checkboxLabel: undefined,
    checkboxValue: false
})

/**
 * Panggil dari mana saja: komponen, composable, store, dll.
 *
 * ui.confirm({ title, message, onConfirm })
 *
 * Bisa juga di-await untuk gaya promise:
 *   const confirmed = await ui.confirm({ title: 'Yakin?' })
 *   if (confirmed) { ... }
 */
function confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
        confirmState.title = options.title ?? 'Are you sure?'
        confirmState.message = options.message ?? ''
        confirmState.textCancel = options.textCancel ?? 'Cancel'
        confirmState.textConfirm = options.textConfirm ?? 'Confirm'
        confirmState.type = options.type ?? 'danger'
        confirmState.confirmValue = options.confirmValue
        confirmState.confirmValueLabel = options.confirmValueLabel
        confirmState.confirmValuePlaceholder = options.confirmValuePlaceholder
        confirmState.caseSensitiveConfirmValue = options.caseSensitiveConfirmValue ?? true
        confirmState.promptInput = options.promptInput ?? false
        confirmState.inputMode = options.inputMode ?? 'input'
        confirmState.promptInputLabel = options.promptInputLabel
        confirmState.promptInputPlaceholder = options.promptInputPlaceholder
        confirmState.typedValue = ''
        confirmState.loading = false
        confirmState.isAlert = false
        confirmState.onConfirm = options.onConfirm
        confirmState.onCancel = options.onCancel
        confirmState.resolve = resolve
        confirmState.checkbox = options.checkbox ?? false
        confirmState.checkboxLabel = options.checkboxLabel
        confirmState.checkboxValue = options.checkboxDefault ?? false
        confirmState.open = true
    })
}

export interface AlertOptions {
    title?: string
    message?: string
    textConfirm?: string
    type?: ConfirmType
    onConfirm?: () => void | Promise<void>
}

/**
 * Tampilkan modal alert sederhana dengan satu tombol saja (tanpa tombol Cancel).
 *
 * ui.alert({ title: 'Sukses', message: 'Data berhasil disimpan!', type: 'success' })
 */
function alert(options: AlertOptions): Promise<boolean> {
    return new Promise((resolve) => {
        confirmState.title = options.title ?? 'Notification'
        confirmState.message = options.message ?? ''
        confirmState.textCancel = ''
        confirmState.textConfirm = options.textConfirm ?? 'OK'
        confirmState.type = options.type ?? 'primary'
        confirmState.confirmValue = undefined
        confirmState.confirmValueLabel = undefined
        confirmState.confirmValuePlaceholder = undefined
        confirmState.caseSensitiveConfirmValue = true
        confirmState.promptInput = false
        confirmState.checkbox = false
        confirmState.checkboxLabel = undefined
        confirmState.checkboxValue = false
        confirmState.promptInputLabel = undefined
        confirmState.promptInputPlaceholder = undefined
        confirmState.typedValue = ''
        confirmState.loading = false
        confirmState.isAlert = true
        confirmState.onConfirm = options.onConfirm ? () => options.onConfirm!() : undefined
        confirmState.onCancel = undefined
        confirmState.resolve = resolve
        confirmState.open = true
    })
}

export interface LoadingOptions {
    title?: string
    message?: string
    onCancel?: () => void
}

interface LoadingState {
    open: boolean
    title?: string
    message: string
    onCancel?: () => void
}

export const loadingState = reactive<LoadingState>({
    open: false,
    title: undefined,
    message: '',
    onCancel: undefined
})

function loading(showOrOptions?: boolean | LoadingOptions | string, options: LoadingOptions = {}) {
    if (typeof showOrOptions === 'boolean') {
        if (showOrOptions) {
            loadingState.title = options.title
            loadingState.message = options.message ?? 'Loading...'
            loadingState.onCancel = options.onCancel
            loadingState.open = true
        } else {
            loadingState.open = false
            loadingState.title = undefined
            loadingState.onCancel = undefined
        }
    } else if (typeof showOrOptions === 'string') {
        loadingState.title = options.title
        loadingState.message = showOrOptions
        loadingState.onCancel = options.onCancel
        loadingState.open = true
    } else if (typeof showOrOptions === 'object' && showOrOptions !== null) {
        loadingState.title = showOrOptions.title
        loadingState.message = showOrOptions.message ?? 'Loading...'
        loadingState.onCancel = showOrOptions.onCancel
        loadingState.open = true
    } else {
        loadingState.title = undefined
        loadingState.message = 'Loading...'
        loadingState.onCancel = undefined
        loadingState.open = true
    }
}

function closeLoading() {
    loadingState.open = false
    loadingState.title = undefined
    loadingState.onCancel = undefined
}

export const ui = {
    confirm,
    alert,
    loading,
    closeLoading
}

export { confirm, alert, loading, closeLoading }

export const useUi = () => ui