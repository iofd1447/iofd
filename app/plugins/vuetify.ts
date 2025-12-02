import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default defineNuxtPlugin((nuxtapp) => {
  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'dark',
      themes: {
        light: {
          colors: {
            background: '#f8fdf9',
            surface: '#ffffff',
            'surface-variant': '#e8f5e9',
            'surface-bright': '#ffffff',

            primary: '#2e7d32',
            'primary-darken-1': '#1b5e20',
            'primary-lighten-1': '#43a047',
            'on-primary': '#ffffff',

            secondary: '#26a69a',
            'secondary-darken-1': '#00897b',
            'secondary-lighten-1': '#4db6ac',
            'on-secondary': '#ffffff',

            tertiary: '#ff6f00',
            'tertiary-darken-1': '#e65100',
            'tertiary-lighten-1': '#ff8f00',
            'on-tertiary': '#ffffff',

            accent: '#00bcd4',
            'on-accent': '#ffffff',

            error: '#d32f2f',
            'on-error': '#ffffff',
            warning: '#f57c00',
            'on-warning': '#ffffff',
            info: '#1976d2',
            'on-info': '#ffffff',
            success: '#388e3c',
            'on-success': '#ffffff',
            mustahab: '#9CCC65',
            'on-mustahab': '#003d1a',

            'on-background': '#0d1f0d',
            'on-surface': '#1a1a1a',
            'on-surface-variant': '#37474f',

            outline: '#bdbdbd',
            'outline-variant': '#a5d6a7',
          },
          dark: false,
          variables: {
            'border-color': '#e0e0e0',
            'border-opacity': 0.15,
            'high-emphasis-opacity': 0.90,
            'medium-emphasis-opacity': 0.65,
            'disabled-opacity': 0.38,
            'idle-opacity': 0.05,
            'hover-opacity': 0.08,
            'focus-opacity': 0.15,
            'selected-opacity': 0.12,
            'activated-opacity': 0.15,
            'pressed-opacity': 0.15,
            'dragged-opacity': 0.10,
            'theme-overlay-multiplier': 1.2,
          },
        },
        dark: {
          colors: {
            background: '#0a0e0a',
            surface: '#121212',
            'surface-variant': '#1e1e1e',
            'surface-bright': '#2a2a2a',

            primary: '#69f0ae',
            'primary-darken-1': '#00e676',
            'primary-lighten-1': '#b9f6ca',
            'on-primary': '#003d1a',

            secondary: '#18ffff',
            'secondary-darken-1': '#00e5ff',
            'secondary-lighten-1': '#84ffff',
            'on-secondary': '#002e33',

            tertiary: '#ff4081',
            'tertiary-darken-1': '#f50057',
            'tertiary-lighten-1': '#ff80ab',
            'on-tertiary': '#4a0013',

            accent: '#c6ff00',
            'on-accent': '#2e3300',

            bonus: '#800080',

            error: '#ff5252',
            'on-error': '#2d0000',
            warning: '#ffc107',
            'on-warning': '#2e1f00',
            info: '#40c4ff',
            'on-info': '#002633',
            success: '#69f0ae',
            'on-success': '#003d1a',
            mustahab: '#9CCC65',
            'on-mustahab': '#003d1a',
            makruh: '#B0BEC5',
            'on-makruh': '#1A2327',


            'on-background': '#e8f5e9',
            'on-surface': '#f5f5f5',
            'on-surface-variant': '#b0bec5',

            outline: '#37474f',
            'outline-variant': '#263238'
          },
          dark: true,
          variables: {
            'border-color': '#37474f',
            'border-opacity': 0.25,
            'high-emphasis-opacity': 0.95,
            'medium-emphasis-opacity': 0.75,
            'disabled-opacity': 0.40,
            'idle-opacity': 0.10,
            'hover-opacity': 0.12,
            'focus-opacity': 0.20,
            'selected-opacity': 0.16,
            'activated-opacity': 0.20,
            'pressed-opacity': 0.20,
            'dragged-opacity': 0.15,
            'theme-overlay-multiplier': 2,
          },
        },
      },
    },
    defaults: {
      VBtn: {
        style: [
          'text-transform: none;',
          'font-weight: 600;',
          'letter-spacing: 0.3px;'
        ].join(' '),
        rounded: 'lg'
      },
      VCard: {
        rounded: 'xl',
        elevation: 3,
        style: 'transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);',
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary',
        rounded: 'lg',
      },
      VTextarea: {
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary',
        rounded: 'lg',
      },
      VSelect: {
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary',
        rounded: 'lg',
      },
      VAutocomplete: {
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary',
        rounded: 'lg',
      },
      VCombobox: {
        variant: 'outlined',
        density: 'comfortable',
        color: 'primary',
        rounded: 'lg',
      },
      VChip: {
        rounded: 'lg',
        elevation: 1,
        style: 'font-weight: 500;',
      },
      VAlert: {
        rounded: 'xl',
        elevation: 2,
        style: 'font-weight: 500;',
      },
      VAppBar: {
        elevation: 0,
        style: 'backdrop-filter: blur(10px); border-bottom: 1px solid rgba(var(--v-border-color), 0.12);',
      },
      VNavigationDrawer: {
        elevation: 4,
      },
      VDivider: {
        opacity: 0.15,
      },
    },
  })

  nuxtapp.vueApp.use(vuetify)
})