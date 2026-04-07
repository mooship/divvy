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

        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-slide-up {
          animation: slide-up 250ms ease-out;
        }

        .animate-fade-in {
          animation: fade-in 200ms ease-out;
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
      sans: '"Nunito Variable", "Nunito Variable fallback", sans-serif',
    },
  },
  shortcuts: {
    card: 'bg-surface rounded-2xl shadow-[0_2px_16px_rgba(255,107,107,0.10)]',
    'btn-primary':
      'flex items-center justify-center gap-2 bg-gradient-to-b from-[#FF9090] to-coral text-white rounded-2xl font-bold min-h-12 px-6 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
    'btn-ghost':
      'flex items-center justify-center gap-2 bg-transparent text-ink rounded-2xl font-medium min-h-12 px-4 transition-transform active:scale-95',
    'btn-icon-delete':
      'flex items-center justify-center p-2 min-w-11 min-h-11 shrink-0 text-muted hover:text-danger transition-colors focus-ring rounded-lg',
    'input-text':
      'bg-white border-2 border-surface rounded-xl px-4 min-h-12 text-ink text-base w-full',
    'section-label': 'text-xs font-bold text-muted',
    'focus-ring':
      'focus-visible:outline-3 focus-visible:outline-coral focus-visible:outline-offset-2',
  },
})
