/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                // ── Light agency base (White dominant) ────────────────────
                // `dark` key kept so existing `bg-dark` references flip to white
                dark: {
                    DEFAULT: '#FFFFFF', // White — primary background
                    deeper: '#FAFAFA',  // Subtle off-white surface
                    card: '#FFFFFF',    // Card sheet
                    hover: '#F2F2F2',   // Hover surface
                },
                // Full-black sections (hero, services)
                night: {
                    DEFAULT: '#121212', // Night
                    soft: '#1A1A1A',    // Lifted night surface
                    line: 'rgba(255,255,255,0.08)',
                },
                // Text — `ghost` key kept; now near-black on white
                ghost: {
                    DEFAULT: '#141414', // Primary text
                    dim: '#6B6B6B',     // Muted secondary
                    faint: '#9B9B9B',   // Tertiary / captions
                },
                // ── Candy Apple Red accent ────────────────────────────────
                accent: {
                    DEFAULT: '#DD0426', // Candy Apple Red
                    dim: 'rgba(221, 4, 38, 0.06)',
                    hover: '#B80320',
                    glow: 'rgba(221, 4, 38, 0.35)',
                },
                cobalt: {
                    DEFAULT: '#DD0426',
                    dim: 'rgba(221, 4, 38, 0.06)',
                    hover: '#B80320',
                },
                border: {
                    DEFAULT: '#E5E5E5', // Light hairline
                    hover: '#D4D4D4',
                },
            },
            fontFamily: {
                sans: ['Hanken Grotesk', 'system-ui', 'sans-serif'],
                display: ['Schibsted Grotesk', 'Hanken Grotesk', 'sans-serif'],
                mono: ['IBM Plex Mono', 'monospace'],
            },
            letterSpacing: {
                tightest: '-0.03em',
            },
        },
    },
    plugins: [],
}
