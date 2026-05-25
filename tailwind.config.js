/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                dark: {
                    DEFAULT: '#FFFFFF', // Clean White Paper background
                    deeper: '#F5F5F7',  // Apple Premium Light-gray surface
                    card: '#FFFFFF',    // Crisp Solid White Card sheet
                    hover: '#E8E8ED',   // Subtle Grey Hover state
                },
                accent: {
                    DEFAULT: '#0052FF', // Unified Corporate Cobalt Blue (Apple/Vercel standard)
                    dim: 'rgba(0, 82, 255, 0.04)',
                    hover: '#0040C7',
                },
                cobalt: {
                    DEFAULT: '#0052FF', // Unified Cobalt Blue
                    dim: 'rgba(0, 82, 255, 0.04)',
                    hover: '#0040C7',
                },
                border: {
                    DEFAULT: '#E5E5E7', // Fine cool-grey hairline border
                    hover: '#D1D1D6',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'sans-serif'], // Premium Headings
                mono: ['IBM Plex Mono', 'monospace'],
            },
        },
    },
    plugins: [],
}
