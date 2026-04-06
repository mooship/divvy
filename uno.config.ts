import presetWind4 from '@unocss/preset-wind4'
import { defineConfig } from 'unocss'

export default defineConfig({
  presets: [presetWind4()],
  preflights: [
    {
      getCSS: () => `
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `,
    },
  ],
  theme: {
    colors: {
      bg: '#FFF8F0',
      surface: '#FFF1E6',
      coral: '#FF6B6B',
      teal: '#4ECDC4',
      ink: '#2D2016',
      muted: '#8C7A6B',
      danger: '#E85D5D',
    },
    font: {
      sans: 'Nunito Variable, sans-serif',
    },
  },
  shortcuts: {
    card: 'bg-surface rounded-xl shadow-[0_2px_8px_rgba(45,32,22,0.08)]',
    'btn-primary':
      'bg-coral text-white rounded-lg font-bold h-12 px-6 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
    'btn-ghost':
      'bg-transparent text-ink rounded-lg font-medium h-12 px-4 transition-transform active:scale-95',
    'input-text':
      'bg-white border-2 border-surface rounded-lg px-4 h-12 text-ink text-base w-full',
    'focus-ring':
      'focus-visible:outline-3 focus-visible:outline-coral focus-visible:outline-offset-2',
  },
})
