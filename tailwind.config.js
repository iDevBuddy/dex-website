/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                // ── Void Black surface system ─────────────────────────────
                dark: {
                    DEFAULT: '#050505', // The Void Black — all primary backgrounds
                    deeper: '#0A0A0B',  // Slightly lifted panel base
                    card: '#0D0D0F',    // Card / surface sheet
                    hover: '#141417',   // Hover surface
                },
                ghost: {
                    DEFAULT: '#F8F9FA', // Ghost White — primary type (never pure #fff)
                    dim: '#A1A1AA',     // Muted secondary text
                    faint: '#6B6B72',   // Tertiary / captions
                },
                // ── Soft Tech Red accent (micro-interactions only) ────────
                accent: {
                    DEFAULT: '#FF4F64', // Soft Tech Red — active states, glowing nodes
                    dim: 'rgba(255, 79, 100, 0.08)',
                    hover: '#FF3B52',
                    glow: 'rgba(255, 79, 100, 0.45)',
                },
                // Legacy alias kept so old components don't break — remapped to red
                cobalt: {
                    DEFAULT: '#FF4F64',
                    dim: 'rgba(255, 79, 100, 0.08)',
                    hover: '#FF3B52',
                },
                border: {
                    DEFAULT: 'rgba(255, 255, 255, 0.06)', // hairline on void
                    hover: 'rgba(255, 255, 255, 0.12)',
                },
            },
            fontFamily: {
                sans: ['Manrope', 'system-ui', 'sans-serif'],
                display: ['Sora', 'system-ui', 'sans-serif'], // Geometric headings
                mono: ['IBM Plex Mono', 'monospace'],
            },
            letterSpacing: {
                tightest: '-0.03em',
            },
            keyframes: {
                'dot-travel': {
                    '0%': { offsetDistance: '0%' },
                    '100%': { offsetDistance: '100%' },
                },
            },
        },
    },
    plugins: [],
}
