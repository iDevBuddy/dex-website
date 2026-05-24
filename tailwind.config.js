/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                dark: {
                    DEFAULT: '#000000', // Absolute Pitch Black
                    deeper: '#080808',  // Deep Obsidian Slate
                    card: '#0F0F11',    // Muted Titanium Gray Card
                    hover: '#1E1E22',   // Brushed Titanium Hover
                },
                accent: {
                    DEFAULT: '#0052FF', // Electric/Cobalt Blue (Apple Link/Active)
                    dim: 'rgba(0, 82, 255, 0.08)',
                    hover: '#0046DB',
                },
                cobalt: {
                    DEFAULT: '#0052FF', // Unified Cobalt Blue
                    dim: 'rgba(0, 82, 255, 0.08)',
                    hover: '#0046DB',
                },
                border: {
                    DEFAULT: 'rgba(255, 255, 255, 0.08)', // Apple Micro-thin hairline border
                    hover: 'rgba(255, 255, 255, 0.16)',
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
