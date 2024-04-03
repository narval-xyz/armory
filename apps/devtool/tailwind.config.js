/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      boxShadow: {
        nar: '4px 4px 4px rgba(0, 0, 0, 0.1)'
      },
      colors: {
        'icon-gray-light': '#A8B0B9',
        'icon-gray-dark': '#71717a',
        'nar-blue': '#0A6BFF',
        'nar-blue-light': '#B9D5FF',
        'nar-blue-lighter': '#458FFF',
        'nar-blue-dark': '#0D063A',
        'nar-cyan': '#01CFFC',
        'nar-gray': '#585C63',
        'nar-gray-dark': '#07031B',
        'nar-gray-light': '#B8B9BD',
        'nar-guild-blue': '#0D0D54',
        'nar-blue-1': '#0C1523',
        'nar-gray-1': '#3F3F3F',
        'nar-gray-2': '#505050',
        'nar-gray-3': 'rgb(47, 48, 55)',
        'nar-blue-gray': '#24242C',
        'nar-bg-dark': '#121621',
        'nar-green': '#08B82F',
        'nar-red': '#B85208',
        // New Theme Design
        'nv-black': '#08090A',
        'nv-white': '#FFFFFF',
        'nv-brand': {
          400: '#66B2FF',
          500: '#2E96FF'
        },
        'nv-accent': {
          400: '#5E41F7',
          500: '#582EFF'
        },
        'nv-danger': '#E8303D',
        'nv-warning': '#F9C50B',
        'nv-success': '#25C06D',
        'nv-neutrals': {
          25: '#DDE0E3',
          50: '#A4ABB2',
          100: '#858F98',
          200: '#656E76',
          300: '#434B54',
          400: '#2D3339 ',
          500: '#24292E',
          600: '#202428',
          700: '#1A1D21',
          800: '#14161A',
          900: '#101214'
        },
        'nv-red': {
          100: '#E8C5C7',
          200: '#F0989E',
          300: '#EF7079',
          400: '#F3545F',
          500: '#E8303D',
          600: '#C02833',
          700: '#881A22',
          800: '#5E1318',
          900: '#38090C'
        },
        'nv-orange': {
          100: '#FFEEDF',
          200: '#FFDFC2',
          300: '#FFC998',
          400: '#FFB26A',
          500: '#FF9430',
          600: '#DA802C',
          700: '#B06118',
          800: '#894608',
          900: '#341901'
        },
        'nv-yellow': {
          100: '#FEF9E6',
          200: '#FEF3CD',
          300: '#FDE79B',
          400: '#FBDB6A',
          500: '#F9C50B',
          600: '#CAA10C',
          700: '#9B7C0D',
          800: '#55460F',
          900: '#26210F'
        },
        'nv-green': {
          100: '#EAFBF2',
          200: '#D4F7E4',
          300: '#A9EEC9',
          400: '#7FE6AF',
          500: '#25C06D',
          600: '#219D5A',
          700: '#1C7948',
          800: '#16442C',
          900: '#112119'
        },
        'nv-blue': {
          100: '#E5F2FF',
          200: '#CCE5FF',
          300: '#99CCFF',
          400: '#66B2FF',
          500: '#2E96FF',
          600: '#3883CF',
          700: '#2E669F',
          800: '#093561',
          900: '#141E28'
        },
        'nv-purple': {
          100: '#E9E3FF',
          200: '#C7B9FF',
          300: '#9F87FF',
          400: '#6D49FF',
          500: '#582EFF',
          600: '#4122BC',
          700: '#321996',
          800: '#211162',
          900: '#120C28'
        },
        'nv-pink': {
          100: '#FFE7FF',
          200: '#FECEFF',
          300: '#FEACFF',
          400: '#FD82FF',
          500: '#FC5EFF',
          600: '#D951DB',
          700: '#A83EAA',
          800: '#5A205B',
          900: '#230D23'
        }
      },
      fontSize: {
        xxxs: '.5rem',
        xxs: '.65rem',
        'nv-3xs': ['10px', { lineHeight: '10px', letterSpacing: '0.02em' }],
        'nv-2xs': ['12px', { lineHeight: '16px', letterSpacing: '0.02em' }],
        'nv-xs': ['14px', { lineHeight: '20px', letterSpacing: '0.02em' }],
        'nv-sm': ['16px', { lineHeight: '24px', letterSpacing: '0.02em' }],
        'nv-md': ['18px', { lineHeight: '24px', letterSpacing: '0.02em' }],
        'nv-lg': ['20px', { lineHeight: '32px', letterSpacing: '0.02em' }],
        'nv-xl': ['24px', { lineHeight: '32px', letterSpacing: '0.02em' }],
        'nv-2xl': ['28px', { lineHeight: '36px', letterSpacing: '0.02em' }],
        'nv-3xl': ['32px', { lineHeight: '48px', letterSpacing: '0.02em' }],
        'nv-4xl': ['64px', { lineHeight: '80px', letterSpacing: '0.02em' }]
      },
      screens: {
        sm: '640px',
        // => @media (min-width: 640px) { ... }

        md: '768px',
        // => @media (min-width: 768px) { ... }

        lg: '1024px',
        // => @media (min-width: 1024px) { ... }

        xl: '1280px',
        // => @media (min-width: 1280px) { ... }

        '2xl': '1536px',
        // => @media (min-width: 1536px) { ... }

        '16in': '1800px' // Bigger than a 16" macbook pro screen
        // => @media (min-width: 1800px) { ... }
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        hide: 'hide 100ms ease-in',
        slideIn: 'slideIn 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        swipeOut: 'swipeOut 100ms ease-out',
        slideDownAndFade: 'slideDownAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideLeftAndFade: 'slideLeftAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideUpAndFade: 'slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideRightAndFade: 'slideRightAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        overlayShow: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        contentShow: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        bgBlueFlashing: 'bgBlueFlashing 1s infinite'
      },
      keyframes: {
        bgBlueFlashing: {
          '0%': { backgroundColor: '#2E96FF' },
          '50%': { backgroundColor: '#2E669F' },
          '100%': { backgroundColor: '#2E96FF' }
        },
        hide: {
          from: { opacity: 1 },
          to: { opacity: 0 }
        },
        slideIn: {
          from: { transform: 'translateX(calc(100% + var(--viewport-padding)))' },
          to: { transform: 'translateX(0)' }
        },
        swipeOut: {
          from: { transform: 'translateX(var(--radix-toast-swipe-end-x))' },
          to: { transform: 'translateX(calc(100% + var(--viewport-padding)))' }
        },
        slideDownAndFade: {
          from: { opacity: 0, transform: 'translateY(-2px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        },
        slideLeftAndFade: {
          from: { opacity: 0, transform: 'translateX(2px)' },
          to: { opacity: 1, transform: 'translateX(0)' }
        },
        slideUpAndFade: {
          from: { opacity: 0, transform: 'translateY(2px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        },
        slideRightAndFade: {
          from: { opacity: 0, transform: 'translateX(-2px)' },
          to: { opacity: 1, transform: 'translateX(0)' }
        },
        overlayShow: {
          from: { opacity: 0 },
          to: { opacity: 1 }
        },
        contentShow: {
          from: { opacity: 0, transform: 'translate(-50%, -48%) scale(0.96)' },
          to: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }
        }
      }
    }
  },
  plugins: []
}
