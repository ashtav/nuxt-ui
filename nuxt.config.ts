import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const currentDir = dirname(fileURLToPath(import.meta.url))

// https://nuxt.com/docs/getting-started/layers
export default defineNuxtConfig({
  components: [
    {
      path: join(currentDir, 'components/form'),
      prefix: 'Form',
      pathPrefix: false
    },
    {
      path: join(currentDir, 'components/ui'),
      prefix: 'Ui',
      pathPrefix: false
    },
    {
      path: join(currentDir, 'components'),
      pathPrefix: false
    }
  ],
  css: [
    join(currentDir, 'assets/css/hgi-stroke-rounded.css'),
    join(currentDir, 'assets/scss/main.scss')
  ],
  // @ts-ignore
  tailwindcss: {
    config: {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            'theme-app': 'var(--bg-app)',
            'theme-card': 'var(--bg-card)',
            'theme-hover': 'var(--bg-hover)',
            'theme-input': 'var(--bg-input)',
            'theme-border': 'var(--border-default)',
            'theme-border-input': 'var(--border-input)',
            'theme-range-bg': 'var(--date-range-bg)',
            'theme-range-text': 'var(--date-range-text)',
            'theme-primary': 'var(--primary)',
            'theme-primary-hover': 'var(--primary-hover)',
            'theme-primary-soft': 'var(--primary-soft)'
          },
          borderColor: {
            'theme-border': 'var(--border-default)',
            'theme-default': 'var(--border-default)',
            'theme-card': 'var(--border-default)',
            'theme-input': 'var(--border-input)'
          },
          divideColor: {
            'theme-border': 'var(--border-default)',
            'theme-default': 'var(--border-default)',
            'theme-card': 'var(--border-default)',
            'theme-input': 'var(--border-input)'
          }
        }
      }
    }
  }
})
