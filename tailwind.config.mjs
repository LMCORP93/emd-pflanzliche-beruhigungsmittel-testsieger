/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      // ── Colors (Webflow :root CSS variables) ────────────────────────
      colors: {
        // Primary
        orange: '#ef7a1a',
        'primary-darker': '#b13b41',
        'linear-bg-2': '#7a1b1c',

        // Text
        'text-dark': 'black',
        'text-white': 'white',
        'text-muted': 'rgba(0, 0, 0, 0.6)',
        'text-light': '#f2f2f2',

        // Backgrounds
        'bg-primary': 'white',
        'bg-secondary': '#f8f8f8',
        'bg-tertiary': '#ededed',
        'grey-bg': '#f4f2ec',
        'blue-bg': '#ecf1ff',
        'bg-yellow-light': '#fcfcd0',

        // Borders
        'border-color': '#e0e0e0',

        // Semantic / Accents
        red: '#e25b5b',
        'yellow-primary': '#fee050',
        'yellow-light-secondary': '#ffffc6',
        yellow: '#fcedcd',

        // Hover
        'hover-btn': 'black',
      },

      // ── Font Families (Webflow :root CSS variables) ─────────────────
      fontFamily: {
        primary: ['Archivo', 'sans-serif'],
        secondary: ['Archivo', 'sans-serif'],
      },

      // ── Font Size Scale (Webflow clamp values) ──────────────────────
      fontSize: {
        // Headings – Webflow clamp values
        'h1': ['clamp(2rem, 1.333rem + 3.333vw, 4rem)', { lineHeight: '1.1', fontWeight: '700' }],
        'h2': ['clamp(1.75rem, 1.2857rem + 1.4286vw, 2.5rem)', { lineHeight: '1.2', fontWeight: '700' }],
        'h3': ['clamp(1.375rem, 1.0714rem + .9524vw, 1.875rem)', { lineHeight: '1.3', fontWeight: '700' }],
        'h4': ['clamp(1.125rem, .9643rem + .4762vw, 1.5rem)', { lineHeight: '1.4', fontWeight: '600' }],
        'h5': ['clamp(1rem, .9286rem + .2381vw, 1.25rem)', { lineHeight: '1.4', fontWeight: '600' }],
        'h6': ['clamp(.875rem, .8393rem + .1786vw, 1rem)', { lineHeight: '1.5', fontWeight: '600' }],

        // Body text
        'paragraph': ['14px', { lineHeight: '1.6' }],

        // Responsive root
        'responsive-root': ['calc(0.625rem + 0.41666666666666663vw)', { lineHeight: '1.6' }],
      },

      // ── Max Widths (Webflow container sizes) ────────────────────────
      maxWidth: {
        'container-medium': '72rem',
        'container-large': '80rem',
        'container-cta': '54rem',
      },

      // ── Border Radius (Webflow token values) ────────────────────────
      borderRadius: {
        'card': '16px',
        'button': '8px',
        'subtle': '2px',
      },

      // ── Box Shadow (Webflow CTA card shadow) ────────────────────────
      boxShadow: {
        'cta-card': '0 6px 16px #0000001f',
      },

      // ── Spacing (Webflow padding tokens) ────────────────────────────
      spacing: {
        // Padding global
        'padding-global': '3.5rem',
        'padding-global-tablet': '1.5rem',
        'padding-global-mobile': '1.25rem',

        // Padding section vertical
        'section-small': '4.5rem',
        'section-medium': '5rem',
        'section-large': '8rem',
        'section-xsmall': '2.5rem',
        'section-tiny': '2rem',
      },
    },
  },
  plugins: [],
};
