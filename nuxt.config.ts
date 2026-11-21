import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const currentDir = dirname(fileURLToPath(import.meta.url))

// https://nuxt.com/docs/getting-started/layers
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: [
    join(currentDir, 'modules/theme'),
    '@nuxtjs/tailwindcss'
  ],
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
      pathPrefix: false,
      ignore: ['Sidebar.vue', 'docs/**']
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
      content: [
        join(currentDir, 'components/**/*.{vue,js,ts}'),
        join(currentDir, 'pages/**/*.vue'),
        join(currentDir, 'app.vue'),
        join(currentDir, 'app/**/*.vue')
      ],
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
          },
          borderRadius: {
            'sm': 'calc(var(--radius, 0.75rem) - 4px)',
            'md': 'calc(var(--radius, 0.75rem) - 2px)',
            'lg': 'var(--radius, 0.75rem)',
            'xl': 'calc(var(--radius, 0.75rem) + 4px)',
            '2xl': 'calc(var(--radius, 0.75rem) + 8px)',
            '3xl': 'calc(var(--radius, 0.75rem) + 16px)',
            'theme': 'var(--radius, 0.75rem)',
            'theme-card': 'calc(var(--radius, 0.75rem) + 4px)',
            'theme-input': 'var(--radius, 0.75rem)',
            'theme-btn': 'var(--radius, 0.75rem)'
          }
        }
      }
    }
  }
})
