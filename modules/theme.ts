import { defineNuxtModule } from '@nuxt/kit'

export interface NuxtUiOptions {
  /**
   * Master border-radius CSS variable (--radius).
   * All sm, md, lg, xl, 2xl, 3xl tokens scale automatically from this value.
   * @default '0.55rem'
   */
  radius?: string

  /**
   * Default theme mode when no user preference is saved in localStorage.
   * @default 'system'
   */
  defaultTheme?: 'light' | 'dark' | 'system'

  /**
   * Primary brand color (--primary).
   * @default '#10b981'
   */
  primary?: string

  /**
   * Primary hover color in light mode (--primary-hover).
   * @default '#059669'
   */
  primaryHover?: string

  /**
   * Primary soft background in light mode (--primary-soft).
   * @default '#ecfdf5'
   */
  primarySoft?: string

  /**
   * Custom CSS variable overrides for light mode (:root).
   */
  light?: Record<string, string>

  /**
   * Custom CSS variable overrides for dark mode (html.dark).
   */
  dark?: Record<string, string>
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    nuxtUi?: NuxtUiOptions
  }
  interface NuxtOptions {
    nuxtUi?: NuxtUiOptions
  }
  interface PublicRuntimeConfig {
    nuxtUi: Required<Pick<NuxtUiOptions, 'radius' | 'defaultTheme' | 'primary' | 'primaryHover' | 'primarySoft'>> & {
      light: Record<string, string>
      dark: Record<string, string>
    }
  }
}

export default defineNuxtModule<NuxtUiOptions>({
  meta: {
    name: 'nuxt-ui-theme',
    configKey: 'nuxtUi'
  },
  defaults: {
    radius: '0.55rem',
    defaultTheme: 'system',
    primary: '#10b981',
    primaryHover: '#059669',
    primarySoft: '#ecfdf5',
    light: {},
    dark: {}
  },
  setup(options, nuxt) {
    // 1. Expose merged options to runtimeConfig.public.nuxtUi
    nuxt.options.runtimeConfig.public.nuxtUi = {
      radius: options.radius || '0.55rem',
      defaultTheme: options.defaultTheme || 'system',
      primary: options.primary || '#10b981',
      primaryHover: options.primaryHover || '#059669',
      primarySoft: options.primarySoft || '#ecfdf5',
      light: options.light || {},
      dark: options.dark || {}
    }

    // 2. Build dynamic CSS variables block for SSR <head> so there is zero FOUC
    const rootVars: string[] = []
    if (options.radius) rootVars.push(`--radius: ${options.radius};`)
    if (options.primary) rootVars.push(`--primary: ${options.primary};`)
    if (options.primaryHover) rootVars.push(`--primary-hover: ${options.primaryHover};`)
    if (options.primarySoft) rootVars.push(`--primary-soft: ${options.primarySoft};`)

    if (options.light) {
      for (const [key, val] of Object.entries(options.light)) {
        const varName = key.startsWith('--') ? key : `--${key}`
        rootVars.push(`${varName}: ${val};`)
      }
    }

    const darkVars: string[] = []
    if (options.primary) darkVars.push(`--primary: ${options.primary};`)
    if (options.dark) {
      for (const [key, val] of Object.entries(options.dark)) {
        const varName = key.startsWith('--') ? key : `--${key}`
        darkVars.push(`${varName}: ${val};`)
      }
    }

    const cssContent = [
      rootVars.length ? `:root { ${rootVars.join(' ')} }` : '',
      darkVars.length ? `html.dark, .dark { ${darkVars.join(' ')} }` : ''
    ].filter(Boolean).join('\n')

    nuxt.options.app.head = nuxt.options.app.head || {}
    nuxt.options.app.head.style = nuxt.options.app.head.style || []
    if (cssContent) {
      nuxt.options.app.head.style.push({
        innerHTML: cssContent,
        id: 'nuxt-ui-theme-vars'
      } as any)
    }

    // 3. Inject early FOUC-free theme & radius hydration script in <head>
    const defaultMode = options.defaultTheme || 'system'
    const defaultRadius = options.radius || '0.55rem'
    nuxt.options.app.head.script = nuxt.options.app.head.script || []
    nuxt.options.app.head.script.push({
      id: 'nuxt-ui-theme-init',
      type: 'text/javascript',
      innerHTML: `(function(){try{var t=localStorage.getItem('theme');var d='${defaultMode}';var s=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&(d==='dark'||(d==='system'&&s)))){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}var r=localStorage.getItem('theme-radius')||'${defaultRadius}';if(r){document.documentElement.style.setProperty('--radius',r);}}catch(e){}})();`
    } as any)
  }
})

