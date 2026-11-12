<script setup lang="ts">
import { onMounted, onBeforeUnmount, computed } from 'vue'
import { Toaster as Sonner, toast } from 'vue-sonner'
import 'vue-sonner/style.css'
import { useTheme } from '~/composables/useTheme'

interface ToasterProps {
  theme?: 'light' | 'dark' | 'system'
  closeButton?: boolean
  richColors?: boolean
  expand?: boolean
  duration?: number
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'
  visibleToasts?: number
}

const props = withDefaults(defineProps<ToasterProps>(), {
  theme: 'system',
  closeButton: true,
  richColors: true,
  position: 'top-right',
})

const { isDark } = useTheme()
const activeTheme = computed(() => {
  if (props.theme && props.theme !== 'system') return props.theme
  return isDark.value ? 'dark' : 'light'
})

const copyToClipboard = (text: string): Promise<void> => {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
  } else {
    return new Promise((resolve, reject) => {
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.top = '0'
        textArea.style.left = '0'
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        if (successful) {
          resolve()
        } else {
          reject(new Error('Fallback copy failed'))
        }
      } catch (err) {
        reject(err)
      }
    })
  }
}

const handleToastClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const iconEl = target.closest('[data-sonner-toast] [data-icon]') as HTMLElement | null
  if (!iconEl) return

  event.stopPropagation()
  event.preventDefault()

  const toastEl = target.closest('[data-sonner-toast]')
  if (!toastEl) return

  const titleEl = toastEl.querySelector('[data-title]')
  const descriptionEl = toastEl.querySelector('[data-description]')

  const titleText = titleEl?.textContent?.trim() || ''
  const descText = descriptionEl?.textContent?.trim() || ''
  const messageToCopy = descText ? `${titleText}\n${descText}` : titleText

  if (messageToCopy) {
    copyToClipboard(messageToCopy)
      .then(() => {
        iconEl.classList.add('copied')
        setTimeout(() => {
          iconEl.classList.remove('copied')
        }, 2000)
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err)
      })
  }
}

const handleMouseOver = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const iconEl = target.closest('[data-sonner-toast] [data-icon]') as HTMLElement | null
  if (iconEl && !iconEl.hasAttribute('title')) {
    iconEl.setAttribute('title', 'Click to copy message')
  }
}

onMounted(() => {
  document.addEventListener('click', handleToastClick, true)
  document.addEventListener('mouseover', handleMouseOver, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleToastClick, true)
  document.removeEventListener('mouseover', handleMouseOver, true)
})
</script>

<template>
  <Sonner class="toaster group" v-bind="props" :theme="activeTheme" :toast-options="{
    classes: {
      toast: 'group toast group-[.toaster]:bg-white dark:group-[.toaster]:bg-theme-card group-[.toaster]:text-slate-900 dark:group-[.toaster]:text-slate-50 group-[.toaster]:border-slate-200 dark:group-[.toaster]:border-theme-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-3',
      description: 'group-[.toast]:text-slate-505 dark:group-[.toast]:text-slate-400',
      actionButton: 'group-[.toast]:bg-slate-900 group-[.toast]:text-slate-50 dark:group-[.toast]:bg-slate-50 dark:group-[.toast]:text-slate-900',
      cancelButton: 'group-[.toast]:bg-slate-100 group-[.toast]:text-slate-505 dark:group-[.toast]:bg-theme-hover dark:group-[.toast]:text-slate-400',
      closeButton: 'dark:!bg-transparent dark:!border-none dark:!shadow-none dark:text-slate-400 dark:hover:text-white',
    },
  }" />
</template>

<style>
/* 
  Pindahkan tombol close (x) ke dalam toast di sebelah kanan (sebagai bagian dari flex layout)
*/
[data-sonner-toast] [data-close-button] {
  position: static !important;
  transform: none !important;
  margin-left: auto !important;
  flex-shrink: 0 !important;
  order: 99 !important;
  width: 24px !important;
  height: 24px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  /* Memastikan tombol close selalu berada paling kanan */
}

[data-sonner-toast] [data-close-button] svg {
  width: 16px !important;
  height: 16px !important;
  stroke-width: 2px !important;
}

/* 
  Di Dark Mode: tombol close (X) tanpa background dan border, hanya icon X saja
*/
.dark [data-sonner-toast] [data-close-button],
[data-sonner-theme='dark'] [data-sonner-toast] [data-close-button],
.dark [data-rich-colors='true'][data-sonner-toast] [data-close-button],
[data-sonner-theme='dark'][data-rich-colors='true'] [data-close-button] {
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  border-color: transparent !important;
  box-shadow: none !important;
  color: #94a3b8 !important;
  opacity: 0.8 !important;
  transition: opacity 150ms ease, color 150ms ease !important;
}

.dark [data-sonner-toast] [data-close-button]:hover,
[data-sonner-theme='dark'] [data-sonner-toast] [data-close-button]:hover,
.dark [data-rich-colors='true'][data-sonner-toast] [data-close-button]:hover,
[data-sonner-theme='dark'][data-rich-colors='true'] [data-close-button]:hover {
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  border-color: transparent !important;
  box-shadow: none !important;
  color: #f8fafc !important;
  opacity: 1 !important;
}

.dark [data-sonner-toast] [data-close-button]:focus-visible,
[data-sonner-theme='dark'] [data-sonner-toast] [data-close-button]:focus-visible {
  box-shadow: none !important;
  outline: none !important;
}

/* 
  Saat toast mulai menghilang (data-removed="true"):
  1. Geser ke arah kanan luar layar (translateX 100%).
  2. Set opacity memudar ke 0 secara halus.
*/
[data-sonner-toast][data-removed="true"] {
  opacity: 0 !important;
  transform: translateX(100%) !important;
  transition: opacity 150ms ease-in, transform 180ms ease-in !important;
}

@media (max-width: 640px) {
  /* Match toast styling with the active theme on mobile screens */
  [data-sonner-toast] {
    background: var(--bg-card, #ffffff) !important;
    background-color: var(--bg-card, #ffffff) !important;
    color: var(--text-primary, #0f172a) !important;
    border-color: var(--border-default, #e2e8f0) !important;
  }
  [data-sonner-toast] [data-title] {
    color: var(--text-primary, #0f172a) !important;
  }
  [data-sonner-toast] [data-description] {
    color: var(--text-muted, #64748b) !important;
  }

  .dark [data-sonner-toast],
  [data-sonner-theme='dark'] [data-sonner-toast],
  html.dark [data-sonner-toast] {
    background: var(--bg-card, #22252e) !important;
    background-color: var(--bg-card, #22252e) !important;
    color: var(--text-primary, #ffffff) !important;
    border-color: var(--border-default, #272b34) !important;
  }
  .dark [data-sonner-toast] [data-title],
  [data-sonner-theme='dark'] [data-sonner-toast] [data-title],
  html.dark [data-sonner-toast] [data-title] {
    color: var(--text-primary, #ffffff) !important;
  }
  .dark [data-sonner-toast] [data-description],
  [data-sonner-theme='dark'] [data-sonner-toast] [data-description],
  html.dark [data-sonner-toast] [data-description] {
    color: var(--text-muted, #94a3b8) !important;
  }
}
</style>
